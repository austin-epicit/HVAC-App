import z from "zod";

export const createJobNoteSchema = z.object({
	content: z.string().min(1, "Note content is required"),
});

export const updateJobNoteSchema = z.object({
	content: z.string().min(1, "Note content is required"),
});