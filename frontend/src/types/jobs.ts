export const JobStatusValues = ["Scheduled", "In Progress", "Completed", "Cancelled"] as const;
export type JobStatus = (typeof JobStatusValues)[number];

export interface Job {
	id: string;
	name: string;
	tech_ids: string[];
	client_id: string;
	status: JobStatus;
}

export interface CreateJobInput {
	name: string;
	tech_ids: string[];
	client_id: string;
}

export interface JobResponse {
	err: string;
	data: Job[];
}
