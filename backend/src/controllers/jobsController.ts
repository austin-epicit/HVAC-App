import { ZodError } from "zod";
import { job_status } from "../../generated/prisma/enums.js";
import { db } from "../db.js";
import { createJobSchema } from "../lib/validate/jobs.js";
import { Request } from "express";

export const getAllJobs = async () => {
	return await db.job.findMany({
		include: {
			client: true,
			visits: {
				include: {
					visit_techs: {
						include: {
							tech: true,
						},
					},
				},
			},
			notes: true,
		},
	});
};

export const getJobById = async (id: string) => {
	return await db.job.findFirst({
		where: { id: id },
		include: {
			client: true,
			visits: {
				include: {
					visit_techs: {
						include: {
							tech: true,
						},
					},
					notes: true,
				},
			},
			notes: true,
		},
	});
};

export const getJobsByClientId = async (clientId: string) => {
	return await db.job.findMany({
		where: { client_id: clientId },
		include: {
			client: true,
			visits: {
				include: {
					visit_techs: {
						include: {
							tech: true,
						},
					},
				},
			},
			notes: true,
		},
	});
};

export const insertJob = async (req: Request) => {
	try {
		const parsed = createJobSchema.parse(req);

		const client = await db.client.findUnique({
			where: { id: parsed.client_id },
		});

		if (!client) {
			return { err: "Invalid client id" };
		}

		if (parsed.tech_ids.length > 0) {
			const existingTechs = await db.technician.findMany({
				where: { id: { in: parsed.tech_ids } },
				select: { id: true },
			});
			const existingIds = new Set(existingTechs.map((t) => t.id));
			const missing = parsed.tech_ids.filter(
				(id) => !existingIds.has(id)
			);
			if (missing.length > 0) {
				return {
					err: `Technicians not found: ${missing.join(", ")}`,
				};
			}
		}

		const created = await db.$transaction(async (tx) => {
			const job = await tx.job.create({
				data: {
					name: parsed.name,
					description: parsed.description,
					priority: parsed.priority,
					client_id: parsed.client_id,
					address: parsed.address,
					status: parsed.status as job_status,
				},
			});

			await tx.client.update({
				where: { id: parsed.client_id },
				data: { last_activity: new Date() },
			});

			return tx.job.findUnique({
				where: { id: job.id },
				include: {
					client: true,
					visits: {
						include: {
							visit_techs: {
								include: { tech: true },
							},
						},
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
		return { err: "Internal server error" };
	}
};

export const updateJob = async (req: Request) => {
	try {
		const id = (req as any).params.id;
		const updates = (req as any).body;

		// Allow only safe fields to be updated
		const allowedFields = [
			"name",
			"description",
			"priority",
			"client_id",
			"address",
			"status",
		] satisfies (keyof typeof updates)[];

		const safeData: Record<string, any> = {};

		for (const key of allowedFields) {
			if (updates[key] !== undefined) {
				safeData[key] = updates[key];
			}
		}

		const updated = await db.job.update({
			where: { id },
			data: safeData,
			include: {
				client: true,
				visits: {
					include: {
						visit_techs: {
							include: { tech: true },
						},
					},
				},
				notes: true,
			},
		});

		return { err: "", item: updated };
	} catch (e) {
		console.error("Failed to update job:", e);
		return { err: "Failed to update job" };
	}
};
export const deleteJob = async (id: string) => {
	try {
		const job = await db.job.findUnique({
			where: { id },
			include: { visits: true },
		});

		if (!job) {
			return { err: "Job not found" };
		}

		await db.$transaction(async (tx) => {
			if (job.visits.length > 0) {
				const visitIds = job.visits.map(v => v.id);
				
				await tx.job_visit_technician.deleteMany({
					where: { visit_id: { in: visitIds } },
				});
				await tx.job_visit.deleteMany({
					where: { job_id: id },
				});
			}

			await tx.job_note.deleteMany({
				where: { job_id: id },
			});
			await tx.job.delete({
				where: { id },
			});
		});

		return { err: "", item: { id } };
	} catch (e) {
		console.error("Error deleting job:", e);
		return { err: "Failed to delete job" };
	}
};
