import type { Job } from "./jobs";
import z from "zod";

export interface Client {
	id: string;
	name: string;
	address: string;
	is_active: boolean;
	created_at: Date;
	last_activity: Date;
	jobs: Job[];
	contacts: ClientContact[];
	notes: ClientNote[];
}

export interface ClientContact {
	id: string;
	name: string;
	email: string;
	phone: string;
	relation: string;
	description: string;
}

export interface ClientNote {
	id: string;
	content: string;
	created_at: Date;
	updated_at: Date;
}

export interface CreateClientInput {
	name: string;
	address: string;
	is_active: boolean;
}

export const CreateClientSchema = z.object({
	name: z.string().min(1, "Client name is required"),
	address: z.string().min(1, "Address is required"),
	is_active: z.boolean().default(true),
});

export interface ClientResponse {
	err: string;
	data: Client[];
}
