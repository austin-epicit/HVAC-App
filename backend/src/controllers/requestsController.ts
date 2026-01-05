import { ZodError } from "zod";
import { db } from "../db.js";
import {
	createRequestSchema,
	updateRequestSchema,
	createRequestNoteSchema,
	updateRequestNoteSchema,
} from "../lib/validate/requests.js";
import { Request } from "express";
import { logActivity, buildChanges } from "../services/logger.js";

export interface UserContext {
	techId?: string;
	dispatcherId?: string;
	ipAddress?: string;
	userAgent?: string;
}

export const getAllRequests = async () => {
	return await db.request.findMany({
		include: {
			client: {
				select: {
					id: true,
					name: true,
				},
			},
			quotes: {
				select: {
					id: true,
					quote_number: true,
					status: true,
					total: true,
				},
			},
			job: {
				select: {
					id: true,
					job_number: true,
					name: true,
					status: true,
				},
			},
		},
		orderBy: { created_at: "desc" },
	});
};

export const getRequestById = async (requestId: string) => {
	return await db.request.findUnique({
		where: { id: requestId },
		include: {
			client: {
				select: {
					id: true,
					name: true,
					address: true,
					coords: true,
					is_active: true,
					contacts: {
						where: {
							is_primary: true,
						},
						include: {
							contact: {
								select: {
									id: true,
									name: true,
									email: true,
									phone: true,
									title: true,
								},
							},
						},
						take: 1,
					},
				},
			},
			quotes: {
				include: {
					line_items: {
						orderBy: { sort_order: "asc" },
					},
				},
				orderBy: { created_at: "desc" },
			},
			job: {
				include: {
					line_items: true,
				},
			},
			notes: {
				include: {
					creator_tech: {
						select: { id: true, name: true, email: true },
					},
					creator_dispatcher: {
						select: { id: true, name: true, email: true },
					},
					last_editor_tech: {
						select: { id: true, name: true, email: true },
					},
					last_editor_dispatcher: {
						select: { id: true, name: true, email: true },
					},
				},
				orderBy: { created_at: "desc" },
			},
		},
	});
};

export const getRequestsByClientId = async (clientId: string) => {
	return await db.request.findMany({
		where: { client_id: clientId },
		include: {
			client: true,
			quotes: {
				select: {
					id: true,
					quote_number: true,
					status: true,
					total: true,
				},
			},
			job: {
				select: {
					id: true,
					job_number: true,
					name: true,
					status: true,
				},
			},
		},
		orderBy: { created_at: "desc" },
	});
};

