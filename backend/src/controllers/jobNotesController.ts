import { ZodError } from "zod";
import { db } from "../db.js";
import { createJobNoteSchema, updateJobNoteSchema } from "../lib/validate/jobNotes.js";

export const getJobNotes = async (jobId: string) => {
	return await db.job_note.findMany({
		where: { job_id: jobId },
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
			},
			visit: {
				select: {
					id: true,
					scheduled_start_at: true,
					scheduled_end_at: true,
					status: true,
				}
			}
		},
		orderBy: { created_at: 'desc' }
	});
};

export const getJobNotesByVisitId = async (jobId: string, visitId: string) => {
	return await db.job_note.findMany({
		where: { 
			job_id: jobId,
			visit_id: visitId,
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
			},
			visit: {
				select: {
					id: true,
					scheduled_start_at: true,
					scheduled_end_at: true,
					status: true,
				}
			}
		},
		orderBy: { created_at: 'desc' }
	});
};

export const getNoteById = async (jobId: string, noteId: string) => {
	return await db.job_note.findFirst({
		where: { 
			id: noteId,
			job_id: jobId 
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
			},
			visit: {
				select: {
					id: true,
					scheduled_start_at: true,
					scheduled_end_at: true,
					status: true,
				}
			}
		}
	});
};

// ============================================
// NEEDS ID , set to optional until auth added, comments undo optionalness

export const insertJobNote = async (
	jobId: string, 
	data: unknown, 
	userId?: string, //rm ?
	userType?: 'tech' | 'dispatcher' //rm ?
) => {
	try {
		const parsed = createJobNoteSchema.parse(data);

		// Verify job exists
		const job = await db.job.findUnique({ where: { id: jobId } });
		if (!job) {
			return { err: "Job not found" };
		}

		// If visit_id is provided, verify it exists and belongs to this job
		if (parsed.visit_id) {
			const visit = await db.job_visit.findUnique({
				where: { id: parsed.visit_id },
			});

			if (!visit) {
				return { err: "Visit not found" };
			}

			if (visit.job_id !== jobId) {
				return { err: "Visit does not belong to this job" };
			}
		}

		const created = await db.$transaction(async (tx) => {
			const noteData: any = {
				job_id: jobId,
				content: parsed.content,
				visit_id: parsed.visit_id || null,
				creator_tech_id: userType === 'tech' ? userId : null,
				creator_dispatcher_id: userType === 'dispatcher' ? userId : null,
			};

			const note = await tx.job_note.create({
				data: noteData,
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
					visit: {
						select: {
							id: true,
							scheduled_start_at: true,
							scheduled_end_at: true,
							status: true,
						}
					}
				}
			});

			if (userId && userType) {	//rm this outermost if
				await tx.audit_log.create({
					data: {
						entity_type: 'job_note',
						entity_id: note.id,
						action: 'created',
						actor_tech_id: userType === 'tech' ? userId : null,
						actor_dispatcher_id: userType === 'dispatcher' ? userId : null,
						changes: {
							content: {
								old: null,
								new: parsed.content
							},
							job_id: {
								old: null,
								new: jobId
							},
							visit_id: {
								old: null,
								new: parsed.visit_id || null
							}
						},
						// Optional: If we pass them from the request
						// ip_address: parsed.ip_address,
						// user_agent: parsed.user_agent,
					}
				});
			}

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
		console.error("Error inserting job note:", e);
		return { err: "Internal server error" };
	}
};

// ============================================
// NEEDS ID , set to optional until auth added, comments undo optionalness

export const updateJobNote = async (
	jobId: string, 
	noteId: string, 
	data: unknown, 
	userId?: string, //rm ?
	userType?: 'tech' | 'dispatcher' //rm ?
) => {
	try {
		const parsed = updateJobNoteSchema.parse(data);

		const existing = await db.job_note.findFirst({
			where: { 
				id: noteId,
				job_id: jobId 
			}
		});

		if (!existing) {
			return { err: "Note not found" };
		}

		// If visit_id is being updated, verify it exists and belongs to this job
		if (parsed.visit_id !== undefined && parsed.visit_id !== null) {
			const visit = await db.job_visit.findUnique({
				where: { id: parsed.visit_id },
			});

			if (!visit) {
				return { err: "Visit not found" };
			}

			if (visit.job_id !== jobId) {
				return { err: "Visit does not belong to this job" };
			}
		}

		const updated = await db.$transaction(async (tx) => {
			const updateData: any = {
				updated_at: new Date(),
			};
			const changes: any = {};

			// Only update fields that are provided
			if (parsed.content !== undefined) {
				updateData.content = parsed.content;
				changes.content = {
					old: existing.content,
					new: parsed.content
				};
			}

			if (parsed.visit_id !== undefined) {
				updateData.visit_id = parsed.visit_id;
				changes.visit_id = {
					old: existing.visit_id,
					new: parsed.visit_id
				};
			}

			// Only update the relevant editor field based on user type
			if (userId && userType) {					// rm this outermost if	
				if (userType === 'tech') {
					updateData.last_editor_tech_id = userId;
					updateData.last_editor_dispatcher_id = null;
				} else {
					updateData.last_editor_dispatcher_id = userId;
					updateData.last_editor_tech_id = null;
				}
			}

			const note = await tx.job_note.update({
				where: { id: noteId },
				data: updateData,
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
					},
					visit: {
						select: {
							id: true,
							scheduled_start_at: true,
							scheduled_end_at: true,
							status: true,
						}
					}
				}
			});

			if (userId && userType && Object.keys(changes).length > 0) {	// rm this outermost if
				await tx.audit_log.create({
					data: {
						entity_type: 'job_note',
						entity_id: noteId,
						action: 'updated',
						actor_tech_id: userType === 'tech' ? userId : null,
						actor_dispatcher_id: userType === 'dispatcher' ? userId : null,
						changes,
					}
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
		console.error("Error updating job note:", e);
		return { err: "Internal server error" };
	}
};

// ============================================
// NEEDS ID , set to optional until auth added, comments undo optionalness

export const deleteJobNote = async (
	jobId: string, 
	noteId: string, 
	userId?: string, // rm ?
	userType?: 'tech' | 'dispatcher' //rm ?
) => {
	try {
		const existing = await db.job_note.findFirst({
			where: { 
				id: noteId,
				job_id: jobId 
			}
		});

		if (!existing) {
			return { err: "Note not found" };
		}

		await db.$transaction(async (tx) => {
			if (userId && userType) {			// rm this outermost if
				await tx.audit_log.create({
					data: {
						entity_type: 'job_note',
						entity_id: noteId,
						action: 'deleted',
						actor_tech_id: userType === 'tech' ? userId : null,
						actor_dispatcher_id: userType === 'dispatcher' ? userId : null,
						changes: {
							deleted_record: {
								old: {
									content: existing.content,
									job_id: existing.job_id,
									visit_id: existing.visit_id,
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

			await tx.job_note.delete({
				where: { id: noteId }
			});
		});

		return { err: "", message: "Note deleted successfully" };
	} catch (error) {
		console.error("Error deleting job note:", error);
		return { err: "Internal server error" };
	}
};