import { ZodError } from "zod";
import { db } from "../db.js";
import { createContactSchema, updateContactSchema } from "../lib/validate/clientContacts.js";

export const getClientContacts = async (clientId: string) => {
	return await db.client_contact.findMany({
		where: { client_id: clientId },
		orderBy: { created_at: 'desc' }
	});
};

export const getContactById = async (clientId: string, contactId: string) => {
	return await db.client_contact.findFirst({
		where: { 
			id: contactId,
			client_id: clientId 
		}
	});
};

export const insertContact = async (clientId: string, data: unknown) => {
	try {
		const parsed = createContactSchema.parse(data);

		const client = await db.client.findUnique({ where: { id: clientId } });
		if (!client) {
			return { err: "Client not found" };
		}

		const created = await db.$transaction(async (tx) => {
			const contact = await tx.client_contact.create({
				data: {
					client_id: clientId,
					name: parsed.name,
					email: parsed.email,
					phone: parsed.phone,
					relation: parsed.relation,
					description: parsed.description || "",
				}
			});

			await tx.client.update({
				where: { id: clientId },
				data: { last_activity: new Date() }
			});

			return tx.client_contact.findUnique({
				where: { id: contact.id },
				include: {
					client: true,
				},
			});
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
		return { err: "Internal server error" };
	}
};

export const updateContact = async (clientId: string, contactId: string, data: unknown) => {
	try {
		const parsed = updateContactSchema.parse(data);

		const existing = await db.client_contact.findFirst({
			where: { 
				id: contactId,
				client_id: clientId 
			}
		});

		if (!existing) {
			return { err: "Contact not found" };
		}

		const updated = await db.$transaction(async (tx) => {
			const contact = await tx.client_contact.update({
				where: { id: contactId },
				data: {
					...(parsed.name !== undefined && { name: parsed.name }),
					...(parsed.email !== undefined && { email: parsed.email }),
					...(parsed.phone !== undefined && { phone: parsed.phone }),
					...(parsed.relation !== undefined && { relation: parsed.relation }),
					...(parsed.description !== undefined && { description: parsed.description }),
				}
			});

			await tx.client.update({
				where: { id: clientId },
				data: { last_activity: new Date() }
			});

			return tx.client_contact.findUnique({
				where: { id: contact.id },
				include: {
					client: true,
				},
			});
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
		return { err: "Internal server error" };
	}
};

export const deleteContact = async (clientId: string, contactId: string) => {
	try {
		const existing = await db.client_contact.findFirst({
			where: { 
				id: contactId,
				client_id: clientId 
			}
		});

		if (!existing) {
			return { err: "Contact not found" };
		}

		await db.client_contact.delete({
			where: { id: contactId }
		});

		return { err: "", message: "Contact deleted successfully" };
	} catch (error) {
		return { err: "Internal server error" };
	}
};