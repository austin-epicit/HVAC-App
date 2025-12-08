import { ZodError } from "zod";
import { visit_status, schedule_type } from "../../generated/prisma/enums.js";
import { db } from "../db.js";
import { createJobVisitSchema, updateJobVisitSchema } from "../lib/validate/jobVisits.js";
import { Request } from "express";

export const getAllJobVisits = async () => {
	return await db.job_visit.findMany({
		include: {
			job: {
				include: {
					client: true,
				},
			},
			visit_techs: {
				include: {
					tech: true,
				},
			},
			notes: true,
		},
	});
};

export const getJobVisitById = async (id: string) => {
	return await db.job_visit.findFirst({
		where: { id: id },
		include: {
			job: {
				include: {
					client: true,
				},
			},
			visit_techs: {
				include: {
					tech: true,
				},
			},
			notes: true,
		},
	});
};

export const getJobVisitsByJobId = async (jobId: string) => {
	return await db.job_visit.findMany({
		where: { job_id: jobId },
		include: {
			visit_techs: {
				include: {
					tech: true,
				},
			},
			notes: true,
		},
		orderBy: {
			scheduled_start_at: "asc",
		},
	});
};

export const getJobVisitsByTechId = async (techId: string) => {
	return await db.job_visit.findMany({
		where: {
			visit_techs: {
				some: {
					tech_id: techId,
				},
			},
		},
		include: {
			job: {
				include: {
					client: true,
				},
			},
			visit_techs: {
				include: {
					tech: true,
				},
			},
			notes: true,
		},
		orderBy: {
			scheduled_start_at: "asc",
		},
	});
};

export const getJobVisitsByDateRange = async (startDate: Date, endDate: Date) => {
	return await db.job_visit.findMany({
		where: {
			OR: [
				{
					scheduled_start_at: {
						gte: startDate,
						lte: endDate,
					},
				},
				{
					scheduled_end_at: {
						gte: startDate,
						lte: endDate,
					},
				},
			],
		},
		include: {
			job: {
				include: {
					client: true,
				},
			},
			visit_techs: {
				include: {
					tech: true,
				},
			},
			notes: true,
		},
		orderBy: {
			scheduled_start_at: "asc",
		},
	});
};

export const insertJobVisit = async (req: Request) => {
	try {
		const parsed = createJobVisitSchema.parse(req.body);

		// Verify job exists
		const job = await db.job.findUnique({
			where: { id: parsed.job_id },
		});

		if (!job) {
			return { err: "Invalid job id" };
		}

		// Verify technicians exist
		if (parsed.tech_ids && parsed.tech_ids.length > 0) {
			const existingTechs = await db.technician.findMany({
				where: { id: { in: parsed.tech_ids } },
				select: { id: true },
			});
			const existingIds = new Set(existingTechs.map((t) => t.id));
			const missing = parsed.tech_ids.filter((id) => !existingIds.has(id));
			if (missing.length > 0) {
				return {
					err: `Technicians not found: ${missing.join(", ")}`,
				};
			}
		}

		const created = await db.$transaction(async (tx) => {
			const visit = await tx.job_visit.create({
				data: {
					job_id: parsed.job_id,
					schedule_type: parsed.schedule_type as schedule_type,
					scheduled_start_at: parsed.scheduled_start_at,
					scheduled_end_at: parsed.scheduled_end_at,
					arrival_window_start: parsed.arrival_window_start,
					arrival_window_end: parsed.arrival_window_end,
					status: parsed.status as visit_status,
				},
			});

			// Assign technicians to visit
			if (parsed.tech_ids && parsed.tech_ids.length > 0) {
				await tx.job_visit_technician.createMany({
					data: parsed.tech_ids.map((tech_id) => ({
						visit_id: visit.id,
						tech_id,
					})),
					skipDuplicates: true,
				});
			}

			// Update job status if needed
			if (parsed.status === "Scheduled" && job.status === "Unscheduled") {
				await tx.job.update({
					where: { id: parsed.job_id },
					data: { status: "Scheduled" },
				});
			}

			return tx.job_visit.findUnique({
				where: { id: visit.id },
				include: {
					job: {
						include: {
							client: true,
						},
					},
					visit_techs: {
						include: { tech: true },
					},
					notes: true,
				},
			});
		});

		return { err: "", item: created ?? undefined };
	} catch (e) {
		if (e instanceof ZodError) {
			return {
				err: `Validation failed: ${e.issues
					.map((err) => err.message)
					.join(", ")}`,
			};
		}
		console.error("Error inserting job visit:", e);
		return { err: "Internal server error" };
	}
};

