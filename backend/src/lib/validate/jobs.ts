import z from "zod";

export const createJobSchema = z.object({
	name: z.string().min(1, "Job name is required"),
	description: z.string().optional().default(""),
	priority: z.string().optional().default("normal"),
	client_id: z.string().uuid("Invalid client ID"),
	tech_ids: z.array(z.string().uuid("Invalid technician ID")).default([]),
	address: z.string().optional().default(""),
	coords: z.object({
		lat: z.number(),
		lon: z.number(),
	}),
	status: z
		.enum([
			"Unscheduled",
			"Scheduled",
			"InProgress",
			"Completed",
			"Cancelled",
		])
		.default("Unscheduled"),
});
