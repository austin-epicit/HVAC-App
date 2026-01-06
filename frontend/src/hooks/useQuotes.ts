import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getAllQuotes,
	getQuoteById,
	getQuotesByClientId,
	getQuotesByRequestId,
	createQuote,
	updateQuote,
	deleteQuote,
	sendQuote,
	approveQuote,
	rejectQuote,
	recordQuoteView,
	reviseQuote,
	addLineItem,
	updateLineItem,
	deleteLineItem,
	getQuoteNotes,
	createQuoteNote,
	updateQuoteNote,
	deleteQuoteNote,
	getQuoteStatistics,
} from "../api/quotes";
import type {
	Quote,
	CreateQuoteInput,
	UpdateQuoteInput,
	CreateQuoteLineItemInput,
	UpdateQuoteLineItemInput,
	CreateQuoteNoteInput,
	UpdateQuoteNoteInput,
} from "../types/quotes";

// ============================================================================
// Query Keys
// ============================================================================

export const quoteKeys = {
	all: ["quotes"] as const,
	lists: () => [...quoteKeys.all, "list"] as const,
	list: (filters?: Record<string, unknown>) => [...quoteKeys.lists(), filters] as const,
	details: () => [...quoteKeys.all, "detail"] as const,
	detail: (id: string) => [...quoteKeys.details(), id] as const,
	byClient: (clientId: string) => [...quoteKeys.all, "client", clientId] as const,
	byRequest: (requestId: string) => [...quoteKeys.all, "request", requestId] as const,
	notes: (quoteId: string) => [...quoteKeys.all, "notes", quoteId] as const,
	statistics: (clientId?: string) => [...quoteKeys.all, "statistics", clientId] as const,
};

// ============================================================================
// Queries
// ============================================================================

export const useQuotesQuery = () => {
	return useQuery({
		queryKey: quoteKeys.lists(),
		queryFn: getAllQuotes,
	});
};

export const useQuoteByIdQuery = (id: string) => {
	return useQuery({
		queryKey: quoteKeys.detail(id),
		queryFn: () => getQuoteById(id),
		enabled: !!id,
	});
};

export const useQuotesByClientIdQuery = (clientId: string) => {
	return useQuery({
		queryKey: quoteKeys.byClient(clientId),
		queryFn: () => getQuotesByClientId(clientId),
		enabled: !!clientId,
	});
};

export const useQuotesByRequestIdQuery = (requestId: string) => {
	return useQuery({
		queryKey: quoteKeys.byRequest(requestId),
		queryFn: () => getQuotesByRequestId(requestId),
		enabled: !!requestId,
	});
};

export const useQuoteNotesQuery = (quoteId: string) => {
	return useQuery({
		queryKey: quoteKeys.notes(quoteId),
		queryFn: () => getQuoteNotes(quoteId),
		enabled: !!quoteId,
	});
};

export const useQuoteStatisticsQuery = (clientId?: string) => {
	return useQuery({
		queryKey: quoteKeys.statistics(clientId),
		queryFn: () => getQuoteStatistics(clientId),
	});
};

// ============================================================================
// Mutations - Quote CRUD
// ============================================================================

export const useCreateQuoteMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateQuoteInput) => createQuote(input),
		onSuccess: (newQuote) => {
			// Invalidate quote lists
			queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });

			// Invalidate client-specific quotes if applicable
			if (newQuote.client_id) {
				queryClient.invalidateQueries({
					queryKey: quoteKeys.byClient(newQuote.client_id),
				});

				//  Invalidate client queries
				queryClient.invalidateQueries({
					queryKey: ["clients", newQuote.client_id],
				});
				queryClient.invalidateQueries({
					queryKey: ["clients"],
				});
			}

			// Invalidate request-specific quotes if applicable
			if (newQuote.request_id) {
				queryClient.invalidateQueries({
					queryKey: quoteKeys.byRequest(newQuote.request_id),
				});

				// Invalidate the specific request
				queryClient.invalidateQueries({
					queryKey: ["requests", newQuote.request_id],
				});

				// Invalidate request list
				queryClient.invalidateQueries({
					queryKey: ["requests"],
				});
			}

			// Invalidate statistics
			queryClient.invalidateQueries({ queryKey: quoteKeys.statistics() });
		},
	});
};

export const useUpdateQuoteMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateQuoteInput }) =>
			updateQuote(id, data),
		onSuccess: (updatedQuote) => {
			// Invalidate the specific quote
			queryClient.invalidateQueries({
				queryKey: quoteKeys.detail(updatedQuote.id),
			});

			// Invalidate lists
			queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });

			// Invalidate client-specific quotes
			if (updatedQuote.client_id) {
				queryClient.invalidateQueries({
					queryKey: quoteKeys.byClient(updatedQuote.client_id),
				});
			}

			// Invalidate request-specific quotes if applicable
			if (updatedQuote.request_id) {
				queryClient.invalidateQueries({
					queryKey: quoteKeys.byRequest(updatedQuote.request_id),
				});
			}

			// Invalidate statistics
			queryClient.invalidateQueries({ queryKey: quoteKeys.statistics() });
		},
	});
};

