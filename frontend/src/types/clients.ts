import type { Job } from "./jobs";
import z from "zod";

export interface Client {
	id: string;
	name: string;
	address: string;
	isActive: boolean;
	createdAt: Date;
	lastActivity: Date;
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
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateClientInput {
	name: string;
	address: string;
	isActive: boolean;
}

export const CreateClientSchema = z.object({
	name: z.string().min(1, "Client name is required"),
	address: z.string().min(1, "Address is required"),
	isActive: z.boolean().default(true),
});

export interface ClientResponse {
	err: string;
	data: Client[];
}
