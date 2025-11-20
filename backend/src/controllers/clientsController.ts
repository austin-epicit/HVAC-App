import { ZodError } from "zod";
import { db } from "../db.js";
import { createClientSchema } from "../lib/validate/clients.js";

export const getAllClients = async () => {
	return await db.client.findMany();
};

export const getClientById = async (id: string) => {
	return await db.client.findFirst({ where: { id: id } });
};

export const insertClient = async (req: Request) => {
	try {
		const parsed = createClientSchema.parse(req);

		// should be validated here

		const created = await db.$transaction(async (tx) => {
			const client = await tx.client.create({
				data: {
					id: undefined,
					name: parsed.name,
					address: parsed.address,
					is_active: parsed.is_active,
					jobs: {
						connect: parsed.jobs.map((id) => ({ id })),
					},
					contacts: {
						connect: parsed.contacts.map((id) => ({ id })),
					},
					notes: {
						connect: parsed.notes.map((id) => ({ id })),
					},
					last_activity: parsed.last_activity,
				},
			});

			return tx.client.findUnique({
				where: { id: client.id },
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
