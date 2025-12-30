import { ZodError } from "zod";
import { db } from "../db.js";
import {
	createJobSchema,
	updateJobSchema,
	createJobLineItemSchema,
	updateJobLineItemSchema,
} from "../lib/validate/jobs.js";
import { Request } from "express";
import { logActivity, buildChanges } from "../services/logger.js";

export interface UserContext {
	techId?: string;
	dispatcherId?: string;
	ipAddress?: string;
	userAgent?: string;
}

async function generateJobNumber(): Promise<string> {
	const year = new Date().getFullYear();
	const lastJob = await db.job.findFirst({
		where: {
			job_number: {
				startsWith: `J-${year}-`,
			},
		},
		orderBy: {
			created_at: "desc",
		},
	});

	let nextNumber = 1;
	if (lastJob) {
		const match = lastJob.job_number.match(/J-\d{4}-(\d+)/);
		if (match) {
			nextNumber = parseInt(match[1]) + 1;
		}
	}

	return `J-${year}-${nextNumber.toString().padStart(4, "0")}`;
}

// ============================================================================
// JOB CRUD
// ============================================================================

export const getAllJobs = async () => {
	return await db.job.findMany({
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
			quote: {
				select: {
					id: true,
					quote_number: true,
					status: true,
					total: true,
				},
			},
			visits: {
				include: {
					visit_techs: {
						include: {
							tech: true,
						},
					},
				},
			},
			line_items: true,
		},
		orderBy: { created_at: "desc" },
	});
};

export const getJobById = async (id: string) => {
	return await db.job.findUnique({
		where: { id },
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
			quote: {
				include: {
					line_items: true,
				},
			},
			visits: {
				include: {
					visit_techs: {
						include: {
							tech: true,
						},
					},
					notes: true,
				},
			},
			line_items: true,
			notes: true,
		},
	});
};

export const getJobsByClientId = async (clientId: string) => {
	return await db.job.findMany({
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
			quote: {
				select: {
					id: true,
					quote_number: true,
					total: true,
				},
			},
			visits: {
				include: {
					visit_techs: {
						include: {
							tech: true,
						},
					},
				},
			},
		},
		orderBy: { created_at: "desc" },
	});
};

