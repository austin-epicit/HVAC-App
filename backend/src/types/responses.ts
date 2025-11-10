import {
	client,
	job,
	job_technician,
	technician,
} from "../../generated/prisma/client";

export interface JobResponse {
	err: string;
	data: job[];
}

type JobWithRelations = job & {
	client: client;
	job_tech: (job_technician & { tech: technician })[];
};

export interface InsertResult {
	err: string;
	item?: JobWithRelations | null;
}

export interface InsertResult {
	err: string;
	item?: JobWithRelations | null;
}

export interface ClientResponse {
	err: string;
	data: client[];
}
