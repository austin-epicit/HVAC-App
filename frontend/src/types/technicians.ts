import z from "zod";

// Technician

export type TechnicianStatus = "Offline" | "Available" | "Busy" | "Break";

// Basic job info that comes with job_tech relation
export interface TechnicianJob {
	id: string;
	name: string;
	description: string;
	status: string;
	address: string;
	start_date: Date;
	created_at: Date;
	client_id: string;
	priority: string;
	duration: number;
	window_end: Date | null;
	schedule_type: string;
}

export interface JobTechnician {
	job_id: string;
	tech_id: string;
	job: TechnicianJob;
}

export interface Technician {
	id: string;
	name: string;
	email: string;
	phone: string;
	title: string;
	description: string;
	status: TechnicianStatus;
	hire_date: Date;
	last_login: Date;
	job_tech?: JobTechnician[];
	logs?: any[];
	audit_logs?: any[];
	created_client_notes?: any[];
	last_edited_client_notes?: any[];
	created_job_notes?: any[];
	last_edited_job_notes?: any[];
}

export interface CreateTechnicianInput {
	name: string;
	email: string;
	phone: string;
	password: string;
	title: string;
	description?: string;
	status?: TechnicianStatus;
	hire_date?: Date;
}

export interface UpdateTechnicianInput {
	name?: string;
	email?: string;
	phone?: string;
	password?: string;
	title?: string;
	description?: string;
	status?: TechnicianStatus;
	hire_date?: Date;
	last_login?: Date;
}

export const CreateTechnicianSchema = z.object({
	name: z.string().min(1, "Technician name is required"),
	email: z.string().email("Invalid email address"),
	phone: z.string().min(1, "Phone number is required"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	title: z.string().min(1, "Title is required"),
	description: z.string().default(""),
	status: z.enum(["Offline", "Available", "Busy", "Break"]).default("Offline"),
	hire_date: z.coerce.date().optional().default(() => new Date()),
});

export const UpdateTechnicianSchema = z.object({
	name: z.string().min(1, "Technician name is required").optional(),
	email: z.string().email("Invalid email address").optional(),
	phone: z.string().min(1, "Phone number is required").optional(),
	password: z.string().min(8, "Password must be at least 8 characters").optional(),
	title: z.string().min(1, "Title is required").optional(),
	description: z.string().optional(),
	status: z.enum(["Offline", "Available", "Busy", "Break"]).optional(),
	hire_date: z.coerce.date().optional(),
	last_login: z.coerce.date().optional(),
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

export interface TechnicianResponse {
	err: string;
	data: Technician[];
}