export const useDeleteQuoteMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, hardDelete }: { id: string; hardDelete?: boolean }) =>
			deleteQuote(id, hardDelete),
		onSuccess: () => {
			// Invalidate all quote-related queries
			queryClient.invalidateQueries({ queryKey: quoteKeys.all });
		},
	});
};

// ============================================================================
// Mutations - Quote Actions
// ============================================================================

export const useSendQuoteMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => sendQuote(id),
		onSuccess: (updatedQuote) => {
			queryClient.invalidateQueries({
				queryKey: quoteKeys.detail(updatedQuote.id),
			});
			queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
			queryClient.invalidateQueries({ queryKey: quoteKeys.statistics() });
		},
	});
};

export const useApproveQuoteMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => approveQuote(id),
		onSuccess: (updatedQuote) => {
			queryClient.invalidateQueries({
				queryKey: quoteKeys.detail(updatedQuote.id),
			});
			queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
			queryClient.invalidateQueries({ queryKey: quoteKeys.statistics() });
		},
	});
};

export const useRejectQuoteMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason?: string }) =>
			rejectQuote(id, rejectionReason),
		onSuccess: (updatedQuote) => {
			queryClient.invalidateQueries({
				queryKey: quoteKeys.detail(updatedQuote.id),
			});
			queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
			queryClient.invalidateQueries({ queryKey: quoteKeys.statistics() });
		},
	});
};

export const useRecordQuoteViewMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => recordQuoteView(id),
		onSuccess: (updatedQuote) => {
			queryClient.invalidateQueries({
				queryKey: quoteKeys.detail(updatedQuote.id),
			});
		},
	});
};

export const useReviseQuoteMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => reviseQuote(id),
		onSuccess: (newQuote) => {
			// Invalidate lists
			queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });

			// Invalidate client quotes
			if (newQuote.client_id) {
				queryClient.invalidateQueries({
					queryKey: quoteKeys.byClient(newQuote.client_id),
				});
			}

			// Invalidate request quotes if applicable
			if (newQuote.request_id) {
				queryClient.invalidateQueries({
					queryKey: quoteKeys.byRequest(newQuote.request_id),
				});
			}

			// Invalidate the old quote (since it gets deactivated)
			if (newQuote.previous_quote_id) {
				queryClient.invalidateQueries({
					queryKey: quoteKeys.detail(newQuote.previous_quote_id),
				});
			}
		},
	});
};

// ============================================================================
// Mutations - Line Items
// ============================================================================

export const useAddLineItemMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			quoteId,
			data,
		}: {
			quoteId: string;
			data: CreateQuoteLineItemInput;
		}) => addLineItem(quoteId, data),
		onSuccess: (_, variables) => {
			// Invalidate the quote to refresh line items
			queryClient.invalidateQueries({
				queryKey: quoteKeys.detail(variables.quoteId),
			});
		},
	});
};

export const useUpdateLineItemMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			quoteId,
			lineItemId,
			data,
		}: {
			quoteId: string;
			lineItemId: string;
			data: UpdateQuoteLineItemInput;
		}) => updateLineItem(quoteId, lineItemId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: quoteKeys.detail(variables.quoteId),
			});
		},
	});
};

export const useDeleteLineItemMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ quoteId, lineItemId }: { quoteId: string; lineItemId: string }) =>
			deleteLineItem(quoteId, lineItemId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: quoteKeys.detail(variables.quoteId),
			});
		},
	});
};

// ============================================================================
// Mutations - Notes
// ============================================================================

export const useCreateQuoteNoteMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ quoteId, data }: { quoteId: string; data: CreateQuoteNoteInput }) =>
			createQuoteNote(quoteId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: quoteKeys.notes(variables.quoteId),
			});
			queryClient.invalidateQueries({
				queryKey: quoteKeys.detail(variables.quoteId),
			});
		},
	});
};

export const useUpdateQuoteNoteMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			quoteId,
			noteId,
			data,
		}: {
			quoteId: string;
			noteId: string;
			data: UpdateQuoteNoteInput;
		}) => updateQuoteNote(quoteId, noteId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: quoteKeys.notes(variables.quoteId),
			});
		},
	});
};

export const useDeleteQuoteNoteMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ quoteId, noteId }: { quoteId: string; noteId: string }) =>
			deleteQuoteNote(quoteId, noteId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: quoteKeys.notes(variables.quoteId),
			});
		},
	});
};
