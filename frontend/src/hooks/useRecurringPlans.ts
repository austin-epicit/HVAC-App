import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationResult,
	type UseQueryResult,
} from "@tanstack/react-query";
import type {
	RecurringPlan,
	CreateRecurringPlanInput,
	UpdateRecurringPlanInput,
	UpdateRecurringPlanLineItemsInput,
	RecurringOccurrence,
	GenerateOccurrencesInput,
	OccurrenceGenerationResult,
	SkipOccurrenceInput,
	RescheduleOccurrenceInput,
	BulkSkipOccurrencesInput,
	VisitGenerationResult,
	RecurringPlanNote,
	CreateRecurringPlanNoteInput,
	UpdateRecurringPlanNoteInput,
} from "../types/recurringPlans";
import * as recurringPlanApi from "../api/recurringPlans";

// ============================================
// RECURRING PLAN QUERIES
// ============================================

export const useAllRecurringPlansQuery = (): UseQueryResult<RecurringPlan[], Error> => {
	return useQuery({
		queryKey: ["recurringPlans"],
		queryFn: recurringPlanApi.getAllRecurringPlans,
	});
};

export const useRecurringPlanByIdQuery = (planId: string): UseQueryResult<RecurringPlan, Error> => {
	return useQuery({
		queryKey: ["recurringPlans", planId],
		queryFn: () => recurringPlanApi.getRecurringPlanById(planId),
		enabled: !!planId,
	});
};

export const useRecurringPlanByJobIdQuery = (
	jobId: string
): UseQueryResult<RecurringPlan, Error> => {
	return useQuery({
		queryKey: ["jobs", jobId, "recurringPlan"],
		queryFn: () => recurringPlanApi.getRecurringPlanByJobId(jobId),
		enabled: !!jobId,
	});
};

// ============================================
// RECURRING PLAN MUTATIONS
// ============================================

export const useCreateRecurringPlanMutation = (): UseMutationResult<
	RecurringPlan,
	Error,
	CreateRecurringPlanInput
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: recurringPlanApi.createRecurringPlan,
		onSuccess: async (newPlan: RecurringPlan) => {
			// Invalidate recurring plans
			await queryClient.invalidateQueries({ queryKey: ["recurringPlans"] });

			// Invalidate clients
			await queryClient.invalidateQueries({
				queryKey: ["clients", newPlan.client_id],
			});
			await queryClient.invalidateQueries({ queryKey: ["clients"] });

			// Invalidate jobs
			await queryClient.invalidateQueries({ queryKey: ["jobs"] });

			if (newPlan.job_container?.id) {
				queryClient.setQueryData(
					["jobs", newPlan.job_container.id, "recurringPlan"],
					newPlan
				);
			}

			// Set the plan by its own ID in cache
			queryClient.setQueryData(["recurringPlans", newPlan.id], newPlan);
		},
	});
};

export const useUpdateRecurringPlanMutation = (): UseMutationResult<
	RecurringPlan,
	Error,
	{ jobId: string; updates: UpdateRecurringPlanInput }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ jobId, updates }) =>
			recurringPlanApi.updateRecurringPlan(jobId, updates),
		onSuccess: async (updatedPlan, variables) => {
			// Invalidate recurring plans
			await queryClient.invalidateQueries({ queryKey: ["recurringPlans"] });

			// Invalidate clients
			await queryClient.invalidateQueries({
				queryKey: ["clients", updatedPlan.client_id],
			});
			await queryClient.invalidateQueries({ queryKey: ["clients"] });

			// Invalidate jobs
			await queryClient.invalidateQueries({ queryKey: ["jobs"] });

			// If rule or line_items were updated, invalidate occurrences
			// since future occurrences should reflect the new template
			if (variables.updates.rule || variables.updates.line_items) {
				await queryClient.invalidateQueries({
					queryKey: ["jobs", variables.jobId, "occurrences"],
				});
			}

			// Update the specific recurring plan in cache
			queryClient.setQueryData(
				["jobs", variables.jobId, "recurringPlan"],
				updatedPlan
			);

			// Also update by plan ID
			queryClient.setQueryData(["recurringPlans", updatedPlan.id], updatedPlan);
		},
	});
};

export const useUpdateRecurringPlanLineItemsMutation = (): UseMutationResult<
	RecurringPlan,
	Error,
	{ jobId: string; updates: UpdateRecurringPlanLineItemsInput }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ jobId, updates }) =>
			recurringPlanApi.updateRecurringPlanLineItems(jobId, updates),
		onSuccess: async (updatedPlan, variables) => {
			// Invalidate recurring plans
			await queryClient.invalidateQueries({ queryKey: ["recurringPlans"] });

			// Invalidate occurrences since line items changed
			await queryClient.invalidateQueries({
				queryKey: ["jobs", variables.jobId, "occurrences"],
			});

			// Update the specific recurring plan in cache
			queryClient.setQueryData(
				["jobs", variables.jobId, "recurringPlan"],
				updatedPlan
			);

			// Also update by plan ID
			queryClient.setQueryData(["recurringPlans", updatedPlan.id], updatedPlan);
		},
	});
};

