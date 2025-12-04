import { ZodError } from "zod";
import { db } from "../db.js";
import { createNoteSchema, updateNoteSchema } from "../lib/validate/clientNotes.js";

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

// ============================================
// NEEDS ID , set to optional until auth added, comments undo optionalness


export const insertNote = async (
	clientId: string, 
	data: unknown, 
	userId?: string, //rm ?
	userType?: 'tech' | 'dispatcher' //rm ?
) => {
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
					creator_tech_id: (userId && userType === 'tech') ? userId : null, //creator_tech_id: userType === 'tech' ? userId : null,
					creator_dispatcher_id: (userId && userType === 'dispatcher') ? userId : null, //creator_dispatcher_id: userType === 'dispatcher' ? userId : null,
				}
			});
			
			await tx.audit_log.create({
				data: {
					entity_type: 'client_note',
					entity_id: note.id,
					action: 'created',
					actor_tech_id: userType === 'tech' ? userId : null,
					actor_dispatcher_id: userType === 'dispatcher' ? userId : null,
					changes: {
						content: {
							old: null,
							new: parsed.content
						}
					},
					// Optional: If we pass from the request
					// ip_address: parsed.ip_address,
					// user_agent: parsed.user_agent,
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

// ============================================
// NEEDS ID , set to optional until auth added, comments undo optionalness

export const updateNote = async (
	clientId: string, 
	noteId: string, 
	data: unknown, 
	userId?: string, 	//rm ?
	userType?: 'tech' | 'dispatcher'   //rm ?
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

		const updated = await db.$transaction(async (tx) => {
			const updateData: any = {
				content: parsed.content,
				updated_at: new Date(),
			};

			// Only update the relevant editor field based on user type
			if (userId && userType) {						// rm this outermost if
				if (userType === 'tech') {
					updateData.last_editor_tech_id = userId;
					updateData.last_editor_dispatcher_id = null;
				} else {
					updateData.last_editor_dispatcher_id = userId;
					updateData.last_editor_tech_id = null;
				}
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

			await tx.audit_log.create({
				data: {
					entity_type: 'client_note',
					entity_id: noteId,
					action: 'updated',
					actor_tech_id: userType === 'tech' ? userId : null,
					actor_dispatcher_id: userType === 'dispatcher' ? userId : null,
					changes: {
						content: {
							old: existing.content,
							new: parsed.content
						}
					},
				}
			});

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

// ============================================
// NEEDS ID , set to optional until auth added, comments undo optionalness

export const deleteNote = async (
	clientId: string, 
	noteId: string, 
	userId?: string, //rm ?
	userType?: 'tech' | 'dispatcher' //rm ?
) => {
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
			if (userId && userType) {			// rm this outermost if
				await tx.audit_log.create({
					data: {
						entity_type: 'client_note',
						entity_id: noteId,
						action: 'deleted',
						actor_tech_id: userType === 'tech' ? userId : null,
						actor_dispatcher_id: userType === 'dispatcher' ? userId : null,
						changes: {
							deleted_record: {
								old: {
									content: existing.content,
									client_id: existing.client_id,
									created_at: existing.created_at,
								},
								new: null
							}
						},
						// Optional: Add these if you're passing them from the request
						// ip_address: ipAddress,
						// user_agent: userAgent,
					}
				});
			}

			await tx.client_note.delete({
				where: { id: noteId }
			});
		});

		return { err: "", message: "Note deleted successfully" };
	} catch (error) {
		return { err: "Internal server error" };
	}
};