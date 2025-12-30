import z from "zod";
import type { Client } from "./clients";
import type { Quote } from "./quotes";
import type { Job } from "./jobs";
import type { Coordinates } from "./location";

export interface Request {
	id: string;
	client_id: string;
	title: string;
	description: string;
	address: string | null;
	coords: Coordinates;
	priority: "Low" | "Medium" | "High" | "Urgent" | "Emergency";
	status:
		| "New"
		| "Reviewing"
		| "NeedsQuote"
		| "Quoted"
		| "QuoteApproved"
		| "QuoteRejected"
		| "ConvertedToJob"
		| "Cancelled";
	requires_quote: boolean;
	estimated_value: number | null;
	source: string | null;
	source_reference: string | null;
	assigned_dispatcher_id: string | null;
	cancellation_reason: string | null;
	cancelled_at: Date | null;
	created_at: Date;
	updated_at: Date;

	client?: Client;
	assigned_dispatcher?: {
		id: string;
		name: string;
		email: string;
	};
	quotes?: Quote[];
	job?: Job | null;
	notes?: RequestNote[];
}

export interface CreateRequestInput {
	client_id: string;
	title: string;
	description: string;
	address?: string;
	coords?: Coordinates;
	priority?: "Low" | "Medium" | "High" | "Urgent" | "Emergency";
	requires_quote?: boolean;
	estimated_value?: number | null;
	source?: string | null;
	source_reference?: string | null;
	assigned_dispatcher_id?: string | null;
}

export interface UpdateRequestInput {
	title?: string;
	description?: string;
	address?: string;
	coords?: Coordinates;
	priority?: "Low" | "Medium" | "High" | "Urgent" | "Emergency";
	status?:
		| "New"
		| "Reviewing"
		| "NeedsQuote"
		| "Quoted"
		| "QuoteApproved"
		| "QuoteRejected"
		| "ConvertedToJob"
		| "Cancelled";
	requires_quote?: boolean;
	estimated_value?: number | null;
	source?: string | null;
	source_reference?: string | null;
	assigned_dispatcher_id?: string | null;
	cancellation_reason?: string | null;
}

export const CreateRequestSchema = z.object({
	client_id: z.string().uuid("Invalid client ID"),
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	priority: z.enum(["Low", "Medium", "High", "Urgent", "Emergency"]).default("Medium"),
	requires_quote: z.boolean().default(false),
	estimated_value: z.number().min(0).optional().nullable(),
	source: z.string().optional().or(z.literal("")).nullable(),
	source_reference: z.string().optional().or(z.literal("")).nullable(),
	assigned_dispatcher_id: z.string().uuid().optional().nullable(),
});

export const UpdateRequestSchema = z.object({
	title: z.string().min(1).optional(),
	description: z.string().min(1).optional(),
	priority: z.enum(["Low", "Medium", "High", "Urgent", "Emergency"]).optional(),
	status: z
		.enum([
			"New",
			"Reviewing",
			"NeedsQuote",
			"Quoted",
			"QuoteApproved",
			"QuoteRejected",
			"ConvertedToJob",
			"Cancelled",
		])
		.optional(),
	requires_quote: z.boolean().optional(),
	estimated_value: z.number().min(0).optional().nullable(),
	source: z.string().optional().or(z.literal("")).nullable(),
	source_reference: z.string().optional().or(z.literal("")).nullable(),
	assigned_dispatcher_id: z.string().uuid().optional().nullable(),
	cancellation_reason: z.string().optional().or(z.literal("")).nullable(),
});

export const RequestStatusValues = [
	"New",
	"Reviewing",
	"NeedsQuote",
	"Quoted",
	"QuoteApproved",
	"QuoteRejected",
	"ConvertedToJob",
	"Cancelled",
] as const;

export const RequestPriorityValues = ["Low", "Medium", "High", "Urgent", "Emergency"] as const;

export const RequestStatusLabels: Record<string, string> = {
	New: "New",
	Reviewing: "Reviewing",
	NeedsQuote: "Needs Quote",
	Quoted: "Quoted",
	QuoteApproved: "Quote Approved",
	QuoteRejected: "Quote Rejected",
	ConvertedToJob: "Converted to Job",
	Cancelled: "Cancelled",
};

export const RequestPriorityLabels: Record<string, string> = {
	Low: "Low",
	Medium: "Medium",
	High: "High",
	Urgent: "Urgent",
	Emergency: "Emergency",
};

// Status colors for UI
export const RequestStatusColors: Record<string, string> = {
	New: "bg-blue-600/20 text-blue-400 border-blue-700",
	Reviewing: "bg-yellow-600/20 text-yellow-400 border-yellow-700",
	NeedsQuote: "bg-orange-600/20 text-orange-400 border-orange-700",
	Quoted: "bg-purple-600/20 text-purple-400 border-purple-700",
	QuoteApproved: "bg-green-600/20 text-green-400 border-green-700",
	QuoteRejected: "bg-red-600/20 text-red-400 border-red-700",
	ConvertedToJob: "bg-emerald-600/20 text-emerald-400 border-emerald-700",
	Cancelled: "bg-gray-600/20 text-gray-400 border-gray-700",
};

// Priority colors for UI
export const RequestPriorityColors: Record<string, string> = {
	Low: "bg-gray-600/20 text-gray-400 border-gray-700",
	Medium: "bg-blue-600/20 text-blue-400 border-blue-700",
	High: "bg-orange-600/20 text-orange-400 border-orange-700",
	Urgent: "bg-red-600/20 text-red-400 border-red-700",
	Emergency: "bg-red-700/30 text-red-300 border-red-600 font-bold",
};

export interface RequestNote {
	id: string;
	request_id: string;
	content: string;
	created_at: Date;
	updated_at: Date;

	creator_tech_id: string | null;
	creator_dispatcher_id: string | null;
	creator_tech?: { id: string; name: string; email: string };
	creator_dispatcher?: { id: string; name: string; email: string };
	last_editor_tech_id: string | null;
	last_editor_dispatcher_id: string | null;
	last_editor_tech?: { id: string; name: string; email: string };
	last_editor_dispatcher?: { id: string; name: string; email: string };
}

export interface CreateRequestNoteInput {
	content: string;
}

export interface UpdateRequestNoteInput {
	content: string;
}

export const CreateRequestNoteSchema = z.object({
	content: z.string().min(1, "Note content is required"),
});

export const UpdateRequestNoteSchema = z.object({
	content: z.string().min(1, "Note content is required"),
});
