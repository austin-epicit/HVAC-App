import z from "zod";

export const createJobSchema = z.object({
	name: z.string().min(1, "Job name is required").optional(),
	description: z.string().optional(),
	priority: z
		.enum(["Low", "Medium", "High", "Urgent", "Emergency"])
		.optional()
		.default("Medium"),
	client_id: z.string().uuid("Invalid client ID"),
	tech_ids: z.array(z.string().uuid("Invalid technician ID")).optional(),
	address: z.string().min(1, "Address is required").optional(),
	coords: z
		.object({
			lat: z.number(),
			lon: z.number(),
		})
		.optional(),
	status: z
		.enum([
			"Unscheduled",
			"Scheduled",
			"InProgress",
			"Completed",
			"Cancelled",
		])
		.optional()
		.default("Unscheduled"),
	request_id: z.string().uuid().optional(),
	quote_id: z.string().uuid().optional(),

	estimated_total: z.number().optional(),
	actual_total: z.number().optional(),
	cancellation_reason: z.string().optional(),
});

export const updateJobSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	priority: z
		.enum(["Low", "Medium", "High", "Urgent", "Emergency"])
		.optional(),
	address: z.string().optional(),
	coords: z
		.object({
			lat: z.number(),
			lon: z.number(),
		})
		.optional(),
	status: z
		.enum([
			"Unscheduled",
			"Scheduled",
			"InProgress",
			"Completed",
			"Cancelled",
		])
		.optional(),
	estimated_total: z.number().optional(),
	actual_total: z.number().optional(),
	cancellation_reason: z.string().optional(),
});

export const createJobLineItemSchema = z.object({
	name: z.string().min(1, "Item name is required"),
	description: z.string().optional(),
	quantity: z.number().min(0, "Quantity must be non-negative").default(1),
	unit_price: z.number().min(0, "Unit price must be non-negative"),
	total: z.number().min(0, "Total must be non-negative").optional(),
	source: z.enum(["quote", "job", "visit"]).optional(),
	item_type: z.enum(["labor", "material", "equipment", "other"]).optional(),
});

export const updateJobLineItemSchema = z.object({
	name: z.string().min(1, "Item name is required").optional(),
	description: z.string().optional(),
	quantity: z.number().min(0, "Quantity must be non-negative").optional(),
	unit_price: z.number().min(0, "Unit price must be non-negative").optional(),
	total: z.number().min(0, "Total must be non-negative").optional(),
	source: z.enum(["quote", "job", "visit"]).optional(),
	item_type: z.enum(["labor", "material", "equipment", "other"]).optional(),
});

export const createJobNoteSchema = z.object({
	content: z.string().min(1, "Content is required"),
	visit_id: z.string().uuid("Invalid visit ID").optional(),
});

export const updateJobNoteSchema = z.object({
	content: z.string().min(1, "Content is required").optional(),
	visit_id: z.string().uuid("Invalid visit ID").optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type CreateJobLineItemInput = z.infer<typeof createJobLineItemSchema>;
export type UpdateJobLineItemInput = z.infer<typeof updateJobLineItemSchema>;
export type CreateJobNoteInput = z.infer<typeof createJobNoteSchema>;
export type UpdateJobNoteInput = z.infer<typeof updateJobNoteSchema>;
