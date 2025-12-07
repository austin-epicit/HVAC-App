import {
	client,
	client_contact,
	client_note,
	job,
	job_visit,
	job_visit_technician,
	job_note,
	technician,
	log,
	audit_log
} from "../../generated/prisma/client";

//JOB RESPONSE TYPES
export interface JobResponse {
	err: string;
	data: any[];
}

export interface JobInsertResult {
	err: string;
	item?: any;
}

// JOB VISIT RESPONSE TYPES
export interface JobVisitResponse {
	err: string;
	data: any[];
}

export interface JobVisitInsertResult {
	err: string;
	item?: any;
}

// CLIENT RESPONSE TYPES
export interface ClientResponse {
	err: string;
	data: client[];
}

export interface ClientInsertResult {
	err: string;
	item?: client | null;
}

// CONTACT RESPONSE TYPES
export interface ContactResponse {
	err: string;
	data: client_contact[];
}

export interface ContactInsertResult {
	err: string;
	item?: client_contact | null;
}

// NOTE RESPONSE TYPES
export interface NoteResponse {
	err: string;
	data: client_note[];
}

export interface NoteInsertResult {
	err: string;
	item?: client_note | null;
}

// TECHNICIAN RESPONSE TYPES
export interface TechnicianResponse {
	err: string;
	data: technician[];
}

export interface TechnicianInsertResult {
	err: string;
	item?: any;
}

// DELETE RESPONSE TYPE
export interface DeleteResult {
	err: string;
	message?: string;
}