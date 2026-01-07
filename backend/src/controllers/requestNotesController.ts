import { ZodError } from "zod";
import { db } from "../db.js";
import {
	createRequestNoteSchema,
	updateRequestNoteSchema,
} from "../lib/validate/requests.js";
import { logActivity, buildChanges } from "../services/logger.js";

export interface UserContext {
	techId?: string;
	dispatcherId?: string;
	ipAddress?: string;
	userAgent?: string;
}

export const getRequestNotes = async (requestId: string) => {
	return await db.request_note.findMany({
		where: { request_id: requestId },
		include: {
			creator_tech: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			creator_dispatcher: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			last_editor_tech: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			last_editor_dispatcher: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
		orderBy: { created_at: "desc" },
	});
};

export const getNoteById = async (requestId: string, noteId: string) => {
	return await db.request_note.findFirst({
		where: {
			id: noteId,
			request_id: requestId,
		},
		include: {
			creator_tech: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			creator_dispatcher: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			last_editor_tech: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			last_editor_dispatcher: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	});
};

export const insertRequestNote = async (
	requestId: string,
	data: unknown,
	context?: UserContext
) => {
	try {
		const parsed = createRequestNoteSchema.parse(data);

		const request = await db.request.findUnique({
			where: { id: requestId },
		});
		if (!request) {
			return { err: "Request not found" };
		}

		const created = await db.$transaction(async (tx) => {
			const noteData: any = {
				request_id: requestId,
				content: parsed.content,
				creator_tech_id: context?.techId || null,
				creator_dispatcher_id: context?.dispatcherId || null,
			};

			const note = await tx.request_note.create({
				data: noteData,
				include: {
					creator_tech: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					creator_dispatcher: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			});

			await logActivity({
				event_type: "request_note.created",
				action: "created",
				entity_type: "request_note",
				entity_id: note.id,
				actor_type: context?.techId
					? "technician"
					: context?.dispatcherId
					? "dispatcher"
					: "system",
				actor_id: context?.techId || context?.dispatcherId,
				changes: {
					content: { old: null, new: parsed.content },
					request_id: { old: null, new: requestId },
				},
				ip_address: context?.ipAddress,
				user_agent: context?.userAgent,
			});

			return note;
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
		console.error("Error inserting request note:", e);
		return { err: "Internal server error" };
	}
};

export const updateRequestNote = async (
	requestId: string,
	noteId: string,
	data: unknown,
	context?: UserContext
) => {
	try {
		const parsed = updateRequestNoteSchema.parse(data);

		const existing = await db.request_note.findFirst({
			where: {
				id: noteId,
				request_id: requestId,
			},
		});

		if (!existing) {
			return { err: "Note not found" };
		}

		const changes = buildChanges(existing, parsed, ["content"] as const);

		const updated = await db.$transaction(async (tx) => {
			const updateData: any = {
				updated_at: new Date(),
			};

			if (parsed.content !== undefined) {
				updateData.content = parsed.content;
			}

			if (context?.techId) {
				updateData.last_editor_tech_id = context.techId;
				updateData.last_editor_dispatcher_id = null;
			} else if (context?.dispatcherId) {
				updateData.last_editor_dispatcher_id = context.dispatcherId;
				updateData.last_editor_tech_id = null;
			}

			const note = await tx.request_note.update({
				where: { id: noteId },
				data: updateData,
				include: {
					creator_tech: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					creator_dispatcher: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					last_editor_tech: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					last_editor_dispatcher: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			});

			if (Object.keys(changes).length > 0) {
				await logActivity({
					event_type: "request_note.updated",
					action: "updated",
					entity_type: "request_note",
					entity_id: noteId,
					actor_type: context?.techId
						? "technician"
						: context?.dispatcherId
						? "dispatcher"
						: "system",
					actor_id: context?.techId || context?.dispatcherId,
					changes,
					ip_address: context?.ipAddress,
					user_agent: context?.userAgent,
				});
			}

			return note;
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
		console.error("Error updating request note:", e);
		return { err: "Internal server error" };
	}
};

export const deleteRequestNote = async (
	requestId: string,
	noteId: string,
	context?: UserContext
) => {
	try {
		const existing = await db.request_note.findFirst({
			where: {
				id: noteId,
				request_id: requestId,
			},
		});

		if (!existing) {
			return { err: "Note not found" };
		}

		await db.$transaction(async (tx) => {
			await logActivity({
				event_type: "request_note.deleted",
				action: "deleted",
				entity_type: "request_note",
				entity_id: noteId,
				actor_type: context?.techId
					? "technician"
					: context?.dispatcherId
					? "dispatcher"
					: "system",
				actor_id: context?.techId || context?.dispatcherId,
				changes: {
					content: { old: existing.content, new: null },
					request_id: { old: existing.request_id, new: null },
				},
				ip_address: context?.ipAddress,
				user_agent: context?.userAgent,
			});

			await tx.request_note.delete({
				where: { id: noteId },
			});
		});

		return { err: "", message: "Note deleted successfully" };
	} catch (error) {
		console.error("Error deleting request note:", error);
		return { err: "Internal server error" };
	}
};