export const insertRequest = async (req: Request, context?: UserContext) => {
	try {
		const parsed = createRequestSchema.parse(req.body);

		const created = await db.$transaction(async (tx) => {
			const client = await tx.client.findUnique({
				where: { id: parsed.client_id },
			});

			if (!client) {
				throw new Error("Client not found");
			}

			const request = await tx.request.create({
				data: {
					client_id: parsed.client_id,
					title: parsed.title,
					description: parsed.description,
					priority: parsed.priority,
					address: parsed.address,
					coords: parsed.coords,
					requires_quote: parsed.requires_quote,
					estimated_value: parsed.estimated_value,
					source: parsed.source,
					source_reference: parsed.source_reference,

					status: "New",
				},
			});

			await tx.client.update({
				where: { id: parsed.client_id },
				data: { last_activity: new Date() },
			});

			await logActivity({
				event_type: "request.created",
				action: "created",
				entity_type: "request",
				entity_id: request.id,
				actor_type: context?.techId
					? "technician"
					: context?.dispatcherId
					? "dispatcher"
					: "system",
				actor_id: context?.techId || context?.dispatcherId,
				changes: {
					title: { old: null, new: request.title },
					client_id: { old: null, new: request.client_id },
					priority: { old: null, new: request.priority },
					status: { old: null, new: request.status },
				},
				ip_address: context?.ipAddress,
				user_agent: context?.userAgent,
			});

			return tx.request.findUnique({
				where: { id: request.id },
				include: {
					client: true,
					quotes: true,
					job: true,
				},
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
		if (e instanceof Error) {
			return { err: e.message };
		}
		console.error("Insert request error:", e);
		return { err: "Internal server error" };
	}
};

export const updateRequest = async (req: Request, context?: UserContext) => {
	try {
		const requestId = (req as any).params.id;
		const parsed = updateRequestSchema.parse(req.body);

		const existing = await db.request.findUnique({
			where: { id: requestId },
			include: { job: true },
		});

		if (!existing) {
			return { err: "Request not found" };
		}

		// Check if request has been converted to job
		if (existing.job) {
			return {
				err: "Cannot modify request that has been converted to a job",
			};
		}

		const changes = buildChanges(
			existing,
			parsed as any,
			[
				"title",
				"description",
				"priority",
				"address",
				"status",
				"requires_quote",
				"source",
				"source_reference",
				"cancellation_reason",
			] as const
		);

		// Manually track Json and Decimal fields
		if (parsed.coords !== undefined) {
			changes.coords = { old: existing.coords, new: parsed.coords };
		}
		if (
			parsed.estimated_value !== undefined &&
			Number(existing.estimated_value) !== parsed.estimated_value
		) {
			changes.estimated_value = {
				old: existing.estimated_value,
				new: parsed.estimated_value,
			};
		}

		const updated = await db.$transaction(async (tx) => {
			const request = await tx.request.update({
				where: { id: requestId },
				data: {
					...(parsed.title !== undefined && { title: parsed.title }),
					...(parsed.description !== undefined && {
						description: parsed.description,
					}),
					...(parsed.priority !== undefined && {
						priority: parsed.priority,
					}),
					...(parsed.address !== undefined && {
						address: parsed.address,
					}),
					...(parsed.coords !== undefined && {
						coords: parsed.coords,
					}),
					...(parsed.status !== undefined && {
						status: parsed.status,
					}),
					...(parsed.requires_quote !== undefined && {
						requires_quote: parsed.requires_quote,
					}),
					...(parsed.estimated_value !== undefined && {
						estimated_value: parsed.estimated_value,
					}),
					...(parsed.source !== undefined && {
						source: parsed.source,
					}),
					...(parsed.source_reference !== undefined && {
						source_reference: parsed.source_reference,
					}),
					...(parsed.cancellation_reason !== undefined && {
						cancellation_reason: parsed.cancellation_reason,
					}),
					// Auto-timestamps
					...(parsed.status === "Cancelled" &&
						!existing.cancelled_at && { cancelled_at: new Date() }),
				},
				include: {
					client: true,
					quotes: true,
					job: true,
				},
			});

			if (Object.keys(changes).length > 0) {
				await logActivity({
					event_type: "request.updated",
					action: "updated",
					entity_type: "request",
					entity_id: requestId,
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

			return request;
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
		console.error("Update request error:", e);
		return { err: "Internal server error" };
	}
};

export const deleteRequest = async (id: string, context?: UserContext) => {
	try {
		const existing = await db.request.findUnique({
			where: { id },
			include: {
				quotes: true,
				job: true,
			},
		});

		if (!existing) {
			return { err: "Request not found" };
		}

		// Check if request has quotes
		if (existing.quotes && existing.quotes.length > 0) {
			return {
				err: "Cannot delete request that has quotes. Delete quotes first or archive the request.",
			};
		}

		// Check if request has been converted to job
		if (existing.job) {
			return {
				err: "Cannot delete request that has been converted to a job",
			};
		}

		await db.$transaction(async (tx) => {
			await logActivity({
				event_type: "request.deleted",
				action: "deleted",
				entity_type: "request",
				entity_id: id,
				actor_type: context?.techId
					? "technician"
					: context?.dispatcherId
					? "dispatcher"
					: "system",
				actor_id: context?.techId || context?.dispatcherId,
				changes: {
					title: { old: existing.title, new: null },
					status: { old: existing.status, new: null },
				},
				ip_address: context?.ipAddress,
				user_agent: context?.userAgent,
			});

			await tx.request_note.deleteMany({
				where: { request_id: id },
			});

			await tx.request.delete({
				where: { id },
			});
		});

		return { err: "", item: { id } };
	} catch (error) {
		console.error("Delete request error:", error);
		return { err: "Internal server error" };
	}
};

// ============================================================================
// REQUEST NOTES
// ============================================================================

export const getRequestNotes = async (requestId: string) => {
	return await db.request_note.findMany({
		where: { request_id: requestId },
		include: {
			creator_tech: {
				select: { id: true, name: true, email: true },
			},
			creator_dispatcher: {
				select: { id: true, name: true, email: true },
			},
			last_editor_tech: {
				select: { id: true, name: true, email: true },
			},
			last_editor_dispatcher: {
				select: { id: true, name: true, email: true },
			},
		},
		orderBy: { created_at: "desc" },
	});
};

export const getRequestNoteById = async (requestId: string, noteId: string) => {
	return await db.request_note.findFirst({
		where: {
			id: noteId,
			request_id: requestId,
		},
		include: {
			creator_tech: {
				select: { id: true, name: true, email: true },
			},
			creator_dispatcher: {
				select: { id: true, name: true, email: true },
			},
			last_editor_tech: {
				select: { id: true, name: true, email: true },
			},
			last_editor_dispatcher: {
				select: { id: true, name: true, email: true },
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
			const note = await tx.request_note.create({
				data: {
					request_id: requestId,
					content: parsed.content,
					creator_tech_id: context?.techId || null,
					creator_dispatcher_id: context?.dispatcherId || null,
				},
				include: {
					creator_tech: {
						select: { id: true, name: true, email: true },
					},
					creator_dispatcher: {
						select: { id: true, name: true, email: true },
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
		console.error("Insert request note error:", e);
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

		const changes = buildChanges(
			existing,
			parsed as any,
			["content"] as const
		);

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

			const note = await tx.request_note.update({
				where: { id: noteId },
				data: updateData,
				include: {
					creator_tech: {
						select: { id: true, name: true, email: true },
					},
					creator_dispatcher: {
						select: { id: true, name: true, email: true },
					},
					last_editor_tech: {
						select: { id: true, name: true, email: true },
					},
					last_editor_dispatcher: {
						select: { id: true, name: true, email: true },
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
		console.error("Update request note error:", e);
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
		console.error("Delete request note error:", error);
		return { err: "Internal server error" };
	}
};
