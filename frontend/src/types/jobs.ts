import z from "zod";
import type { ClientSummary, ClientWithPrimaryContact } from "./clients";
import type { Coordinates } from "./location";
import type {
	Priority,
	BaseNote,
	RequestReference,
	QuoteReference,
	LineItemType,
	LineItemSource,
	PricingBreakdown,
	ExecutionTotals,
	DiscountType,
} from "./common";
import {
	PriorityValues,
	PriorityLabels,
	PriorityColors,
	LineItemTypeValues,
	LineItemSourceValues,
	DiscountTypeValues,
} from "./common";

// ============================================================================
// JOB-SPECIFIC TYPES
// ============================================================================

export const JobStatusValues = [
	"Unscheduled",
	"Scheduled",
	"InProgress",
	"Completed",
	"Cancelled",
] as const;

export type JobStatus = (typeof JobStatusValues)[number];

export type JobPriority = Priority;
export const JobPriorityValues = PriorityValues;
export const JobPriorityLabels = PriorityLabels;
export const JobPriorityColors = PriorityColors;

export const JobStatusLabels: Record<JobStatus, string> = {
	Unscheduled: "Unscheduled",
	Scheduled: "Scheduled",
	InProgress: "In Progress",
	Completed: "Completed",
	Cancelled: "Cancelled",
};

