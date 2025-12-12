import { ZodError } from "zod";
import { db } from "../db.js";
import {
	createTechnicianSchema,
	updateTechnicianSchema,
} from "../lib/validate/technicians.js";
import { logAction } from "../services/logger.js";
import { auditLog, calculateChanges } from "../services/auditLogger.js";

export interface UserContext {
	techId?: string;
	dispatcherId?: string;
	ipAddress?: string;
	userAgent?: string;
}

export const getAllTechnicians = async () => {
	return await db.technician.findMany({
		include: {
			visit_techs: {
				include: {
					visit: {
						include: {
							job: {
								include: {
									client: true,
								},
							},
						},
					},
				},
			},
		},
	});
};

export const getTechnicianById = async (id: string) => {
	return await db.technician.findUnique({
		where: { id },
		include: {
			visit_techs: {
				include: {
					visit: {
						include: {
							job: {
								include: {
									client: true,
								},
							},
						},
					},
				},
			},
		},
	});
};

export const insertTechnician = async (data: unknown, context?: UserContext) => {
	try {
		const parsed = createTechnicianSchema.parse(data);

		const existing = await db.technician.findUnique({
			where: { email: parsed.email },
		});

		if (existing) {
			return { err: "Email already exists" };
		}

		const created = await db.$transaction(async (tx) => {
			const technician = await tx.technician.create({
				data: parsed,
				include: {
					visit_techs: {
						include: {
							visit: {
								include: {
									job: {
										include: {
											client: true,
										},
									},
								},
							},
						},
					},
				},
			});

			await logAction({
				description: `Created technician: ${technician.name}`,
				techId: context?.techId,
				dispatcherId: context?.dispatcherId,
			});

			await auditLog({
				entityType: 'technician',
				entityId: technician.id,
				action: 'created',
				changes: {
					name: { old: null, new: technician.name },
					email: { old: null, new: technician.email },
					phone: { old: null, new: technician.phone },
					title: { old: null, new: technician.title },
					status: { old: null, new: technician.status },
				},
				actorTechId: context?.techId,
				actorDispatcherId: context?.dispatcherId,
				ipAddress: context?.ipAddress,
				userAgent: context?.userAgent,
			});

			return technician;
		});

		return { err: "", item: created };
	} catch (e) {
		if (e instanceof ZodError) {
			return {
				err: `Validation failed: ${e.issues
					.map((err) => err.message)
					.join(", ")}`,
			};
		}
		console.error("Error inserting technician:", e);
		return { err: "Internal server error" };
	}
};

export const updateTechnician = async (id: string, data: unknown, context?: UserContext) => {
	try {
		const parsed = updateTechnicianSchema.parse(data);

		const existing = await db.technician.findUnique({
			where: { id },
		});

		if (!existing) {
			return { err: "Technician not found" };
		}

		if (parsed.email && parsed.email !== existing.email) {
			const emailTaken = await db.technician.findUnique({
				where: { email: parsed.email },
			});

			if (emailTaken) {
				return { err: "Email already exists" };
			}
		}

		const changes = calculateChanges(existing, parsed);

		const updated = await db.$transaction(async (tx) => {
			const technician = await tx.technician.update({
				where: { id },
				data: parsed,
				include: {
					visit_techs: {
						include: {
							visit: {
								include: {
									job: {
										include: {
											client: true,
										},
									},
								},
							},
						},
					},
				},
			});

			if (Object.keys(changes).length > 0) {
				await logAction({
					description: `Updated technician: ${technician.name}`,
					techId: context?.techId,
					dispatcherId: context?.dispatcherId,
				});

				await auditLog({
					entityType: 'technician',
					entityId: id,
					action: 'updated',
					changes,
					actorTechId: context?.techId,
					actorDispatcherId: context?.dispatcherId,
					ipAddress: context?.ipAddress,
					userAgent: context?.userAgent,
				});
			}

			return technician;
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
		console.error("Error updating technician:", e);
		return { err: "Internal server error" };
	}
};

export const deleteTechnician = async (id: string, context?: UserContext) => {
	try {
		const existing = await db.technician.findUnique({
			where: { id },
		});

		if (!existing) {
			return { err: "Technician not found" };
		}

		const upcomingVisits = await db.job_visit_technician.count({
			where: {
				tech_id: id,
				visit: {
					status: {
						in: ["Scheduled", "InProgress"],
					},
				},
			},
		});

		if (upcomingVisits > 0) {
			return {
				err: `Cannot delete technician with ${upcomingVisits} scheduled or in-progress visits`,
			};
		}

		await db.$transaction(async (tx) => {
			await tx.job_visit_technician.deleteMany({
				where: { tech_id: id },
			});

			await logAction({
				description: `Deleted technician: ${existing.name}`,
				techId: context?.techId,
				dispatcherId: context?.dispatcherId,
			});

			await auditLog({
				entityType: 'technician',
				entityId: id,
				action: 'deleted',
				changes: {
					name: { old: existing.name, new: null },
					email: { old: existing.email, new: null },
					status: { old: existing.status, new: null },
				},
				actorTechId: context?.techId,
				actorDispatcherId: context?.dispatcherId,
				ipAddress: context?.ipAddress,
				userAgent: context?.userAgent,
			});

			await tx.technician.delete({
				where: { id },
			});
		});

		return { err: "", message: "Technician deleted successfully" };
	} catch (error) {
		console.error("Error deleting technician:", error);
		return { err: "Internal server error" };
	}
};