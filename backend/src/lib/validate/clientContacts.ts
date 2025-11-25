// model client_contact {
//   id          String @unique @id @default(uuid())
//   client_id   String
//   name        String
//   email       String
//   phone       String
//   relation    String
//   description String?
//   created_at  DateTime @default(now())
//   client      client @relation(fields: [client_id], references: [id])
// }
import z from "zod";

export const createContactSchema = z.object({
	name: z.string().min(1, "Contact name is required"),
	email: z.string().email("Invalid email address"),
	phone: z.string().min(1, "Phone number is required"),
	relation: z.string().min(1, "Relation is required"),
	description: z.string().optional(),
});

export const updateContactSchema = z.object({
	name: z.string().min(1, "Contact name is required").optional(),
	email: z.string().email("Invalid email address").optional(),
	phone: z.string().min(1, "Phone number is required").optional(),
	relation: z.string().min(1, "Relation is required").optional(),
	description: z.string().optional(),
}).refine(
	(data) => data.name !== undefined || data.email !== undefined || data.phone !== undefined || data.relation !== undefined || data.description !== undefined,
	{ message: "At least one field must be provided for update" }
);