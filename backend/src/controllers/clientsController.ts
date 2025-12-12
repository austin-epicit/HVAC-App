import { ZodError } from "zod";
import { db } from "../db.js";
import {
	createClientSchema,
	updateClientSchema,
} from "../lib/validate/clients.js";
import { logAction } from "../services/logger.js";
import { auditLog, calculateChanges } from "../services/auditLogger.js";

export interface UserContext {
	techId?: string;
	dispatcherId?: string;
	ipAddress?: string;
	userAgent?: string;
}

export const getAllClients = async () => {
	return await db.client.findMany({
		include: {
			jobs: true,
			contacts: true,
			notes: true,
		},
	});
};

export const getClientById = async (id: string) => {
	return await db.client.findFirst({
		where: { id: id },
		include: {
			jobs: true,
			contacts: true,
			notes: true,
		},
	});
};

export const insertClient = async (data: unknown, context?: UserContext) => {
	try {
		const parsed = createClientSchema.parse(data);

		const created = await db.$transaction(async (tx) => {
			const client = await tx.client.create({
				data: {
					name: parsed.name,
					address: parsed.address,
					coords: parsed.coords,
					is_active: parsed.is_active,
					last_activity: parsed.last_activity,
				},
			});

			await logAction({
				description: `Created client: ${client.name}`,
				techId: context?.techId,
				dispatcherId: context?.dispatcherId,
			});

			await auditLog({
				entityType: 'client',
				entityId: client.id,
				action: 'created',
				changes: {
					name: { old: null, new: client.name },
					address: { old: null, new: client.address },
					is_active: { old: null, new: client.is_active },
				},
				actorTechId: context?.techId,
				actorDispatcherId: context?.dispatcherId,
				ipAddress: context?.ipAddress,
				userAgent: context?.userAgent,
			});

			return tx.client.findUnique({
				where: { id: client.id },
				include: {
					jobs: true,
					contacts: true,
					notes: true,
				},
			});
		});

		return { err: "", item: created };
	} catch (e) {
		console.error("Insert client error:", e);
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

export const updateClient = async (id: string, data: unknown, context?: UserContext) => {
	try {
		const parsed = updateClientSchema.parse(data);

		const existing = await db.client.findUnique({ where: { id } });
		if (!existing) {
			return { err: "Client not found" };
		}

		const changes = calculateChanges(existing, parsed);

		const updated = await db.$transaction(async (tx) => {
			const client = await tx.client.update({
				where: { id },
				data: {
					...(parsed.name !== undefined && { name: parsed.name }),
					...(parsed.address !== undefined && {
						address: parsed.address,
					}),
					...(parsed.coords !== undefined && {
						coords: parsed.coords,
					}),
					...(parsed.is_active !== undefined && {
						is_active: parsed.is_active,
					}),
					last_activity: new Date(),
				},
			});

			if (Object.keys(changes).length > 0) {
				await logAction({
					description: `Updated client: ${client.name}`,
					techId: context?.techId,
					dispatcherId: context?.dispatcherId,
				});

				await auditLog({
					entityType: 'client',
					entityId: client.id,
					action: 'updated',
					changes,
					actorTechId: context?.techId,
					actorDispatcherId: context?.dispatcherId,
					ipAddress: context?.ipAddress,
					userAgent: context?.userAgent,
				});
			}

			return tx.client.findUnique({
				where: { id: client.id },
				include: {
					jobs: true,
					contacts: true,
					notes: true,
				},
			});
		});

		return { err: "", item: updated ?? undefined };
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

export const deleteClient = async (id: string, context?: UserContext) => {
	try {
		const existing = await db.client.findUnique({ where: { id } });

		if (!existing) {
			return { err: "Client not found" };
		}

		await db.$transaction(async (tx) => {
			await tx.client_contact.deleteMany({ where: { client_id: id } });
			await tx.client_note.deleteMany({ where: { client_id: id } });
			await tx.job.deleteMany({ where: { client_id: id } });

			await tx.client.delete({ where: { id } });

			await logAction({
				description: `Deleted client: ${existing.name}`,
				techId: context?.techId,
				dispatcherId: context?.dispatcherId,
			});

			await auditLog({
				entityType: 'client',
				entityId: id,
				action: 'deleted',
				changes: {
					name: { old: existing.name, new: null },
					address: { old: existing.address, new: null },
					is_active: { old: existing.is_active, new: null },
				},
				actorTechId: context?.techId,
				actorDispatcherId: context?.dispatcherId,
				ipAddress: context?.ipAddress,
				userAgent: context?.userAgent,
			});
		});

		return { err: "", message: "Client deleted successfully" };
	} catch (error) {
		console.error("Delete client error:", error);
		return { err: "Failed to delete client. It may have related records." };
	}
};
