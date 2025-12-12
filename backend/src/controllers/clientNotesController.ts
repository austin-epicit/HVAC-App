import { ZodError } from "zod";
import { db } from "../db.js";
import { createNoteSchema, updateNoteSchema } from "../lib/validate/clientNotes.js";
import { logAction } from "../services/logger.js";
import { auditLog, calculateChanges } from "../services/auditLogger.js";

export interface UserContext {
	techId?: string;
	dispatcherId?: string;
	ipAddress?: string;
	userAgent?: string;
}

export const getClientNotes = async (clientId: string) => {
	return await db.client_note.findMany({
		where: { client_id: clientId },
		include: {
			creator_tech: {
				select: {
					id: true,
					name: true,
					email: true,
				}
			},
			creator_dispatcher: {
				select: {
					id: true,
					name: true,
					email: true,
				}
			},
			last_editor_tech: {
				select: {
					id: true,
					name: true,
					email: true,
				}
			},
			last_editor_dispatcher: {
				select: {
					id: true,
					name: true,
					email: true,
				}
			}
		},
		orderBy: { created_at: 'desc' }
	});
};

export const getNoteById = async (clientId: string, noteId: string) => {
	return await db.client_note.findFirst({
		where: { 
			id: noteId,
			client_id: clientId 
		},
		include: {
			creator_tech: {
				select: {
					id: true,
					name: true,
					email: true,
				}
			},
			creator_dispatcher: {
				select: {
					id: true,
					name: true,
					email: true,
				}
			},
			last_editor_tech: {
				select: {
					id: true,
					name: true,
					email: true,
				}
			},
			last_editor_dispatcher: {
				select: {
					id: true,
					name: true,
					email: true,
				}
			}
		}
	});
};

export const insertNote = async (clientId: string, data: unknown, context?: UserContext) => {
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
					creator_tech_id: context?.techId || null,
					creator_dispatcher_id: context?.dispatcherId || null,
				}
			});

			await logAction({
				description: `Created note on client: ${client.name}`,
				techId: context?.techId,
				dispatcherId: context?.dispatcherId,
			});

			await auditLog({
				entityType: 'client_note',
				entityId: note.id,
				action: 'created',
				changes: {
					content: { old: null, new: parsed.content },
					client_id: { old: null, new: clientId },
				},
				actorTechId: context?.techId,
				actorDispatcherId: context?.dispatcherId,
				ipAddress: context?.ipAddress,
				userAgent: context?.userAgent,
			});

			await tx.client.update({
				where: { id: clientId },
				data: { last_activity: new Date() }
			});

			return tx.client_note.findUnique({
				where: { id: note.id },
				include: {
					client: true,
					creator_tech: {
						select: {
							id: true,
							name: true,
							email: true,
						}
					},
					creator_dispatcher: {
						select: {
							id: true,
							name: true,
							email: true,
						}
					}
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

export const updateNote = async (
	clientId: string, 
	noteId: string, 
	data: unknown, 
	context?: UserContext
) => {
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

		const changes = calculateChanges(existing, parsed);

		const updated = await db.$transaction(async (tx) => {
			const updateData: any = {
				content: parsed.content,
				updated_at: new Date(),
			};

			if (context?.techId) {
				updateData.last_editor_tech_id = context.techId;
				updateData.last_editor_dispatcher_id = null;
			} else if (context?.dispatcherId) {
				updateData.last_editor_dispatcher_id = context.dispatcherId;
				updateData.last_editor_tech_id = null;
			}

			const note = await tx.client_note.update({
				where: { id: noteId },
				data: updateData,
				include: {
					client: true,
					creator_tech: {
						select: {
							id: true,
							name: true,
							email: true,
						}
					},
					creator_dispatcher: {
						select: {
							id: true,
							name: true,
							email: true,
						}
					},
					last_editor_tech: {
						select: {
							id: true,
							name: true,
							email: true,
						}
					},
					last_editor_dispatcher: {
						select: {
							id: true,
							name: true,
							email: true,
						}
					}
				},
			});

			if (Object.keys(changes).length > 0) {
				await logAction({
					description: `Updated note on client`,
					techId: context?.techId,
					dispatcherId: context?.dispatcherId,
				});

				await auditLog({
					entityType: 'client_note',
					entityId: noteId,
					action: 'updated',
					changes,
					actorTechId: context?.techId,
					actorDispatcherId: context?.dispatcherId,
					ipAddress: context?.ipAddress,
					userAgent: context?.userAgent,
				});
			}

			await tx.client.update({
				where: { id: clientId },
				data: { last_activity: new Date() }
			});

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
		return { err: "Internal server error" };
	}
};

export const deleteNote = async (clientId: string, noteId: string, context?: UserContext) => {
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

		await db.$transaction(async (tx) => {
			await logAction({
				description: `Deleted note on client`,
				techId: context?.techId,
				dispatcherId: context?.dispatcherId,
			});

			await auditLog({
				entityType: 'client_note',
				entityId: noteId,
				action: 'deleted',
				changes: {
					content: { old: existing.content, new: null },
					client_id: { old: existing.client_id, new: null },
				},
				actorTechId: context?.techId,
				actorDispatcherId: context?.dispatcherId,
				ipAddress: context?.ipAddress,
				userAgent: context?.userAgent,
			});

			await tx.client_note.delete({
				where: { id: noteId }
			});
		});

		return { err: "", message: "Note deleted successfully" };
	} catch (error) {
		return { err: "Internal server error" };
	}
};