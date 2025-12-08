import z from "zod";

export const createJobNoteSchema = z.object({
	content: z.string().min(1, "Content is required"),
	visit_id: z.string().uuid("Invalid visit ID").nullable().optional(),
});

export const updateJobNoteSchema = z.object({
	content: z.string().min(1, "Content is required").optional(),
	visit_id: z.string().uuid("Invalid visit ID").optional().nullable(),
});