import z from "zod";

export const createJobSchema = z.object({
	name: z.string().min(1, "Job name is required"),
	description: z.string().optional().default(""),
	priority: z.string().optional().default("normal"),
	client_id: z.string(),
	tech_ids: z.array(z.string().uuid("Invalid technician ID")).default([]),
	address: z.string().optional().default(""),
	status: z
		.enum([
			"Unscheduled",
			"Scheduled",
			"In Progress",
			"Completed",
			"Cancelled",
		])
		.default("Unscheduled"),
	time_mins: z.number().int().nonnegative().default(0),
	start_date: z
		.preprocess(
			(arg) => (typeof arg === "string" ? new Date(arg) : arg),
			z.date({ error: "Start date is required" })
		)
		.default(new Date()),
});
