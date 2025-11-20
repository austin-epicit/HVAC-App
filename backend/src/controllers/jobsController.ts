import { ZodError } from "zod";
import { job_status } from "../../generated/prisma/enums.js";
import { db } from "../db.js";
import { createJobSchema } from "../lib/validate/jobs.js";
import { Request } from "express";

export const getAllJobs = async () => {
	return await db.job.findMany();
};

export const getJobById = async (id: string) => {
	return await db.job.findFirst({ where: { id: id } });
};

export const getJobsByClientId = async (clientId: string) => {
	return await db.job.findMany({
		where: { client_id: clientId },
		include: { job_tech: true },
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
					id: undefined,
					name: parsed.name,
					description: parsed.description,
					priority: parsed.priority,
					client_id: parsed.client_id,
					address: parsed.address,
					status: parsed.status as job_status,
					duration: parsed.duration,
					start_date: parsed.start_date,
					window_end: parsed.window_end,
					schedule_type: parsed.schedule_type,
				},
			});

			await tx.client.update({
				where: { id: parsed.client_id },
				data: { last_activity: new Date() },
			});

			if (parsed.tech_ids.length > 0) {
				await tx.job_technician.createMany({
					data: parsed.tech_ids.map((tech_id) => ({
						job_id: job.id,
						tech_id,
					})),
					skipDuplicates: true,
				});
			}

			return tx.job.findUnique({
				where: { id: job.id },
				include: {
					client: true,
					job_tech: {
						include: { tech: true },
					},
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
			"duration",
			"start_date",
			"window_end",
    		"schedule_type",	
		] satisfies (keyof typeof updates)[];

		const safeData: Record<string, any> = {};

		for (const key of allowedFields) {
			if (updates[key] !== undefined) {
				if (key === "start_date") {
					safeData.start_date = new Date(updates.start_date);
				} else {
					safeData[key] = updates[key];
				}
			}
		}

		const updated = await db.job.update({
			where: { id },
			data: safeData,
			include: {
				client: true,
				job_tech: {
					include: { tech: true },
				},
			},
		});

		return { err: "", item: updated };
	} catch (e) {
		console.error("Failed to update job:", e);
		return { err: "Failed to update job" };
	}
};
