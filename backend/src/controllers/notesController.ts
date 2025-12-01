import { ZodError } from "zod";
import { db } from "../db.js";
import { createNoteSchema, updateNoteSchema } from "../lib/validate/clientNotes.js";

export const getClientNotes = async (clientId: string) => {
	return await db.client_note.findMany({
		where: { client_id: clientId },
		orderBy: { created_at: 'desc' }
	});
};

export const getNoteById = async (clientId: string, noteId: string) => {
	return await db.client_note.findFirst({
		where: { 
			id: noteId,
			client_id: clientId 
		}
	});
};

export const insertNote = async (clientId: string, data: unknown) => {
	try {
		const parsed = createNoteSchema.parse(data);

		const client = await db.client.findUnique({ where: { id: clientId } });
		if (!client) {
			return { err: "Client not found" };
		}

		const created = await db.$transaction(async (tx) => {
			const note = await tx.client_note.create({
				data: {
					client_id: clientId,
					content: parsed.content,
				}
			});

			await tx.client.update({
				where: { id: clientId },
				data: { last_activity: new Date() }
			});

			return tx.client_note.findUnique({
				where: { id: note.id },
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

export const updateNote = async (clientId: string, noteId: string, data: unknown) => {
	try {
		const parsed = updateNoteSchema.parse(data);

		const existing = await db.client_note.findFirst({
			where: { 
				id: noteId,
				client_id: clientId 
			}
		});

		if (!existing) {
			return { err: "Note not found" };
		}

		const updated = await db.$transaction(async (tx) => {
			const note = await tx.client_note.update({
				where: { id: noteId },
				data: {
					content: parsed.content,
					updated_at: new Date(),
				}
			});

			await tx.client.update({
				where: { id: clientId },
				data: { last_activity: new Date() }
			});

			return tx.client_note.findUnique({
				where: { id: note.id },
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

export const deleteNote = async (clientId: string, noteId: string) => {
	try {
		const existing = await db.client_note.findFirst({
			where: { 
				id: noteId,
				client_id: clientId 
			}
		});

		if (!existing) {
			return { err: "Note not found" };
		}

		await db.client_note.delete({
			where: { id: noteId }
		});

		return { err: "", message: "Note deleted successfully" };
	} catch (error) {
		return { err: "Internal server error" };
	}
};