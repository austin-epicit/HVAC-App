// model client {
//   id            String @unique @id @default(uuid())
//   name          String
//   address       String
//   is_active     Boolean
//   created_at    DateTime @default(now())
//   last_activity DateTime
//   jobs          job[]
//   contacts      client_contact[]
//   notes         client_note[]
// }
import z from "zod";

export const createClientSchema = z.object({
	name: z.string().min(1, "Client name is required"),
	address: z.string().min(1, "Client address is required"),
	is_active: z.boolean().optional().default(true),
	jobs: z.array(z.string().uuid("Invalid job ID")).default([]),
	contacts: z.array(z.string().uuid("Invalid contact ID")).default([]),
	notes: z.array(z.string().uuid("Invalid note ID")).default([]),
	last_activity: z
		.preprocess(
			(val) => (typeof val === "string" || val instanceof Date ? new Date(val) : new Date()),
			z.date()
		)
		.default(() => new Date()),
});

export const updateClientSchema = z.object({
	name: z.string().min(1, "Client name is required").optional(),
	address: z.string().min(1, "Address is required").optional(),
	is_active: z.boolean().optional(),
	last_activity: z
		.preprocess(
			(val) => (typeof val === "string" || val instanceof Date ? new Date(val) : val),
			z.date()
		)
		.optional(),
}).refine(
	(data) => data.name !== undefined || data.address !== undefined || data.is_active !== undefined || data.last_activity !== undefined,
	{ message: "At least one field must be provided for update" }
);