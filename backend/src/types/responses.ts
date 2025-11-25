import {
	client,
	client_contact,
	client_note,
	job,
	job_technician,
	technician,
} from "../../generated/prisma/client";

//JOB RESPONSE TYPES
export interface JobResponse {
	err: string;
	data: job[];
}

type JobWithRelations = job & {
	client: client;
	job_tech: (job_technician & { tech: technician })[];
};

export interface JobInsertResult {
	err: string;
	item?: JobWithRelations | null;
}

// CLIENT RESPONSE TYPES
export interface ClientResponse {
	err: string;
	data: client[];
}

type ClientWithRelations = client & {
	jobs: job[];
	contacts: client_contact[];
	notes: client_note[];
};

export interface ClientInsertResult {
	err: string;
	item?: client | null;
}

// CONTACT RESPONSE TYPES
export interface ContactResponse {
	err: string;
	data: client_contact[];
}

type ContactWithRelations = client_contact & {
	client: client;
};

export interface ContactInsertResult {
	err: string;
	item?: client_contact | null;
}

// NOTE RESPONSE TYPES
export interface NoteResponse {
	err: string;
	data: client_note[];
}

type NoteWithRelations = client_note & {
	client: client;
};

export interface NoteInsertResult {
	err: string;
	item?: client_note | null;
}

// DELETE RESPONSE TYPE
export interface DeleteResult {
	err: string;
	message?: string;
}