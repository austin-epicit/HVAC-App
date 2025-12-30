import { ZodError } from "zod";
import { db } from "../db.js";
import {
	createQuoteSchema,
	updateQuoteSchema,
	createQuoteItemSchema,
	updateQuoteItemSchema,
	createQuoteNoteSchema,
	updateQuoteNoteSchema,
} from "../lib/validate/quotes.js";
import { Request } from "express";
import { logActivity, buildChanges } from "../services/logger.js";

export interface UserContext {
	techId?: string;
	dispatcherId?: string;
	ipAddress?: string;
	userAgent?: string;
}

async function generateQuoteNumber(): Promise<string> {
	const year = new Date().getFullYear();
	const lastQuote = await db.quote.findFirst({
		where: {
			quote_number: {
				startsWith: `Q-${year}-`,
			},
		},
		orderBy: {
			created_at: "desc",
		},
	});

	let nextNumber = 1;
	if (lastQuote) {
		const match = lastQuote.quote_number.match(/Q-\d{4}-(\d+)/);
		if (match) {
			nextNumber = parseInt(match[1]) + 1;
		}
	}

	return `Q-${year}-${nextNumber.toString().padStart(4, "0")}`;
}

export const getAllQuotes = async () => {
	return await db.quote.findMany({
		include: {
			client: {
				select: {
					id: true,
					name: true,
				},
			},
			request: {
				select: {
					id: true,
					title: true,
					status: true,
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
			line_items: {
				orderBy: { sort_order: "asc" },
			},
		},
		orderBy: { created_at: "desc" },
	});
};

export const getQuoteById = async (quoteId: string) => {
	return await db.quote.findUnique({
		where: { id: quoteId },
		include: {
			client: {
				select: {
					id: true,
					name: true,
					address: true,
					coords: true,
				},
			},
			request: {
				select: {
					id: true,
					title: true,
					description: true,
					priority: true,
					status: true,
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
			line_items: {
				orderBy: { sort_order: "asc" },
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

export const getQuotesByClientId = async (clientId: string) => {
	return await db.quote.findMany({
		where: { client_id: clientId },
		include: {
			client: true,
			request: {
				select: {
					id: true,
					title: true,
					status: true,
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
			line_items: {
				orderBy: { sort_order: "asc" },
			},
		},
		orderBy: { created_at: "desc" },
	});
};

export const insertQuote = async (req: Request, context?: UserContext) => {
	try {
		const parsed = createQuoteSchema.parse(req.body);

		const created = await db.$transaction(async (tx) => {
			const client = await tx.client.findUnique({
				where: { id: parsed.client_id },
			});

			if (!client) {
				throw new Error("Client not found");
			}

			let address = parsed.address;
			let coords: { lat: number; lon: number } | undefined =
				parsed.coords;
			let priority = parsed.priority;
			let title = parsed.title;
			let description = parsed.description;

			// If linked to request, inherit missing fields
			if (parsed.request_id) {
				const request = await tx.request.findUnique({
					where: { id: parsed.request_id },
				});

				if (!request) {
					throw new Error("Request not found");
				}

				// Inherit fields from request if not explicitly provided
				if (!address && request.address) {
					address = request.address;
				}
				if (!coords && request.coords) {
					coords = request.coords as { lat: number; lon: number };
				}
				if (!priority && request.priority) {
					priority = request.priority;
				}
				if (!title) {
					title = request.title;
				}
				if (!description) {
					description = request.description;
				}

				// Update request status to show it has been quoted
				await tx.request.update({
					where: { id: parsed.request_id },
					data: { status: "Quoted" },
				});
			}

			if (!address) {
				throw new Error("Address is required for quote");
			}
			if (!title) {
				throw new Error("Title is required for quote");
			}
			if (!description) {
				throw new Error("Description is required for quote");
			}

			const quoteNumber = await generateQuoteNumber();

			const quote = await tx.quote.create({
				data: {
					quote_number: quoteNumber,
					client_id: parsed.client_id,
					request_id: parsed.request_id || null,
					title: title,
					description: description,
					address: address,
					coords: coords || undefined,
					priority: priority,
					subtotal: parsed.subtotal,
					tax_rate: parsed.tax_rate,
					tax_amount: parsed.tax_amount,
					discount_amount: parsed.discount_amount,
					total: parsed.total,
					valid_until: parsed.valid_until
						? new Date(parsed.valid_until)
						: null,
					expires_at: parsed.expires_at
						? new Date(parsed.expires_at)
						: null,
					status: parsed.status,
					created_by_dispatcher_id: context?.dispatcherId || null,
				},
			});

			await tx.client.update({
				where: { id: parsed.client_id },
				data: { last_activity: new Date() },
			});

			await logActivity({
				event_type: "quote.created",
				action: "created",
				entity_type: "quote",
				entity_id: quote.id,
				actor_type: context?.techId
					? "technician"
					: context?.dispatcherId
					? "dispatcher"
					: "system",
				actor_id: context?.techId || context?.dispatcherId,
				changes: {
					quote_number: { old: null, new: quote.quote_number },
					title: { old: null, new: quote.title },
					client_id: { old: null, new: quote.client_id },
					status: { old: null, new: quote.status },
					total: { old: null, new: quote.total },
				},
				ip_address: context?.ipAddress,
				user_agent: context?.userAgent,
			});

			return tx.quote.findUnique({
				where: { id: quote.id },
				include: {
					client: true,
					request: true,
					job: true,
					line_items: true,
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
		console.error("Insert quote error:", e);
		return { err: "Internal server error" };
	}
};

export const updateQuote = async (req: Request, context?: UserContext) => {
	try {
		const quoteId = (req as any).params.id;
		const parsed = updateQuoteSchema.parse(req.body);

		const existing = await db.quote.findUnique({
			where: { id: quoteId },
			include: { job: true },
		});

		if (!existing) {
			return { err: "Quote not found" };
		}

		// Check if quote has been converted to job
		if (existing.job) {
			return {
				err: "Cannot modify quote that has been converted to a job",
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
				"rejection_reason",
			] as const
		);

		// Manually track Decimal fields
		if (
			parsed.subtotal !== undefined &&
			Number(existing.subtotal) !== parsed.subtotal
		) {
			changes.subtotal = { old: existing.subtotal, new: parsed.subtotal };
		}
		if (
			parsed.tax_rate !== undefined &&
			Number(existing.tax_rate) !== parsed.tax_rate
		) {
			changes.tax_rate = { old: existing.tax_rate, new: parsed.tax_rate };
		}
		if (
			parsed.tax_amount !== undefined &&
			Number(existing.tax_amount) !== parsed.tax_amount
		) {
			changes.tax_amount = {
				old: existing.tax_amount,
				new: parsed.tax_amount,
			};
		}
		if (
			parsed.discount_amount !== undefined &&
			Number(existing.discount_amount) !== parsed.discount_amount
		) {
			changes.discount_amount = {
				old: existing.discount_amount,
				new: parsed.discount_amount,
			};
		}
		if (
			parsed.total !== undefined &&
			Number(existing.total) !== parsed.total
		) {
			changes.total = { old: existing.total, new: parsed.total };
		}

		// Manually track datetime and Json fields
		if (parsed.valid_until !== undefined) {
			changes.valid_until = {
				old: existing.valid_until,
				new: parsed.valid_until,
			};
		}
		if (parsed.expires_at !== undefined) {
			changes.expires_at = {
				old: existing.expires_at,
				new: parsed.expires_at,
			};
		}
		if (parsed.coords !== undefined) {
			changes.coords = { old: existing.coords, new: parsed.coords };
		}

		const updated = await db.$transaction(async (tx) => {
			// Track status changes for auto-timestamps
			const isFirstSent =
				parsed.status === "Sent" && existing.status !== "Sent";
			const isFirstViewed =
				parsed.status === "Viewed" && existing.status !== "Viewed";
			const isFirstApproved =
				parsed.status === "Approved" && existing.status !== "Approved";
			const isFirstRejected =
				parsed.status === "Rejected" && existing.status !== "Rejected";

			const quote = await tx.quote.update({
				where: { id: quoteId },
				data: {
					...(parsed.title !== undefined && { title: parsed.title }),
					...(parsed.description !== undefined && {
						description: parsed.description,
					}),
					...(parsed.address !== undefined && {
						address: parsed.address,
					}),
					...(parsed.coords !== undefined && {
						coords: parsed.coords || undefined,
					}),
					...(parsed.priority !== undefined && {
						priority: parsed.priority,
					}),
					...(parsed.subtotal !== undefined && {
						subtotal: parsed.subtotal,
					}),
					...(parsed.tax_rate !== undefined && {
						tax_rate: parsed.tax_rate,
					}),
					...(parsed.tax_amount !== undefined && {
						tax_amount: parsed.tax_amount,
					}),
					...(parsed.discount_amount !== undefined && {
						discount_amount: parsed.discount_amount,
					}),
					...(parsed.total !== undefined && { total: parsed.total }),
					...(parsed.valid_until !== undefined && {
						valid_until: parsed.valid_until
							? new Date(parsed.valid_until)
							: null,
					}),
					...(parsed.expires_at !== undefined && {
						expires_at: parsed.expires_at
							? new Date(parsed.expires_at)
							: null,
					}),
					...(parsed.status !== undefined && {
						status: parsed.status,
					}),
					...(parsed.rejection_reason !== undefined && {
						rejection_reason: parsed.rejection_reason,
					}),
					// Auto-timestamps
					...(isFirstSent && { sent_at: new Date() }),
					...(isFirstViewed && { viewed_at: new Date() }),
					...(isFirstApproved && { approved_at: new Date() }),
					...(isFirstRejected && { rejected_at: new Date() }),
				},
				include: {
					client: true,
					request: true,
					job: true,
					line_items: true,
				},
			});

			// Sync request status if linked
			if (quote.request_id && parsed.status) {
				if (parsed.status === "Approved") {
					await tx.request.update({
						where: { id: quote.request_id },
						data: { status: "QuoteApproved" },
					});
				} else if (parsed.status === "Rejected") {
					await tx.request.update({
						where: { id: quote.request_id },
						data: { status: "QuoteRejected" },
					});
				}
			}

			if (Object.keys(changes).length > 0) {
				await logActivity({
					event_type: "quote.updated",
					action: "updated",
					entity_type: "quote",
					entity_id: quoteId,
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

			return quote;
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
		console.error("Update quote error:", e);
		return { err: "Internal server error" };
	}
};

export const deleteQuote = async (id: string, context?: UserContext) => {
	try {
		const existing = await db.quote.findUnique({
			where: { id },
			include: { job: true },
		});

		if (!existing) {
			return { err: "Quote not found" };
		}

		// Check if quote has been converted to job
		if (existing.job) {
			return {
				err: "Cannot delete quote that has been converted to a job",
			};
		}

		await db.$transaction(async (tx) => {
			await logActivity({
				event_type: "quote.deleted",
				action: "deleted",
				entity_type: "quote",
				entity_id: id,
				actor_type: context?.techId
					? "technician"
					: context?.dispatcherId
					? "dispatcher"
					: "system",
				actor_id: context?.techId || context?.dispatcherId,
				changes: {
					quote_number: { old: existing.quote_number, new: null },
					title: { old: existing.title, new: null },
					status: { old: existing.status, new: null },
				},
				ip_address: context?.ipAddress,
				user_agent: context?.userAgent,
			});

			await tx.quote_note.deleteMany({
				where: { quote_id: id },
			});

			await tx.quote_line_item.deleteMany({
				where: { quote_id: id },
			});

			await tx.quote.delete({
				where: { id },
			});
		});

		return { err: "", item: { id } };
	} catch (error) {
		console.error("Delete quote error:", error);
		return { err: "Internal server error" };
	}
};

// ============================================================================
// QUOTE LINE ITEMS
// ============================================================================

export const getQuoteItems = async (quoteId: string) => {
	return await db.quote_line_item.findMany({
		where: { quote_id: quoteId },
		orderBy: { sort_order: "asc" },
	});
};

export const getQuoteItemById = async (quoteId: string, itemId: string) => {
	return await db.quote_line_item.findFirst({
		where: {
			id: itemId,
			quote_id: quoteId,
		},
	});
};

export const insertQuoteItem = async (
	quoteId: string,
	data: unknown,
	context?: UserContext
) => {
	try {
		const parsed = createQuoteItemSchema.parse(data);

		const quote = await db.quote.findUnique({
			where: { id: quoteId },
		});

		if (!quote) {
			return { err: "Quote not found" };
		}

		const created = await db.$transaction(async (tx) => {
			// Calculate total if not provided
			const total =
				parsed.total !== undefined
					? parsed.total
					: parsed.quantity * parsed.unit_price;

			const item = await tx.quote_line_item.create({
				data: {
					quote_id: quoteId,
					name: parsed.name,
					description: parsed.description || null,
					quantity: parsed.quantity,
					unit_price: parsed.unit_price,
					total: total,
					item_type: parsed.item_type || null,
					sort_order: parsed.sort_order,
				},
			});

			await logActivity({
				event_type: "quote_line_item.created",
				action: "created",
				entity_type: "quote_line_item",
				entity_id: item.id,
				actor_type: context?.techId
					? "technician"
					: context?.dispatcherId
					? "dispatcher"
					: "system",
				actor_id: context?.techId || context?.dispatcherId,
				changes: {
					name: { old: null, new: parsed.name },
					quote_id: { old: null, new: quoteId },
					total: { old: null, new: total },
				},
				ip_address: context?.ipAddress,
				user_agent: context?.userAgent,
			});

			return item;
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
		console.error("Insert quote line item error:", e);
		return { err: "Internal server error" };
	}
};

export const updateQuoteItem = async (
	quoteId: string,
	itemId: string,
	data: unknown,
	context?: UserContext
) => {
	try {
		const parsed = updateQuoteItemSchema.parse(data);

		const existing = await db.quote_line_item.findFirst({
			where: {
				id: itemId,
				quote_id: quoteId,
			},
		});

		if (!existing) {
			return { err: "Item not found" };
		}

		const changes = buildChanges(
			existing,
			parsed as any,
			["name", "description", "item_type", "sort_order"] as const
		);

		// Manually track numeric fields (Decimal type)
		if (
			parsed.quantity !== undefined &&
			Number(existing.quantity) !== parsed.quantity
		) {
			changes.quantity = { old: existing.quantity, new: parsed.quantity };
		}
		if (
			parsed.unit_price !== undefined &&
			Number(existing.unit_price) !== parsed.unit_price
		) {
			changes.unit_price = {
				old: existing.unit_price,
				new: parsed.unit_price,
			};
		}
		if (
			parsed.total !== undefined &&
			Number(existing.total) !== parsed.total
		) {
			changes.total = { old: existing.total, new: parsed.total };
		}

		const updated = await db.$transaction(async (tx) => {
			// Recalculate total if quantity or unit_price changed
			let total = parsed.total;
			if (total === undefined) {
				const newQuantity =
					parsed.quantity !== undefined
						? parsed.quantity
						: Number(existing.quantity);
				const newUnitPrice =
					parsed.unit_price !== undefined
						? parsed.unit_price
						: Number(existing.unit_price);
				total = newQuantity * newUnitPrice;
			}

			const item = await tx.quote_line_item.update({
				where: { id: itemId },
				data: {
					...(parsed.name !== undefined && { name: parsed.name }),
					...(parsed.description !== undefined && {
						description: parsed.description,
					}),
					...(parsed.quantity !== undefined && {
						quantity: parsed.quantity,
					}),
					...(parsed.unit_price !== undefined && {
						unit_price: parsed.unit_price,
					}),
					total: total,
					...(parsed.item_type !== undefined && {
						item_type: parsed.item_type,
					}),
					...(parsed.sort_order !== undefined && {
						sort_order: parsed.sort_order,
					}),
				},
			});

			if (Object.keys(changes).length > 0) {
				await logActivity({
					event_type: "quote_line_item.updated",
					action: "updated",
					entity_type: "quote_line_item",
					entity_id: itemId,
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

			return item;
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
		console.error("Update quote line item error:", e);
		return { err: "Internal server error" };
	}
};

export const deleteQuoteItem = async (
	quoteId: string,
	itemId: string,
	context?: UserContext
) => {
	try {
		const existing = await db.quote_line_item.findFirst({
			where: {
				id: itemId,
				quote_id: quoteId,
			},
		});

		if (!existing) {
			return { err: "Item not found" };
		}

		await db.$transaction(async (tx) => {
			await logActivity({
				event_type: "quote_line_item.deleted",
				action: "deleted",
				entity_type: "quote_line_item",
				entity_id: itemId,
				actor_type: context?.techId
					? "technician"
					: context?.dispatcherId
					? "dispatcher"
					: "system",
				actor_id: context?.techId || context?.dispatcherId,
				changes: {
					name: { old: existing.name, new: null },
					quote_id: { old: existing.quote_id, new: null },
				},
				ip_address: context?.ipAddress,
				user_agent: context?.userAgent,
			});

			await tx.quote_line_item.delete({
				where: { id: itemId },
			});
		});

		return { err: "", message: "Item deleted successfully" };
	} catch (error) {
		console.error("Delete quote line item error:", error);
		return { err: "Internal server error" };
	}
};

// ============================================================================
// QUOTE NOTES
// ============================================================================

export const getQuoteNotes = async (quoteId: string) => {
	return await db.quote_note.findMany({
		where: { quote_id: quoteId },
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

export const getQuoteNoteById = async (quoteId: string, noteId: string) => {
	return await db.quote_note.findFirst({
		where: {
			id: noteId,
			quote_id: quoteId,
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

export const insertQuoteNote = async (
	quoteId: string,
	data: unknown,
	context?: UserContext
) => {
	try {
		const parsed = createQuoteNoteSchema.parse(data);

		const quote = await db.quote.findUnique({
			where: { id: quoteId },
		});

		if (!quote) {
			return { err: "Quote not found" };
		}

		const created = await db.$transaction(async (tx) => {
			const note = await tx.quote_note.create({
				data: {
					quote_id: quoteId,
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
				event_type: "quote_note.created",
				action: "created",
				entity_type: "quote_note",
				entity_id: note.id,
				actor_type: context?.techId
					? "technician"
					: context?.dispatcherId
					? "dispatcher"
					: "system",
				actor_id: context?.techId || context?.dispatcherId,
				changes: {
					content: { old: null, new: parsed.content },
					quote_id: { old: null, new: quoteId },
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
		console.error("Insert quote note error:", e);
		return { err: "Internal server error" };
	}
};

export const updateQuoteNote = async (
	quoteId: string,
	noteId: string,
	data: unknown,
	context?: UserContext
) => {
	try {
		const parsed = updateQuoteNoteSchema.parse(data);

		const existing = await db.quote_note.findFirst({
			where: {
				id: noteId,
				quote_id: quoteId,
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

			const note = await tx.quote_note.update({
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
					event_type: "quote_note.updated",
					action: "updated",
					entity_type: "quote_note",
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
		console.error("Update quote note error:", e);
		return { err: "Internal server error" };
	}
};

export const deleteQuoteNote = async (
	quoteId: string,
	noteId: string,
	context?: UserContext
) => {
	try {
		const existing = await db.quote_note.findFirst({
			where: {
				id: noteId,
				quote_id: quoteId,
			},
		});

		if (!existing) {
			return { err: "Note not found" };
		}

		await db.$transaction(async (tx) => {
			await logActivity({
				event_type: "quote_note.deleted",
				action: "deleted",
				entity_type: "quote_note",
				entity_id: noteId,
				actor_type: context?.techId
					? "technician"
					: context?.dispatcherId
					? "dispatcher"
					: "system",
				actor_id: context?.techId || context?.dispatcherId,
				changes: {
					content: { old: existing.content, new: null },
					quote_id: { old: existing.quote_id, new: null },
				},
				ip_address: context?.ipAddress,
				user_agent: context?.userAgent,
			});

			await tx.quote_note.delete({
				where: { id: noteId },
			});
		});

		return { err: "", message: "Note deleted successfully" };
	} catch (error) {
		console.error("Delete quote note error:", error);
		return { err: "Internal server error" };
	}
};