export const updateJobVisit = async (req: Request) => {
	try {
		const id = (req as any).params.id;
		const updates = updateJobVisitSchema.parse((req as any).body);

		const existingVisit = await db.job_visit.findUnique({
			where: { id },
			include: { job: true },
		});

		if (!existingVisit) {
			return { err: "Job visit not found" };
		}

		// Build update data
		const updateData: Record<string, any> = {};

		const allowedFields = [
			"schedule_type",
			"scheduled_start_at",
			"scheduled_end_at",
			"arrival_window_start",
			"arrival_window_end",
			"actual_start_at",
			"actual_end_at",
			"status",
		] as const;

		for (const key of allowedFields) {
			if (updates[key] !== undefined) {
				updateData[key] = updates[key];
			}
		}

		const updated = await db.$transaction(async (tx) => {
			const visit = await tx.job_visit.update({
				where: { id },
				data: updateData,
				include: {
					job: true,
					visit_techs: {
						include: { tech: true },
					},
					notes: true,
				},
			});

			// Update job status based on visit status
			if (updates.status) {
				const allVisits = await tx.job_visit.findMany({
					where: { job_id: existingVisit.job_id },
				});

				let newJobStatus = existingVisit.job.status;
				if (allVisits.every((v) => v.status === "Completed")) {
					newJobStatus = "Completed";
				} else if (allVisits.some((v) => v.status === "InProgress")) {
					newJobStatus = "InProgress";
				} else if (allVisits.some((v) => v.status === "Scheduled")) {
					newJobStatus = "Scheduled";
				}

				if (newJobStatus !== existingVisit.job.status) {
					await tx.job.update({
						where: { id: existingVisit.job_id },
						data: { status: newJobStatus },
					});
				}
			}

			return visit;
		});

		return { err: "", item: updated };
	} catch (e) {
		if (e instanceof ZodError) {
			return {
				err: `Validation failed: ${e.issues
					.map((err) => err.message)
					.join(", ")}`,
			};
		}
		console.error("Failed to update job visit:", e);
		return { err: "Failed to update job visit" };
	}
};

export const assignTechniciansToVisit = async (
	visitId: string,
	techIds: string[]
) => {
	try {
		// Verify visit exists
		const visit = await db.job_visit.findUnique({
			where: { id: visitId },
		});

		if (!visit) {
			return { err: "Job visit not found" };
		}

		// Verify technicians exist
		const existingTechs = await db.technician.findMany({
			where: { id: { in: techIds } },
			select: { id: true },
		});

		const existingIds = new Set(existingTechs.map((t) => t.id));
		const missing = techIds.filter((id) => !existingIds.has(id));

		if (missing.length > 0) {
			return {
				err: `Technicians not found: ${missing.join(", ")}`,
			};
		}

		await db.$transaction(async (tx) => {
			// Remove existing assignments
			await tx.job_visit_technician.deleteMany({
				where: { visit_id: visitId },
			});

			// Create new assignments
			await tx.job_visit_technician.createMany({
				data: techIds.map((tech_id) => ({
					visit_id: visitId,
					tech_id,
				})),
			});
		});

		const updated = await db.job_visit.findUnique({
			where: { id: visitId },
			include: {
				job: {
					include: {
						client: true,
					},
				},
				visit_techs: {
					include: { tech: true },
				},
				notes: true,
			},
		});

		return { err: "", item: updated };
	} catch (e) {
		console.error("Failed to assign technicians:", e);
		return { err: "Failed to assign technicians" };
	}
};

export const deleteJobVisit = async (id: string) => {
	try {
		const visit = await db.job_visit.findUnique({
			where: { id },
		});

		if (!visit) {
			return { err: "Job visit not found" };
		}

		await db.$transaction(async (tx) => {
			// Delete technician assignments
			await tx.job_visit_technician.deleteMany({
				where: { visit_id: id },
			});

			// Delete the visit
			await tx.job_visit.delete({
				where: { id },
			});

			// Update job status if needed
			const remainingVisits = await tx.job_visit.findMany({
				where: { job_id: visit.job_id },
			});

			if (remainingVisits.length === 0) {
				await tx.job.update({
					where: { id: visit.job_id },
					data: { status: "Unscheduled" },
				});
			}
		});

		return { err: "", message: "Job visit deleted successfully" };
	} catch (e) {
		console.error("Failed to delete job visit:", e);
		return { err: "Failed to delete job visit" };
	}
};