export const JobStatusColors: Record<JobStatus, string> = {
	Unscheduled: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
	Scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
	InProgress: "bg-amber-500/20 text-amber-400 border-amber-500/30",
	Completed: "bg-green-500/20 text-green-400 border-green-500/30",
	Cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export const VisitStatusValues = [
	"Scheduled",
	"Driving",
	"OnSite",
	"InProgress",
	"Delayed",
	"Completed",
	"Cancelled",
] as const;

export type VisitStatus = (typeof VisitStatusValues)[number];

export const VisitStatusLabels: Record<VisitStatus, string> = {
	Scheduled: "Scheduled",
	Driving: "Driving",
	OnSite: "On Site",
	InProgress: "In Progress",
	Delayed: "Delayed",
	Completed: "Completed",
	Cancelled: "Cancelled",
};

export const VisitStatusColors: Record<VisitStatus, string> = {
	Scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
	Driving: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
	OnSite: "bg-purple-500/20 text-purple-400 border-purple-500/30",
	InProgress: "bg-amber-500/20 text-amber-400 border-amber-500/30",
	Delayed: "bg-orange-500/20 text-orange-400 border-orange-500/30",
	Completed: "bg-green-500/20 text-green-400 border-green-500/30",
	Cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export const ScheduleTypeValues = ["all_day", "exact", "window"] as const;
export type ScheduleType = (typeof ScheduleTypeValues)[number];

export const ScheduleTypeLabels: Record<ScheduleType, string> = {
	all_day: "All Day",
	exact: "Exact Time",
	window: "Arrival Window",
};

export const ScheduleTypeColors: Record<ScheduleType, string> = {
	all_day: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
	exact: "bg-blue-500/20 text-blue-400 border-blue-500/30",
	window: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

// ============================================================================
// JOB TYPES
// ============================================================================

export interface JobVisitTechnician {
	visit_id: string;
	tech_id: string;
	tech: {
		id: string;
		name: string;
		email: string;
		phone: string;
		title: string;
		status: string;
	};
}

export interface JobSummary {
	id: string;
	name: string;
	job_number: string;
	client_id: string;
	address: string;
	description: string;
	priority: JobPriority;
	status: JobStatus;
}

export interface VisitReference {
	id: string;
	scheduled_start_at: Date | string;
	scheduled_end_at: Date | string;
	status: VisitStatus;
}

export interface Job extends PricingBreakdown, ExecutionTotals {
	id: string;
	name: string;
	job_number: string;
	client_id: string;
	address: string;
	coords: Coordinates;
	description: string;
	priority: JobPriority;
	status: JobStatus;

	created_at: Date | string;
	updated_at?: Date | string;
	completed_at?: Date | string | null;
	cancelled_at?: Date | string | null;
	cancellation_reason?: string | null;

	request_id: string | null;
	quote_id: string | null;

	client?: ClientWithPrimaryContact;
	request?: RequestReference | null;
	quote?: QuoteReference | null;
	visits?: JobVisit[];
	notes?: JobNote[];
	line_items?: JobLineItem[];
}

export interface CreateJobInput extends PricingBreakdown, ExecutionTotals {
	name: string;
	client_id: string;
	address: string;
	coords: Coordinates;
	description: string;
	priority?: JobPriority;
	status?: JobStatus;
	request_id?: string;
	quote_id?: string;
	line_items?: CreateJobLineItemInput[];
}

export interface UpdateJobInput extends PricingBreakdown, ExecutionTotals {
	name?: string;
	address?: string;
	coords?: Coordinates;
	description?: string;
	priority?: JobPriority;
	status?: JobStatus;

	cancellation_reason?: string; //unused
	line_items?: UpdateJobLineItemInput[];
}
//Job Line Items
export interface JobLineItem {
	id?: string;
	name: string;
	description?: string | null;
	quantity: number;
	unit_price: number;
	total: number;
	item_type?: LineItemType | null;
	source?: LineItemSource;
	isNew?: boolean; // Frontend only - marks items created in form
	isDeleted?: boolean; // Frontend only - soft delete marker
}

export interface CreateJobLineItemInput {
	name: string;
	description?: string;
	quantity: number;
	unit_price: number;
	total?: number;

	item_type?: LineItemType | null;
	source?: LineItemSource;
}
export interface UpdateJobLineItemInput {
	id?: string;
	name: string;
	description?: string | null;
	quantity: number;
	unit_price: number;
	total: number;

	item_type?: LineItemType | null;
	source?: LineItemSource;
}

//Job Visit
export interface JobVisit {
	id: string;
	job_id: string;
	schedule_type: ScheduleType;
	scheduled_start_at: Date | string;
	scheduled_end_at: Date | string;
	arrival_window_start?: Date | string | null;
	arrival_window_end?: Date | string | null;
	actual_start_at?: Date | string | null;
	actual_end_at?: Date | string | null;
	status: VisitStatus;

	job?: JobSummary & { client: ClientSummary; coords: Coordinates };
	visit_techs: JobVisitTechnician[];
	notes?: JobNote[];
}

export interface CreateJobVisitInput {
	job_id: string;
	schedule_type: ScheduleType;
	scheduled_start_at: Date | string;
	scheduled_end_at: Date | string;
	arrival_window_start?: Date | string | null;
	arrival_window_end?: Date | string | null;
	status?: VisitStatus;
	tech_ids?: string[];
}

export interface UpdateJobVisitInput {
	schedule_type?: ScheduleType;
	scheduled_start_at?: Date | string;
	scheduled_end_at?: Date | string;
	arrival_window_start?: Date | string | null;
	arrival_window_end?: Date | string | null;
	actual_start_at?: Date | string | null;
	actual_end_at?: Date | string | null;
	status?: VisitStatus;
}
//Notes

export interface JobNote extends BaseNote {
	job_id: string;
	visit_id?: string | null;
	visit?: VisitReference | null;
}

export interface CreateJobNoteInput {
	content: string;
	visit_id?: string | null;
}

export interface UpdateJobNoteInput {
	content: string;
	visit_id?: string | null;
}

export interface JobResponse {
	err: string;
	data: Job[];
}

export interface JobVisitResponse {
	err: string;
	data: JobVisit[];
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const CreateJobSchema = z.object({
	name: z.string().min(1, "Job name is required"),
	client_id: z.string().min(1, "Please select a client"),
	address: z.string().default(""),
	description: z.string().default(""),
	priority: z.enum(PriorityValues).default("Medium"),
	status: z.enum(JobStatusValues).default("Unscheduled"),
	request_id: z.string().uuid().optional().nullable(),
	quote_id: z.string().uuid().optional().nullable(),

	estimated_total: z.number().nonnegative().optional().nullable(),
	line_items: z
		.array(
			z.object({
				name: z.string().min(1, "Item name is required"),
				description: z.string().optional(),
				quantity: z.number().positive("Quantity must be positive"),
				unit_price: z
					.number()
					.nonnegative("Unit price must be non-negative"),
			})
		)
		.optional(),

	subtotal: z.number().nonnegative().optional(),
	tax_rate: z.number().min(0).max(1).optional(),
	tax_amount: z.number().nonnegative().optional(),
	discount_type: z.enum(DiscountTypeValues).optional(),
	discount_value: z.number().nonnegative().optional(),
	discount_amount: z.number().nonnegative().optional(),
});

export const UpdateJobSchema = z.object({
	name: z.string().min(1).optional(),
	address: z.string().optional(),
	description: z.string().optional(),
	priority: z.enum(PriorityValues).optional(),
	status: z.enum(JobStatusValues).optional(),
	estimated_total: z.number().nonnegative().optional().nullable(),
	actual_total: z.number().nonnegative().optional().nullable(),
	line_items: z
		.array(
			z.object({
				id: z.string().uuid().optional(), // undefined = create new
				name: z.string().min(1, "Item name is required"),
				description: z.string().optional(),
				quantity: z.number().positive("Quantity must be positive"),
				unit_price: z
					.number()
					.nonnegative("Unit price must be non-negative"),
				total: z.number().nonnegative("Total must be non-negative"),
				item_type: z.enum(LineItemTypeValues).optional(),
				source: z.enum(LineItemSourceValues).optional(),
			})
		)
		.optional(),
});

export const CreateJobVisitSchema = z
	.object({
		job_id: z.string().uuid("Invalid job ID"),
		schedule_type: z.enum(ScheduleTypeValues).default("exact"),
		scheduled_start_at: z.coerce.date({ message: "Start time is required" }),
		scheduled_end_at: z.coerce.date({ message: "End time is required" }),
		arrival_window_start: z.coerce.date().optional().nullable(),
		arrival_window_end: z.coerce.date().optional().nullable(),
		status: z.enum(VisitStatusValues).default("Scheduled"),
		tech_ids: z.array(z.string().uuid()).optional(),
	})
	.refine(
		(data) => {
			return data.scheduled_end_at > data.scheduled_start_at;
		},
		{
			message: "End time must be after start time",
			path: ["scheduled_end_at"],
		}
	)
	.refine(
		(data) => {
			if (data.schedule_type === "window") {
				return data.arrival_window_start && data.arrival_window_end;
			}
			return true;
		},
		{
			message: "Arrival window times are required for window schedule type",
			path: ["arrival_window_start"],
		}
	)
	.refine(
		(data) => {
			if (data.arrival_window_start && data.arrival_window_end) {
				return data.arrival_window_end > data.arrival_window_start;
			}
			return true;
		},
		{
			message: "Arrival window end must be after start",
			path: ["arrival_window_end"],
		}
	);

export const UpdateJobVisitSchema = z
	.object({
		schedule_type: z.enum(ScheduleTypeValues).optional(),
		scheduled_start_at: z.coerce.date().optional(),
		scheduled_end_at: z.coerce.date().optional(),
		arrival_window_start: z.coerce.date().optional().nullable(),
		arrival_window_end: z.coerce.date().optional().nullable(),
		actual_start_at: z.coerce.date().optional().nullable(),
		actual_end_at: z.coerce.date().optional().nullable(),
		status: z.enum(VisitStatusValues).optional(),
	})
	.refine(
		(data) => {
			if (data.scheduled_start_at && data.scheduled_end_at) {
				return data.scheduled_end_at > data.scheduled_start_at;
			}
			return true;
		},
		{
			message: "End time must be after start time",
			path: ["scheduled_end_at"],
		}
	)
	.refine(
		(data) => {
			if (data.actual_start_at && data.actual_end_at) {
				return data.actual_end_at > data.actual_start_at;
			}
			return true;
		},
		{
			message: "Actual end time must be after actual start time",
			path: ["actual_end_at"],
		}
	)
	.refine(
		(data) => {
			if (data.arrival_window_start && data.arrival_window_end) {
				return data.arrival_window_end > data.arrival_window_start;
			}
			return true;
		},
		{
			message: "Arrival window end must be after start",
			path: ["arrival_window_end"],
		}
	);

export const CreateJobNoteSchema = z.object({
	content: z.string().min(1, "Note content is required"),
	visit_id: z.string().uuid().optional().nullable(),
});

export const UpdateJobNoteSchema = z.object({
	content: z.string().min(1, "Note content is required"),
	visit_id: z.string().uuid().optional().nullable(),
});
