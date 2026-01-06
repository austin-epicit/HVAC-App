import type { ClientWithPrimaryContact } from "./clients";
import type { Coordinates } from "./location";

export const QuoteStatusValues = [
	"Draft",
	"Pending",
	"Sent",
	"Approved",
	"Rejected",
	"Expired",
] as const;

export type QuoteStatus = (typeof QuoteStatusValues)[number];

export const QuotePriorityValues = ["Low", "Medium", "High"] as const;

export type QuotePriority = (typeof QuotePriorityValues)[number];

export const QuoteStatusLabels: Record<QuoteStatus, string> = {
	Draft: "Draft",
	Pending: "Pending",
	Sent: "Sent",
	Approved: "Approved",
	Rejected: "Rejected",
	Expired: "Expired",
};

export const QuoteStatusColors: Record<QuoteStatus, string> = {
	Draft: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
	Pending: "bg-blue-500/20 text-blue-400 border-blue-500/30",
	Sent: "bg-purple-500/20 text-purple-400 border-purple-500/30",
	Approved: "bg-green-500/20 text-green-400 border-green-500/30",
	Rejected: "bg-red-500/20 text-red-400 border-red-500/30",
	Expired: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export const QuotePriorityLabels: Record<QuotePriority, string> = {
	Low: "Low",
	Medium: "Medium",
	High: "High",
};

export const QuotePriorityColors: Record<QuotePriority, string> = {
	Low: "bg-gray-600/20 text-gray-400 border-gray-700",
	Medium: "bg-blue-600/20 text-blue-400 border-blue-700",
	High: "bg-orange-600/20 text-orange-400 border-orange-700",
};

export const LineItemTypeValues = ["labor", "material", "equipment"] as const;

export type LineItemType = (typeof LineItemTypeValues)[number];

// ============================================================================
// QUOTE SUMMARY TYPES (for listings and references)
// ============================================================================

export interface QuoteSummary {
	id: string;
	quote_number: string;
	title: string;
	status: QuoteStatus;
	total: number;
	created_at: Date;
}

export interface QuoteRequestReference {
	id: string;
	title: string;
	status: string;
}

export interface QuoteJobReference {
	id: string;
	name: string;
	status: string;
}

export interface QuoteVersionReference {
	id: string;
	quote_number: string;
	version: number;
}

export interface DispatcherReference {
	id: string;
	name: string;
	email: string;
}

// ============================================================================
// QUOTE TYPES
// ============================================================================

export interface Quote {
	id: string;
	quote_number: string;
	client_id: string;
	request_id: string | null;
	title: string;
	description: string;
	status: QuoteStatus;
	address: string;
	coords: Coordinates | null;
	priority: QuotePriority;
	is_active: boolean;
	version: number;
	previous_quote_id: string | null;

	// Financial fields
	subtotal: number;
	tax_rate: number;
	tax_amount: number;
	discount_amount: number;
	total: number;

	// Timestamps
	created_at: Date;
	updated_at: Date;
	sent_at: Date | null;
	viewed_at: Date | null;
	approved_at: Date | null;
	rejected_at: Date | null;
	valid_until: Date | null;
	expires_at: Date | null;

	rejection_reason: string | null;
	created_by_dispatcher_id: string | null;

	client?: ClientWithPrimaryContact;
	request?: QuoteRequestReference;
	line_items?: QuoteLineItem[];
	notes?: QuoteNote[];
	job?: QuoteJobReference | null;
	previous_quote?: QuoteVersionReference | null;
	revised_quote?: QuoteVersionReference | null;
	created_by_dispatcher?: DispatcherReference | null;
}

export interface CreateQuoteInput {
	client_id: string;
	request_id?: string;
	title: string;
	description: string;
	address: string;
	coords?: Coordinates;
	priority: QuotePriority;
	status?: QuoteStatus;
	subtotal: number;
	tax_rate?: number;
	tax_amount?: number;
	discount_amount?: number;
	total: number;
	valid_until?: Date | string;
	expires_at?: Date | string;
	created_by_dispatcher_id?: string;
	line_items?: CreateQuoteLineItemInput[];
}

export interface UpdateQuoteInput {
	title?: string;
	description?: string;
	address?: string;
	coords?: Coordinates;
	priority?: QuotePriority;
	status?: QuoteStatus;
	subtotal?: number;
	tax_rate?: number;
	tax_amount?: number;
	discount_amount?: number;
	total?: number;
	valid_until?: Date | string | null;
	expires_at?: Date | string | null;
	rejection_reason?: string | null;
	is_active?: boolean;
}

// ============================================================================
// LINE ITEM TYPES
// ============================================================================

export interface QuoteLineItem {
	id: string;
	quote_id: string;
	name: string;
	description: string | null;
	quantity: number;
	unit_price: number;
	total: number;
	item_type: LineItemType | null;
	sort_order: number;
}

export interface CreateQuoteLineItemInput {
	name: string;
	description?: string;
	quantity: number;
	unit_price: number;
	total: number;
	item_type?: LineItemType;
	sort_order?: number;
}

export interface UpdateQuoteLineItemInput {
	name?: string;
	description?: string | null;
	quantity?: number;
	unit_price?: number;
	total?: number;
	item_type?: LineItemType | null;
	sort_order?: number;
}

// ============================================================================
// QUOTE NOTES
// ============================================================================

export interface QuoteNote {
	id: string;
	quote_id: string;
	content: string;
	created_at: Date;
	updated_at: Date;
	creator_tech_id: string | null;
	creator_dispatcher_id: string | null;
	last_editor_tech_id: string | null;
	last_editor_dispatcher_id: string | null;

	creator_tech?: { id: string; name: string } | null;
	creator_dispatcher?: { id: string; name: string } | null;
	last_editor_tech?: { id: string; name: string } | null;
	last_editor_dispatcher?: { id: string; name: string } | null;
}

export interface CreateQuoteNoteInput {
	content: string;
	creator_tech_id?: string;
	creator_dispatcher_id?: string;
}

export interface UpdateQuoteNoteInput {
	content?: string;
	last_editor_tech_id?: string;
	last_editor_dispatcher_id?: string;
}

export interface QuoteStatistics {
	total_quotes: number;
	draft_quotes: number;
	pending_quotes: number;
	sent_quotes: number;
	approved_quotes: number;
	rejected_quotes: number;
	expired_quotes: number;
	total_value: number;
	approved_value: number;
	pending_value: number;
}
