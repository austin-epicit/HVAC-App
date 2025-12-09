import { ZodError } from "zod";
import { db } from "../db.js";
import {
	createClientSchema,
	updateClientSchema,
} from "../lib/validate/clients.js";

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

export const insertClient = async (data: unknown) => {
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

export const updateClient = async (id: string, data: unknown) => {
	try {
		const parsed = updateClientSchema.parse(data);

		const existing = await db.client.findUnique({ where: { id } });
		if (!existing) {
			return { err: "Client not found" };
		}

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

export const deleteClient = async (id: string) => {
	try {
		console.log("Attempting to delete client with id:", id);
		const existing = await db.client.findUnique({ where: { id } });
		console.log("Found client:", existing);

		if (!existing) {
			return { err: "Client not found" };
		}

		await db.$transaction(async (tx) => {
			// Delete related data in order (respecting foreign keys)
			await tx.client_contact.deleteMany({ where: { client_id: id } });
			await tx.client_note.deleteMany({ where: { client_id: id } });
			await tx.job.deleteMany({ where: { client_id: id } });

			await tx.client.delete({ where: { id } });
		});

		console.log("Client deleted successfully");
		return { err: "", message: "Client deleted successfully" };
	} catch (error) {
		console.error("Delete client error:", error);
		return { err: "Failed to delete client. It may have related records." };
	}
};
