import { ZodError } from "zod";
import { visit_status, schedule_type } from "../../generated/prisma/enums.js";
import { db } from "../db.js";
import { createJobVisitSchema, updateJobVisitSchema } from "../lib/validate/jobVisits.js";
import { Request } from "express";
import { logAction } from "../services/logger.js";
import { auditLog, calculateChanges } from "../services/auditLogger.js";

export interface UserContext {
	techId?: string;
	dispatcherId?: string;
	ipAddress?: string;
	userAgent?: string;
}

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

export const insertJobVisit = async (req: Request, context?: UserContext) => {
	try {
		const parsed = createJobVisitSchema.parse(req.body);

		const job = await db.job.findUnique({
			where: { id: parsed.job_id },
		});

		if (!job) {
			return { err: "Invalid job id" };
		}

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

			if (parsed.tech_ids && parsed.tech_ids.length > 0) {
				await tx.job_visit_technician.createMany({
					data: parsed.tech_ids.map((tech_id) => ({
						visit_id: visit.id,
						tech_id,
					})),
					skipDuplicates: true,
				});
			}

			if (parsed.status === "Scheduled" && job.status === "Unscheduled") {
				await tx.job.update({
					where: { id: parsed.job_id },
					data: { status: "Scheduled" },
				});
			}

			await logAction({
				description: `Created visit for job: ${job.name}`,
				techId: context?.techId,
				dispatcherId: context?.dispatcherId,
			});

			await auditLog({
				entityType: 'job_visit',
				entityId: visit.id,
				action: 'created',
				changes: {
					schedule_type: { old: null, new: visit.schedule_type },
					scheduled_start_at: { old: null, new: visit.scheduled_start_at },
					scheduled_end_at: { old: null, new: visit.scheduled_end_at },
					status: { old: null, new: visit.status },
				},
				actorTechId: context?.techId,
				actorDispatcherId: context?.dispatcherId,
				ipAddress: context?.ipAddress,
				userAgent: context?.userAgent,
			});

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

export const updateJobVisit = async (req: Request, context?: UserContext) => {
	try {
		const id = (req as any).params.id;
		const parsed = updateJobVisitSchema.parse((req as any).body);

		const existingVisit = await db.job_visit.findUnique({
			where: { id },
			include: { job: true },
		});

		if (!existingVisit) {
			return { err: "Job visit not found" };
		}

		const changes = calculateChanges(existingVisit, parsed);

		const updated = await db.$transaction(async (tx) => {
			const visit = await tx.job_visit.update({
				where: { id },
				data: parsed,
				include: {
					job: true,
					visit_techs: {
						include: { tech: true },
					},
					notes: true,
				},
			});

			if (parsed.status) {
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

			if (Object.keys(changes).length > 0) {
				await logAction({
					description: `Updated visit for job`,
					techId: context?.techId,
					dispatcherId: context?.dispatcherId,
				});

				await auditLog({
					entityType: 'job_visit',
					entityId: id,
					action: 'updated',
					changes,
					actorTechId: context?.techId,
					actorDispatcherId: context?.dispatcherId,
					ipAddress: context?.ipAddress,
					userAgent: context?.userAgent,
				});
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
	techIds: string[],
	context?: UserContext
) => {
	try {
		const visit = await db.job_visit.findUnique({
			where: { id: visitId },
			include: {
				visit_techs: {
					include: { tech: true }
				}
			}
		});

		if (!visit) {
			return { err: "Job visit not found" };
		}

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

		const oldTechIds = visit.visit_techs.map(vt => vt.tech_id);

		await db.$transaction(async (tx) => {
			await tx.job_visit_technician.deleteMany({
				where: { visit_id: visitId },
			});

			await tx.job_visit_technician.createMany({
				data: techIds.map((tech_id) => ({
					visit_id: visitId,
					tech_id,
				})),
			});

			await logAction({
				description: `Assigned technicians to visit`,
				techId: context?.techId,
				dispatcherId: context?.dispatcherId,
			});

			await auditLog({
				entityType: 'job_visit',
				entityId: visitId,
				action: 'updated',
				changes: {
					technicians: {
						old: oldTechIds,
						new: techIds,
					},
				},
				actorTechId: context?.techId,
				actorDispatcherId: context?.dispatcherId,
				ipAddress: context?.ipAddress,
				userAgent: context?.userAgent,
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

export const deleteJobVisit = async (id: string, context?: UserContext) => {
	try {
		const visit = await db.job_visit.findUnique({
			where: { id },
		});

		if (!visit) {
			return { err: "Job visit not found" };
		}

		await db.$transaction(async (tx) => {
			await tx.job_visit_technician.deleteMany({
				where: { visit_id: id },
			});

			await logAction({
				description: `Deleted job visit`,
				techId: context?.techId,
				dispatcherId: context?.dispatcherId,
			});

			await auditLog({
				entityType: 'job_visit',
				entityId: id,
				action: 'deleted',
				changes: {
					scheduled_start_at: { old: visit.scheduled_start_at, new: null },
					scheduled_end_at: { old: visit.scheduled_end_at, new: null },
					status: { old: visit.status, new: null },
				},
				actorTechId: context?.techId,
				actorDispatcherId: context?.dispatcherId,
				ipAddress: context?.ipAddress,
				userAgent: context?.userAgent,
			});

			await tx.job_visit.delete({
				where: { id },
			});

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