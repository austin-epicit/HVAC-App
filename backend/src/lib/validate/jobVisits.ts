import z from "zod";

export const createJobVisitSchema = z
	.object({
		job_id: z.string().uuid("Invalid job ID"),
		schedule_type: z.enum(["all_day", "exact", "window"]).default("exact"),
		scheduled_start_at: z.preprocess(
			(arg) => (typeof arg === "string" ? new Date(arg) : arg),
			z.date({ message: "Scheduled start time is required" })
		),
		scheduled_end_at: z.preprocess(
			(arg) => (typeof arg === "string" ? new Date(arg) : arg),
			z.date({ message: "Scheduled end time is required" })
		),
		arrival_window_start: z
			.preprocess(
				(arg) => {
					if (!arg) return null;
					return typeof arg === "string" ? new Date(arg) : arg;
				},
				z.date().nullable()
			)
			.optional(),
		arrival_window_end: z
			.preprocess(
				(arg) => {
					if (!arg) return null;
					return typeof arg === "string" ? new Date(arg) : arg;
				},
				z.date().nullable()
			)
			.optional(),
		status: z
			.enum(["Scheduled", "InProgress", "Completed", "Cancelled"])
			.default("Scheduled"),
		tech_ids: z.array(z.string().uuid("Invalid technician ID")).optional(),
	})
	.refine(
		(data) => {
			// Ensure scheduled_end_at is after scheduled_start_at
			return data.scheduled_end_at > data.scheduled_start_at;
		},
		{
			message: "Scheduled end time must be after scheduled start time",
			path: ["scheduled_end_at"],
		}
	)
	.refine(
		(data) => {
			// If schedule_type is "window", arrival_window_start and arrival_window_end are required
			if (data.schedule_type === "window") {
				return (
					data.arrival_window_start !== null &&
					data.arrival_window_start !== undefined &&
					data.arrival_window_end !== null &&
					data.arrival_window_end !== undefined
				);
			}
			return true;
		},
		{
			message:
				"Arrival window start and end are required for window schedule type",
			path: ["arrival_window_start"],
		}
	)
	.refine(
		(data) => {
			// If arrival windows are provided, ensure end is after start
			if (
				data.arrival_window_start &&
				data.arrival_window_end &&
				data.arrival_window_start instanceof Date &&
				data.arrival_window_end instanceof Date
			) {
				return data.arrival_window_end > data.arrival_window_start;
			}
			return true;
		},
		{
			message: "Arrival window end must be after arrival window start",
			path: ["arrival_window_end"],
		}
	);

export const updateJobVisitSchema = z
	.object({
		schedule_type: z.enum(["all_day", "exact", "window"]).optional(),
		scheduled_start_at: z
			.preprocess(
				(arg) => {
					if (!arg) return undefined;
					return typeof arg === "string" ? new Date(arg) : arg;
				},
				z.date().optional()
			)
			.optional(),
		scheduled_end_at: z
			.preprocess(
				(arg) => {
					if (!arg) return undefined;
					return typeof arg === "string" ? new Date(arg) : arg;
				},
				z.date().optional()
			)
			.optional(),
		arrival_window_start: z
			.preprocess(
				(arg) => {
					if (!arg) return null;
					return typeof arg === "string" ? new Date(arg) : arg;
				},
				z.date().nullable()
			)
			.optional(),
		arrival_window_end: z
			.preprocess(
				(arg) => {
					if (!arg) return null;
					return typeof arg === "string" ? new Date(arg) : arg;
				},
				z.date().nullable()
			)
			.optional(),
		actual_start_at: z
			.preprocess(
				(arg) => {
					if (!arg) return null;
					return typeof arg === "string" ? new Date(arg) : arg;
				},
				z.date().nullable()
			)
			.optional(),
		actual_end_at: z
			.preprocess(
				(arg) => {
					if (!arg) return null;
					return typeof arg === "string" ? new Date(arg) : arg;
				},
				z.date().nullable()
			)
			.optional(),
		status: z
			.enum(["Scheduled", "InProgress", "Completed", "Cancelled"])
			.optional(),
	})
	.refine(
		(data) => {
			// If both scheduled times are provided, ensure end is after start
			if (data.scheduled_start_at && data.scheduled_end_at) {
				return data.scheduled_end_at > data.scheduled_start_at;
			}
			return true;
		},
		{
			message: "Scheduled end time must be after scheduled start time",
			path: ["scheduled_end_at"],
		}
	)
	.refine(
		(data) => {
			// If both actual times are provided, ensure end is after start
			if (
				data.actual_start_at &&
				data.actual_end_at &&
				data.actual_start_at instanceof Date &&
				data.actual_end_at instanceof Date
			) {
				return data.actual_end_at > data.actual_start_at;
			}
			return true;
		},
		{
			message: "Actual end time must be after actual start time",
			path: ["actual_end_at"],
		}
	)
	.refine(
		(data) => {
			// If arrival windows are provided, ensure end is after start
			if (
				data.arrival_window_start &&
				data.arrival_window_end &&
				data.arrival_window_start instanceof Date &&
				data.arrival_window_end instanceof Date
			) {
				return data.arrival_window_end > data.arrival_window_start;
			}
			return true;
		},
		{
			message: "Arrival window end must be after arrival window start",
			path: ["arrival_window_end"],
		}
	);