export const insertJob = async (req: Request, context?: UserContext) => {
	try {
		console.log("=== CREATE JOB DEBUG ===");
		console.log("Request body:", JSON.stringify(req.body, null, 2));

		const parsed = createJobSchema.parse(req.body);

		console.log("Parsed successfully:", JSON.stringify(parsed, null, 2));

		const created = await db.$transaction(async (tx) => {
			const client = await tx.client.findUnique({
				where: { id: parsed.client_id },
			});

			if (!client) {
				throw new Error("Client not found");
			}

			// Validate technicians if provided
			if (parsed.tech_ids && parsed.tech_ids.length > 0) {
				const existingTechs = await tx.technician.findMany({
					where: { id: { in: parsed.tech_ids } },
					select: { id: true },
				});
				const existingIds = new Set(existingTechs.map((t) => t.id));
				const missing = parsed.tech_ids.filter(
					(id) => !existingIds.has(id)
				);
				if (missing.length > 0) {
					throw new Error(
						`Technicians not found: ${missing.join(", ")}`
					);
				}
			}

			let name = parsed.name;
			let description = parsed.description;
			let address = parsed.address;
			let coords: { lat: number; lon: number } | undefined =
				parsed.coords;
			let priority = parsed.priority;
			let estimatedTotal = parsed.estimated_total;

			// If linked to quote, inherit fields and copy line items
			if (parsed.quote_id) {
				const quote = await tx.quote.findUnique({
					where: { id: parsed.quote_id },
					include: {
						line_items: {
							orderBy: { sort_order: "asc" },
						},
					},
				});

				if (!quote) {
					throw new Error("Quote not found");
				}

				if (!name) name = quote.title;
				if (!description) description = quote.description;
				if (!address) address = quote.address;
				if (!coords && quote.coords) {
					coords = quote.coords as { lat: number; lon: number };
				}
				if (!priority) priority = quote.priority;
				if (!estimatedTotal) estimatedTotal = Number(quote.total);

				// Update quote status
				await tx.quote.update({
					where: { id: parsed.quote_id },
					data: { status: "Approved" },
				});
			}

			// If linked to request (no quote), inherit from request
			if (parsed.request_id && !parsed.quote_id) {
				const request = await tx.request.findUnique({
					where: { id: parsed.request_id },
				});

				if (!request) {
					throw new Error("Request not found");
				}

				if (!name) name = request.title;
				if (!description) description = request.description;
				if (!address && request.address) address = request.address;
				if (!coords && request.coords) {
					coords = request.coords as { lat: number; lon: number };
				}
				if (!priority) priority = request.priority;
			}

			if (!address) {
				throw new Error("Address is required for job");
			}
			if (!coords) {
				throw new Error("Coordinates are required for job");
			}
			if (!name) {
				throw new Error("Job name is required");
			}
			if (!description) {
				throw new Error("Job description is required");
			}

			const jobNumber = await generateJobNumber();

			const job = await tx.job.create({
				data: {
					job_number: jobNumber,
					name: name,
					description: description,
					priority: priority,
					client_id: parsed.client_id,
					address: address,
					coords: coords,
					status: parsed.status || "Unscheduled",
					request_id: parsed.request_id || null,
					quote_id: parsed.quote_id || null,
					estimated_total: estimatedTotal || null,
				},
			});

			// Copy line items from quote if it exists
			if (parsed.quote_id) {
				const quote = await tx.quote.findUnique({
					where: { id: parsed.quote_id },
					include: {
						line_items: {
							orderBy: { sort_order: "asc" },
						},
					},
				});

				if (quote && quote.line_items.length > 0) {
					for (const item of quote.line_items) {
						await tx.job_line_item.create({
							data: {
								job_id: job.id,
								name: item.name,
								description: item.description,
								quantity: item.quantity,
								unit_price: item.unit_price,
								total: item.total,
								source: "quote",
								item_type: item.item_type,
							},
						});
					}
				}
			}

			// Update request status if linked
			if (parsed.request_id) {
				await tx.request.update({
					where: { id: parsed.request_id },
					data: { status: "ConvertedToJob" },
				});
			}

			await tx.client.update({
				where: { id: parsed.client_id },
				data: { last_activity: new Date() },
			});

			await logActivity({
				event_type: "job.created",
				action: "created",
				entity_type: "job",
				entity_id: job.id,
				actor_type: context?.techId
					? "technician"
					: context?.dispatcherId
					? "dispatcher"
					: "system",
				actor_id: context?.techId || context?.dispatcherId,
				changes: {
					job_number: { old: null, new: job.job_number },
					name: { old: null, new: job.name },
					priority: { old: null, new: job.priority },
					status: { old: null, new: job.status },
					client_id: { old: null, new: job.client_id },
				},
				ip_address: context?.ipAddress,
				user_agent: context?.userAgent,
			});

			return tx.job.findUnique({
				where: { id: job.id },
				include: {
					client: true,
					request: true,
					quote: {
						include: {
							line_items: true,
						},
					},
					visits: {
						include: {
							visit_techs: {
								include: { tech: true },
							},
						},
					},
					line_items: true,
					notes: true,
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
		console.error("Insert job error:", e);
		return { err: "Internal server error" };
	}
};

export const updateJob = async (req: Request, context?: UserContext) => {
	try {
		const id = (req as any).params.id;
		const parsed = updateJobSchema.parse(req.body);

		const existing = await db.job.findUnique({ where: { id } });
		if (!existing) {
			return { err: "Job not found" };
		}

		const changes = buildChanges(
			existing,
			parsed as any,
			[
				"name",
				"description",
				"priority",
				"address",
				"status",
				"cancellation_reason",
			] as const
		);

		// Manually track Json and Decimal fields
		if (parsed.coords !== undefined) {
			changes.coords = { old: existing.coords, new: parsed.coords };
		}
		if (
			parsed.estimated_total !== undefined &&
			Number(existing.estimated_total) !== parsed.estimated_total
		) {
			changes.estimated_total = {
				old: existing.estimated_total,
				new: parsed.estimated_total,
			};
		}
		if (
			parsed.actual_total !== undefined &&
			Number(existing.actual_total) !== parsed.actual_total
		) {
			changes.actual_total = {
				old: existing.actual_total,
				new: parsed.actual_total,
			};
		}

		const updated = await db.$transaction(async (tx) => {
			const job = await tx.job.update({
				where: { id },
				data: {
					...(parsed.name !== undefined && { name: parsed.name }),
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
					...(parsed.estimated_total !== undefined && {
						estimated_total: parsed.estimated_total,
					}),
					...(parsed.actual_total !== undefined && {
						actual_total: parsed.actual_total,
					}),
					...(parsed.cancellation_reason !== undefined && {
						cancellation_reason: parsed.cancellation_reason,
					}),
					// Auto-timestamps
					...(parsed.status === "Completed" &&
						!existing.completed_at && { completed_at: new Date() }),
					...(parsed.status === "Cancelled" &&
						!existing.cancelled_at && { cancelled_at: new Date() }),
				},
				include: {
					client: true,
					request: true,
					quote: true,
					visits: {
						include: {
							visit_techs: {
								include: { tech: true },
							},
						},
					},
					line_items: true,
					notes: true,
				},
			});

			if (Object.keys(changes).length > 0) {
				await logActivity({
					event_type: "job.updated",
					action: "updated",
					entity_type: "job",
					entity_id: id,
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

			return job;
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
		console.error("Update job error:", e);
		return { err: "Internal server error" };
	}
};

export const deleteJob = async (id: string, context?: UserContext) => {
	try {
		const existing = await db.job.findUnique({
			where: { id },
		});

		if (!existing) {
			return { err: "Job not found" };
		}

		await db.$transaction(async (tx) => {
			await logActivity({
				event_type: "job.deleted",
				action: "deleted",
				entity_type: "job",
				entity_id: id,
				actor_type: context?.techId
					? "technician"
					: context?.dispatcherId
					? "dispatcher"
					: "system",
				actor_id: context?.techId || context?.dispatcherId,
				changes: {
					job_number: { old: existing.job_number, new: null },
					name: { old: existing.name, new: null },
					status: { old: existing.status, new: null },
				},
				ip_address: context?.ipAddress,
				user_agent: context?.userAgent,
			});

			await tx.job.delete({
				where: { id },
			});
		});

		return { err: "", item: { id } };
	} catch (e) {
		console.error("Delete job error:", e);
		return { err: "Internal server error" };
	}
};

// ============================================================================
// JOB LINE ITEMS
// ============================================================================

export const getJobLineItems = async (jobId: string) => {
	return await db.job_line_item.findMany({
		where: { job_id: jobId },
		orderBy: { created_at: "asc" },
	});
};

export const getJobLineItemById = async (jobId: string, itemId: string) => {
	return await db.job_line_item.findFirst({
		where: {
			id: itemId,
			job_id: jobId,
		},
	});
};

export const insertJobLineItem = async (
	jobId: string,
	data: unknown,
	context?: UserContext
) => {
	try {
		const parsed = createJobLineItemSchema.parse(data);

		const job = await db.job.findUnique({
			where: { id: jobId },
		});

		if (!job) {
			return { err: "Job not found" };
		}

		const created = await db.$transaction(async (tx) => {
			// Calculate total if not provided
			const total =
				parsed.total !== undefined
					? parsed.total
					: parsed.quantity * parsed.unit_price;

			const item = await tx.job_line_item.create({
				data: {
					job_id: jobId,
					name: parsed.name,
					description: parsed.description || null,
					quantity: parsed.quantity,
					unit_price: parsed.unit_price,
					total: total,
					source: parsed.source || "job",
					item_type: parsed.item_type || null,
				},
			});

			await logActivity({
				event_type: "job_line_item.created",
				action: "created",
				entity_type: "job_line_item",
				entity_id: item.id,
				actor_type: context?.techId
					? "technician"
					: context?.dispatcherId
					? "dispatcher"
					: "system",
				actor_id: context?.techId || context?.dispatcherId,
				changes: {
					name: { old: null, new: parsed.name },
					job_id: { old: null, new: jobId },
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
		console.error("Insert job line item error:", e);
		return { err: "Internal server error" };
	}
};

export const updateJobLineItem = async (
	jobId: string,
	itemId: string,
	data: unknown,
	context?: UserContext
) => {
	try {
		const parsed = updateJobLineItemSchema.parse(data);

		const existing = await db.job_line_item.findFirst({
			where: {
				id: itemId,
				job_id: jobId,
			},
		});

		if (!existing) {
			return { err: "Item not found" };
		}

		const changes = buildChanges(
			existing,
			parsed as any,
			["name", "description", "source", "item_type"] as const
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

			const item = await tx.job_line_item.update({
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
					...(parsed.source !== undefined && {
						source: parsed.source,
					}),
					...(parsed.item_type !== undefined && {
						item_type: parsed.item_type,
					}),
				},
			});

			if (Object.keys(changes).length > 0) {
				await logActivity({
					event_type: "job_line_item.updated",
					action: "updated",
					entity_type: "job_line_item",
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
		console.error("Update job line item error:", e);
		return { err: "Internal server error" };
	}
};

export const deleteJobLineItem = async (
	jobId: string,
	itemId: string,
	context?: UserContext
) => {
	try {
		const existing = await db.job_line_item.findFirst({
			where: {
				id: itemId,
				job_id: jobId,
			},
		});

		if (!existing) {
			return { err: "Item not found" };
		}

		await db.$transaction(async (tx) => {
			await logActivity({
				event_type: "job_line_item.deleted",
				action: "deleted",
				entity_type: "job_line_item",
				entity_id: itemId,
				actor_type: context?.techId
					? "technician"
					: context?.dispatcherId
					? "dispatcher"
					: "system",
				actor_id: context?.techId || context?.dispatcherId,
				changes: {
					name: { old: existing.name, new: null },
					job_id: { old: existing.job_id, new: null },
				},
				ip_address: context?.ipAddress,
				user_agent: context?.userAgent,
			});

			await tx.job_line_item.delete({
				where: { id: itemId },
			});
		});

		return { err: "", message: "Item deleted successfully" };
	} catch (error) {
		console.error("Delete job line item error:", error);
		return { err: "Internal server error" };
	}
};
