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
});
