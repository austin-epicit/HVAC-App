import type { Client } from "./clients";
import z from "zod";

export const JobStatusValues = [
	"Unscheduled",
	"Scheduled",
	"In Progress",
	"Completed",
	"Cancelled",
] as const;

export type JobStatus = (typeof JobStatusValues)[number];

export interface Job {
	id: string;
	name: string;
	tech_ids: string[];
	client_id: string;
	client: Client;
	address: string;
	description: string;
	status: JobStatus;
	schedule_type: "all_day" | "exact" | "window";
	duration?: number;
	start_date: string;
	window_end?: string | null;
	notes: JobNote[];
}

export interface CreateJobInput {
	name: string;
	tech_ids: string[];
	client_id: string;
	address: string;
	description: string;
	status: JobStatus;
	schedule_type: "all_day" | "exact" | "window";
	duration?: number;
	start_date: string;
	window_end?: string | null;
}

export interface JobNote {
	id: string;
	job_id: string;
	content: string;
	created_at: Date;
	updated_at?: Date;
}

export interface CreateJobNoteInput {
	content: string;
}

export interface UpdateJobNoteInput {
	content: string;
}

export interface JobResponse {
	err: string;
	data: Job[];
}

export const CreateJobSchema = z.object({
	name: z.string().min(1, "Job name is required"),
	tech_ids: z.array(z.string()).optional().default([]),
	client_id: z.string().min(1, "Please select a client"),
});

export const CreateJobNoteSchema = z.object({
	content: z.string().min(1, "Note content is required"),
});

export const UpdateJobNoteSchema = z.object({
	content: z.string().min(1, "Note content is required"),
});
