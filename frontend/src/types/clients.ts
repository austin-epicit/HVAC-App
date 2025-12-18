import type { Job } from "./jobs";
import z from "zod";
import type { Coordinates } from "./location";

// Client

export interface Client {
	id: string;
	name: string;
	address: string;
	coords: Coordinates;
	is_active: boolean;
	created_at: Date;
	last_activity: Date;
	jobs: Job[];
	contacts: ClientContact[];
	notes: ClientNote[];
}

export interface CreateClientInput {
	name: string;
	address: string;
	coords?: Coordinates;
	is_active: boolean;
}

export interface UpdateClientInput {
	name?: string;
	address?: string;
	coords?: Coordinates;
	is_active?: boolean;
}

export const CreateClientSchema = z.object({
	name: z.string().min(1, "Client name is required"),
	address: z.string().min(1, "Address is required"),
	is_active: z.boolean().default(true),
});

export const UpdateClientSchema = z.object({
	name: z.string().min(1, "Client name is required").optional(),
	address: z.string().min(1, "Address is required").optional(),
	is_active: z.boolean().optional(),
});

//Contacts

export interface ClientContact {
	id: string;
	name: string;
	email: string;
	phone: string;
	relation: string;
	description: string;
}

export interface CreateClientContactInput {
	name: string;
	email: string;
	phone: string;
	relation: string;
	description?: string;
}

export interface UpdateClientContactInput {
	name?: string;
	email?: string;
	phone?: string;
	relation?: string;
	description?: string;
}

export const CreateClientContactSchema = z.object({
	name: z.string().min(1, "Contact name is required"),
	email: z.string().email("Invalid email address"),
	phone: z.string().min(1, "Phone number is required"),
	relation: z.string().min(1, "Relation is required"),
	description: z.string().default(""),
});

export const UpdateClientContactSchema = z
	.object({
		name: z.string().min(1, "Contact name is required").optional(),
		email: z.string().email("Invalid email address").optional(),
		phone: z.string().min(1, "Phone number is required").optional(),
		relation: z.string().min(1, "Relation is required").optional(),
		description: z.string().optional(),
	})
	.refine(
		(data) =>
			data.name !== undefined ||
			data.email !== undefined ||
			data.phone !== undefined ||
			data.relation !== undefined ||
			data.description !== undefined,
		{ message: "At least one field must be provided for update" }
	);

// Notes

export interface ClientNote {
	id: string;
	content: string;
	created_at: Date;
	updated_at: Date;
}

export interface CreateClientNoteInput {
	content: string;
}

export interface UpdateClientNoteInput {
	content: string;
}

export const CreateClientNoteSchema = z.object({
	content: z.string().min(1, "Note content is required"),
});

export const UpdateClientNoteSchema = z.object({
	content: z.string().min(1, "Note content is required"),
});
