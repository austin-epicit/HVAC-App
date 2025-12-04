import z from "zod";
import type { Client } from "./clients";

export const JobStatusValues = [
	"Unscheduled",
	"Scheduled",
	"In Progress",
	"Completed",
	"Cancelled",
] as const;

export type JobStatus = (typeof JobStatusValues)[number];

export interface JobNote {
	id: string;
	job_id: string;
	tech_id?: string | null;
	dispatcher_id?: string | null;
	content: string;
	created_at: Date;
	updated_at?: Date;
	tech?: {
		id: string;
		name: string;
		email: string;
	} | null;
	dispatcher?: {
		id: string;
		name: string;
		email: string;
	} | null;
}

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

export interface CreateJobNoteInput {
	content: string;
	tech_id?: string | null;
	dispatcher_id?: string | null;
}

export interface UpdateJobNoteInput {
	content: string;
	tech_id?: string | null;
	dispatcher_id?: string | null;
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
	tech_id: z.string().uuid().optional().nullable(),
	dispatcher_id: z.string().uuid().optional().nullable(),
}).refine(
	(data) => {
		// Can't have both tech_id and dispatcher_id
		return !(data.tech_id && data.dispatcher_id);
	},
	{
		message: "Note cannot be attributed to both a technician and dispatcher",
	}
);

export const UpdateJobNoteSchema = z.object({
	content: z.string().min(1, "Note content is required"),
	tech_id: z.string().uuid().optional().nullable(),
	dispatcher_id: z.string().uuid().optional().nullable(),
}).refine(
	(data) => {
		// Can't have both tech_id and dispatcher_id
		return !(data.tech_id && data.dispatcher_id);
	},
	{
		message: "Note cannot be attributed to both a technician and dispatcher",
	}
);