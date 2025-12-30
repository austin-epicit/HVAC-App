import { z } from "zod";

export const createQuoteSchema = z
	.object({
		client_id: z.string().uuid("Invalid client ID"),
		request_id: z.string().uuid("Invalid request ID").optional().nullable(),
		title: z.string().min(1, "Title is required").optional(),
		description: z.string().optional(),
		address: z.string().min(1, "Address is required").optional(),
		coords: z
			.object({
				lat: z.number(),
				lon: z.number(),
			})
			.optional(),
		priority: z
			.enum(["Low", "Medium", "High", "Urgent", "Emergency"])
			.optional()
			.default("Medium"),
		subtotal: z.number().min(0).optional().default(0),
		tax_rate: z.number().min(0).max(1).optional().default(0),
		tax_amount: z.number().min(0).optional().default(0),
		discount_amount: z.number().min(0).optional().default(0),
		total: z.number().min(0).optional().default(0),
		valid_until: z
			.string()
			.datetime()
			.optional()
			.nullable()
			.transform((val) => (val === "" || val === null ? null : val)),
		expires_at: z
			.string()
			.datetime()
			.optional()
			.nullable()
			.transform((val) => (val === "" || val === null ? null : val)),
		status: z
			.enum([
				"Draft",
				"Sent",
				"Viewed",
				"Approved",
				"Rejected",
				"Revised",
				"Expired",
				"Cancelled",
			])
			.optional()
			.default("Draft"),
	})
	.transform((data) => ({
		...data,
		title: data.title || undefined,
		description: data.description || undefined,
		address: data.address || undefined,
		coords: data.coords || undefined,
		valid_until: data.valid_until || undefined,
		expires_at: data.expires_at || undefined,
	}));

export const updateQuoteSchema = z
	.object({
		title: z.string().min(1).optional(),
		description: z.string().optional(),
		address: z.string().min(1).optional(),
		coords: z
			.object({
				lat: z.number(),
				lon: z.number(),
			})
			.optional(),
		priority: z
			.enum(["Low", "Medium", "High", "Urgent", "Emergency"])
			.optional(),
		subtotal: z.number().min(0).optional(),
		tax_rate: z.number().min(0).max(1).optional(),
		tax_amount: z.number().min(0).optional(),
		discount_amount: z.number().min(0).optional(),
		total: z.number().min(0).optional(),
		valid_until: z
			.string()
			.datetime()
			.optional()
			.nullable()
			.transform((val) => (val === "" || val === null ? null : val)),
		expires_at: z
			.string()
			.datetime()
			.optional()
			.nullable()
			.transform((val) => (val === "" || val === null ? null : val)),
		status: z
			.enum([
				"Draft",
				"Sent",
				"Viewed",
				"Approved",
				"Rejected",
				"Revised",
				"Expired",
				"Cancelled",
			])
			.optional(),
		rejection_reason: z.string().optional().nullable(),
	})
	.transform((data) => ({
		...data,
		title: data.title || undefined,
		description: data.description || undefined,
		address: data.address || undefined,
		coords: data.coords || undefined,
		valid_until: data.valid_until || undefined,
		expires_at: data.expires_at || undefined,
		rejection_reason: data.rejection_reason || undefined,
	}));

export const createQuoteItemSchema = z
	.object({
		name: z.string().min(1, "Item name is required"),
		description: z.string().optional().nullable(),
		quantity: z.number().min(0, "Quantity must be non-negative").default(1),
		unit_price: z.number().min(0, "Unit price must be non-negative"),
		total: z.number().min(0, "Total must be non-negative").optional(),
		item_type: z
			.enum(["labor", "material", "equipment", "other"])
			.optional()
			.nullable(),
		sort_order: z.number().int().optional().default(0),
	})
	.transform((data) => ({
		...data,
		description: data.description || undefined,
		total:
			data.total !== undefined
				? data.total
				: data.quantity * data.unit_price,
		item_type: data.item_type || undefined,
	}));

export const updateQuoteItemSchema = z
	.object({
		name: z.string().min(1, "Item name is required").optional(),
		description: z.string().optional().nullable(),
		quantity: z.number().min(0, "Quantity must be non-negative").optional(),
		unit_price: z
			.number()
			.min(0, "Unit price must be non-negative")
			.optional(),
		total: z.number().min(0, "Total must be non-negative").optional(),
		item_type: z
			.enum(["labor", "material", "equipment", "other"])
			.optional()
			.nullable(),
		sort_order: z.number().int().optional(),
	})
	.transform((data) => ({
		...data,
		description: data.description || undefined,
		item_type: data.item_type || undefined,
	}));

export const createQuoteNoteSchema = z.object({
	content: z.string().min(1, "Note content is required"),
});

export const updateQuoteNoteSchema = z.object({
	content: z.string().min(1, "Note content is required"),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type CreateQuoteItemInput = z.infer<typeof createQuoteItemSchema>;
export type UpdateQuoteItemInput = z.infer<typeof updateQuoteItemSchema>;
export type CreateQuoteNoteInput = z.infer<typeof createQuoteNoteSchema>;
export type UpdateQuoteNoteInput = z.infer<typeof updateQuoteNoteSchema>;