// ============================================
// RECURRING PLAN LIFECYCLE MUTATIONS
// ============================================

export const usePauseRecurringPlanMutation = (): UseMutationResult<
	RecurringPlan,
	Error,
	string
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: recurringPlanApi.pauseRecurringPlan,
		onSuccess: async (updatedPlan, jobId) => {
			// Invalidate recurring plans
			await queryClient.invalidateQueries({ queryKey: ["recurringPlans"] });

			// Invalidate jobs
			await queryClient.invalidateQueries({ queryKey: ["jobs"] });

			// Update caches
			queryClient.setQueryData(["jobs", jobId, "recurringPlan"], updatedPlan);
			queryClient.setQueryData(["recurringPlans", updatedPlan.id], updatedPlan);
		},
	});
};

export const useResumeRecurringPlanMutation = (): UseMutationResult<
	RecurringPlan,
	Error,
	string
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: recurringPlanApi.resumeRecurringPlan,
		onSuccess: async (updatedPlan, jobId) => {
			// Invalidate recurring plans
			await queryClient.invalidateQueries({ queryKey: ["recurringPlans"] });

			// Invalidate jobs
			await queryClient.invalidateQueries({ queryKey: ["jobs"] });

			// Update caches
			queryClient.setQueryData(["jobs", jobId, "recurringPlan"], updatedPlan);
			queryClient.setQueryData(["recurringPlans", updatedPlan.id], updatedPlan);
		},
	});
};

export const useCancelRecurringPlanMutation = (): UseMutationResult<
	RecurringPlan,
	Error,
	string
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: recurringPlanApi.cancelRecurringPlan,
		onSuccess: async (updatedPlan, jobId) => {
			// Invalidate recurring plans
			await queryClient.invalidateQueries({ queryKey: ["recurringPlans"] });

			// Invalidate jobs
			await queryClient.invalidateQueries({ queryKey: ["jobs"] });

			// Invalidate occurrences since they're cancelled
			await queryClient.invalidateQueries({
				queryKey: ["jobs", jobId, "occurrences"],
			});

			// Update caches
			queryClient.setQueryData(["jobs", jobId, "recurringPlan"], updatedPlan);
			queryClient.setQueryData(["recurringPlans", updatedPlan.id], updatedPlan);
		},
	});
};

export const useCompleteRecurringPlanMutation = (): UseMutationResult<
	RecurringPlan,
	Error,
	string
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: recurringPlanApi.completeRecurringPlan,
		onSuccess: async (updatedPlan, jobId) => {
			// Invalidate recurring plans
			await queryClient.invalidateQueries({ queryKey: ["recurringPlans"] });

			// Invalidate jobs
			await queryClient.invalidateQueries({ queryKey: ["jobs"] });

			// Update caches
			queryClient.setQueryData(["jobs", jobId, "recurringPlan"], updatedPlan);
			queryClient.setQueryData(["recurringPlans", updatedPlan.id], updatedPlan);
		},
	});
};

// ============================================
// OCCURRENCE QUERIES
// ============================================

export const useOccurrencesByJobIdQuery = (
	jobId: string
): UseQueryResult<RecurringOccurrence[], Error> => {
	return useQuery({
		queryKey: ["jobs", jobId, "occurrences"],
		queryFn: () => recurringPlanApi.getOccurrencesByJobId(jobId),
		enabled: !!jobId,
	});
};

// ============================================
// OCCURRENCE MUTATIONS
// ============================================

export const useGenerateOccurrencesMutation = (): UseMutationResult<
	OccurrenceGenerationResult,
	Error,
	{ jobId: string; input: GenerateOccurrencesInput }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ jobId, input }) =>
			recurringPlanApi.generateOccurrences(jobId, input),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: ["jobs", variables.jobId, "occurrences"],
			});
			await queryClient.invalidateQueries({
				queryKey: ["jobs", variables.jobId, "recurringPlan"],
			});
		},
	});
};

export const useSkipOccurrenceMutation = (): UseMutationResult<
	RecurringOccurrence,
	Error,
	{ occurrenceId: string; input: SkipOccurrenceInput }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ occurrenceId, input }) =>
			recurringPlanApi.skipOccurrence(occurrenceId, input),
		onSuccess: async (updatedOccurrence) => {
			const jobQueries = queryClient.getQueriesData<RecurringOccurrence[]>({
				queryKey: ["jobs"],
			});

			let jobId: string | undefined;
			for (const [key, occurrences] of jobQueries) {
				if (occurrences?.some((occ) => occ.id === updatedOccurrence.id)) {
					jobId = key[1] as string;
					break;
				}
			}

			if (jobId) {
				await queryClient.invalidateQueries({
					queryKey: ["jobs", jobId, "occurrences"],
				});
			} else {
				// Fallback: invalidate all
				await queryClient.invalidateQueries({
					queryKey: ["jobs"],
					predicate: (query) =>
						query.queryKey.includes("occurrences"),
				});
			}
		},
	});
};

