// model technician {
//   id            String @unique @id @default(uuid())
//   name          String
//   email         String @unique
//   phone         String
//   password      String
//   title         String
//   description   String
//   status        technician_status
//   hire_date     DateTime
//   last_pos      Unsupported("point")
//   last_login    DateTime @default(now())
//   job_tech      job_technician[]
//   logs          log[]
//   audit_logs    audit_log[]
//   created_client_notes        client_note[] @relation("ClientNoteCreator")
//   last_edited_client_notes    client_note[] @relation("ClientNoteEditor")
//   created_job_notes           job_note[] @relation("JobNoteCreator")
//   last_edited_job_notes       job_note[] @relation("JobNoteEditor")
// }

import z from "zod";

const technicianStatusEnum = z.enum(["Offline", "Available", "Busy", "Break"]);

export const createTechnicianSchema = z.object({
	name: z.string().min(1, "Technician name is required"),
	email: z.string().email("Valid email is required"),
	phone: z.string().min(1, "Phone number is required"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	title: z.string().min(1, "Title is required"),
	description: z.string().default(""),
	status: technicianStatusEnum.default("Offline"),
	hire_date: z
		.preprocess(
			(val) => (typeof val === "string" || val instanceof Date ? new Date(val) : new Date()),
			z.date()
		)
		.default(() => new Date()),
});

export const updateTechnicianSchema = z.object({
	name: z.string().min(1, "Technician name is required").optional(),
	email: z.string().email("Valid email is required").optional(),
	phone: z.string().min(1, "Phone number is required").optional(),
	password: z.string().min(8, "Password must be at least 8 characters").optional(),
	title: z.string().min(1, "Title is required").optional(),
	description: z.string().optional(),
	status: technicianStatusEnum.optional(),
	hire_date: z
		.preprocess(
			(val) => (typeof val === "string" || val instanceof Date ? new Date(val) : val),
			z.date()
		)
		.optional(),
	last_login: z
		.preprocess(
			(val) => (typeof val === "string" || val instanceof Date ? new Date(val) : val),
			z.date()
		)
		.optional(),
}).refine(
	(data) => 
		data.name !== undefined || 
		data.email !== undefined || 
		data.phone !== undefined || 
		data.password !== undefined || 
		data.title !== undefined || 
		data.description !== undefined || 
		data.status !== undefined || 
		data.hire_date !== undefined ||
		data.last_login !== undefined,
	{ message: "At least one field must be provided for update" }
);