export const useRescheduleOccurrenceMutation = (): UseMutationResult<
	RecurringOccurrence,
	Error,
	{ occurrenceId: string; input: RescheduleOccurrenceInput }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ occurrenceId, input }) =>
			recurringPlanApi.rescheduleOccurrence(occurrenceId, input),
		onSuccess: async (updatedOccurrence) => {
			const jobQueries = queryClient.getQueriesData<RecurringOccurrence[]>({
				queryKey: ["jobs"],
			});

			// Find which job this occurrence belongs to
			let jobId: string | undefined;
			for (const [key, occurrences] of jobQueries) {
				if (occurrences?.some((occ) => occ.id === updatedOccurrence.id)) {
					// Extract jobId from query key like ["jobs", "job-id", "occurrences"]
					jobId = key[1] as string;
					break;
				}
			}

			// Invalidate occurrence queries
			if (jobId) {
				await queryClient.invalidateQueries({
					queryKey: ["jobs", jobId, "occurrences"],
				});
			} else {
				// Fallback: invalidate all
				await queryClient.invalidateQueries({
					queryKey: ["jobs"],
					predicate: (query) =>
						query.queryKey.includes("occurrences"),
				});
			}
		},
	});
};

export const useBulkSkipOccurrencesMutation = (): UseMutationResult<
	{ skipped: number },
	Error,
	BulkSkipOccurrencesInput
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: recurringPlanApi.bulkSkipOccurrences,
		onSuccess: async () => {
			// Invalidate all occurrence queries since we don't know which plans were affected
			await queryClient.invalidateQueries({
				queryKey: ["jobs"],
				predicate: (query) => query.queryKey.includes("occurrences"),
			});
			await queryClient.invalidateQueries({ queryKey: ["recurringPlans"] });
		},
	});
};

export const useGenerateVisitFromOccurrenceMutation = (): UseMutationResult<
	VisitGenerationResult,
	Error,
	string
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: recurringPlanApi.generateVisitFromOccurrence,
		onSuccess: async (result) => {
			// Find the job ID from the occurrence
			const occurrenceQueries = queryClient.getQueriesData<RecurringOccurrence[]>(
				{
					queryKey: ["jobs"],
				}
			);

			// Find which job this occurrence belongs to
			let jobId: string | undefined;
			for (const [key, occurrences] of occurrenceQueries) {
				if (occurrences?.some((occ) => occ.id === result.occurrence_id)) {
					// Extract jobId from query key like ["jobs", "job-id", "occurrences"]
					jobId = key[1] as string;
					break;
				}
			}

			// Invalidate occurrence queries for this specific job
			if (jobId) {
				await queryClient.invalidateQueries({
					queryKey: ["jobs", jobId, "occurrences"],
				});
				await queryClient.invalidateQueries({
					queryKey: ["jobs", jobId, "visits"],
				});
			}

			// Invalidate job visits since a new visit was created
			await queryClient.invalidateQueries({ queryKey: ["jobVisits"] });
			await queryClient.invalidateQueries({ queryKey: ["jobs"] });

			// Invalidate the specific visit
			await queryClient.invalidateQueries({
				queryKey: ["jobVisits", result.visit_id],
			});
		},
	});
};

// ============================================
// RECURRING PLAN NOTE QUERIES
// ============================================

export const useRecurringPlanNotesQuery = (
	jobId: string
): UseQueryResult<RecurringPlanNote[], Error> => {
	return useQuery({
		queryKey: ["jobs", jobId, "recurringPlan", "notes"],
		queryFn: () => recurringPlanApi.getRecurringPlanNotes(jobId),
		enabled: !!jobId,
	});
};

// ============================================
// RECURRING PLAN NOTE MUTATIONS
// ============================================

export const useCreateRecurringPlanNoteMutation = (): UseMutationResult<
	RecurringPlanNote,
	Error,
	{ jobId: string; data: CreateRecurringPlanNoteInput }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ jobId, data }) =>
			recurringPlanApi.createRecurringPlanNote(jobId, data),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: ["jobs", variables.jobId, "recurringPlan", "notes"],
			});
		},
	});
};

export const useUpdateRecurringPlanNoteMutation = (): UseMutationResult<
	RecurringPlanNote,
	Error,
	{ jobId: string; noteId: string; data: UpdateRecurringPlanNoteInput }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ jobId, noteId, data }) =>
			recurringPlanApi.updateRecurringPlanNote(jobId, noteId, data),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: ["jobs", variables.jobId, "recurringPlan", "notes"],
			});
		},
	});
};

export const useDeleteRecurringPlanNoteMutation = (): UseMutationResult<
	{ message: string },
	Error,
	{ jobId: string; noteId: string }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ jobId, noteId }) =>
			recurringPlanApi.deleteRecurringPlanNote(jobId, noteId),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: ["jobs", variables.jobId, "recurringPlan", "notes"],
			});
		},
	});
};
