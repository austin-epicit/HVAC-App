import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationResult,
	type UseQueryResult,
} from "@tanstack/react-query";
import type {
	CreateJobInput,
	Job,
	JobNote,
	CreateJobNoteInput,
	UpdateJobNoteInput,
	JobVisit,
	CreateJobVisitInput,
	UpdateJobVisitInput,
} from "../types/jobs";
import * as jobApi from "../api/jobs";

// ============================================
// JOB QUERIES
// ============================================

export const useAllJobsQuery = (): UseQueryResult<Job[], Error> => {
	return useQuery({
		queryKey: ["allJobs"],
		queryFn: jobApi.getAllJobs,
	});
};

export const useJobByIdQuery = (id: string): UseQueryResult<Job, Error> => {
	return useQuery({
		queryKey: ["jobById", id],
		queryFn: () => jobApi.getJobById(id),
		enabled: !!id,
	});
};

// ============================================
// JOB MUTATIONS
// ============================================

export const useCreateJobMutation = (): UseMutationResult<Job, Error, CreateJobInput> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: jobApi.createJob,
		onSuccess: async (newJob: Job) => {
			// Invalidate job lists
			await queryClient.invalidateQueries({ queryKey: ["allJobs"] });

			// Invalidate client queries
			await queryClient.invalidateQueries({
				queryKey: ["clients", newJob.client_id],
			});
			await queryClient.invalidateQueries({ queryKey: ["clients"] });

			// Invalidate request if job is linked to a request
			if (newJob.request_id) {
				await queryClient.invalidateQueries({
					queryKey: ["requests", newJob.request_id],
				});
				await queryClient.invalidateQueries({
					queryKey: ["requests"],
				});
				await queryClient.invalidateQueries({
					queryKey: ["allRequests"],
				});
			}

			// Invalidate quote if job is linked to a quote
			if (newJob.quote_id) {
				await queryClient.invalidateQueries({
					queryKey: ["quotes", newJob.quote_id],
				});
				await queryClient.invalidateQueries({
					queryKey: ["quotes"],
				});
				await queryClient.invalidateQueries({
					queryKey: ["allQuotes"],
				});
			}

			queryClient.setQueryData(["jobById", newJob.id], newJob);
		},
	});
};

export const useUpdateJobMutation = (): UseMutationResult<
	Job,
	Error,
	{ id: string; updates: Partial<Job> }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, updates }) => jobApi.updateJob(id, updates),
		onSuccess: async (updatedJob) => {
			await queryClient.invalidateQueries({ queryKey: ["allJobs"] });
			await queryClient.invalidateQueries({
				queryKey: ["clients", updatedJob.client_id],
			});
			await queryClient.invalidateQueries({ queryKey: ["clients"] });

			queryClient.setQueryData(["jobById", updatedJob.id], updatedJob);
		},
	});
};

export const useDeleteJobMutation = (): UseMutationResult<
	{ message: string; id: string },
	Error,
	string
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: jobApi.deleteJob,
		onSuccess: async (data, jobId) => {
			await queryClient.invalidateQueries({ queryKey: ["allJobs"] });
			await queryClient.invalidateQueries({ queryKey: ["jobs"] });
			await queryClient.invalidateQueries({ queryKey: ["clients"] });
			await queryClient.invalidateQueries({ queryKey: ["jobVisits"] });
			await queryClient.invalidateQueries({ queryKey: ["technicians"] });

			queryClient.removeQueries({ queryKey: ["jobById", jobId] });
		},
	});
};

// ============================================
// JOB VISIT QUERIES
// ============================================

export const useAllJobVisitsQuery = (): UseQueryResult<JobVisit[], Error> => {
	return useQuery({
		queryKey: ["jobVisits"],
		queryFn: jobApi.getAllJobVisits,
	});
};

export const useJobVisitByIdQuery = (id: string): UseQueryResult<JobVisit, Error> => {
	return useQuery({
		queryKey: ["jobVisits", id],
		queryFn: () => jobApi.getJobVisitById(id),
		enabled: !!id,
	});
};

export const useJobVisitsByJobIdQuery = (jobId: string): UseQueryResult<JobVisit[], Error> => {
	return useQuery({
		queryKey: ["jobs", jobId, "visits"],
		queryFn: () => jobApi.getJobVisitsByJobId(jobId),
		enabled: !!jobId,
	});
};

export const useJobVisitsByTechIdQuery = (techId: string): UseQueryResult<JobVisit[], Error> => {
	return useQuery({
		queryKey: ["technicians", techId, "visits"],
		queryFn: () => jobApi.getJobVisitsByTechId(techId),
		enabled: !!techId,
	});
};

export const useJobVisitsByDateRangeQuery = (
	startDate: Date,
	endDate: Date,
	options?: { enabled?: boolean }
): UseQueryResult<JobVisit[], Error> => {
	return useQuery({
		queryKey: [
			"jobVisits",
			"dateRange",
			startDate.toISOString(),
			endDate.toISOString(),
		],
		queryFn: () => jobApi.getJobVisitsByDateRange(startDate, endDate),
		enabled: options?.enabled !== undefined ? options.enabled : true,
	});
};

// ============================================
// JOB VISIT MUTATIONS
// ============================================

export const useCreateJobVisitMutation = (): UseMutationResult<
	JobVisit,
	Error,
	CreateJobVisitInput
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: jobApi.createJobVisit,
		onSuccess: async (newVisit) => {
			// Invalidate job visits queries
			await queryClient.invalidateQueries({ queryKey: ["jobVisits"] });
			await queryClient.invalidateQueries({
				queryKey: ["jobs", newVisit.job_id, "visits"],
			});
			// Invalidate the parent job
			await queryClient.invalidateQueries({
				queryKey: ["jobById", newVisit.job_id],
			});
			await queryClient.invalidateQueries({ queryKey: ["allJobs"] });
			// Invalidate technician visits if techs are assigned
			if (newVisit.visit_techs && newVisit.visit_techs.length > 0) {
				for (const vt of newVisit.visit_techs) {
					await queryClient.invalidateQueries({
						queryKey: ["technicians", vt.tech_id, "visits"],
					});
				}
			}

			queryClient.setQueryData(["jobVisits", newVisit.id], newVisit);
		},
	});
};

export const useUpdateJobVisitMutation = (): UseMutationResult<
	JobVisit,
	Error,
	{ id: string; data: UpdateJobVisitInput }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }) => jobApi.updateJobVisit(id, data),
		onSuccess: async (updatedVisit) => {
			// Invalidate job visits queries
			await queryClient.invalidateQueries({ queryKey: ["jobVisits"] });
			await queryClient.invalidateQueries({
				queryKey: ["jobs", updatedVisit.job_id, "visits"],
			});
			// Invalidate the parent job
			await queryClient.invalidateQueries({
				queryKey: ["jobById", updatedVisit.job_id],
			});
			await queryClient.invalidateQueries({ queryKey: ["allJobs"] });
			// Invalidate technician visits
			if (updatedVisit.visit_techs && updatedVisit.visit_techs.length > 0) {
				for (const vt of updatedVisit.visit_techs) {
					await queryClient.invalidateQueries({
						queryKey: ["technicians", vt.tech_id, "visits"],
					});
				}
			}

			queryClient.setQueryData(["jobVisits", updatedVisit.id], updatedVisit);
		},
	});
};

export const useAssignTechniciansToVisitMutation = (): UseMutationResult<
	JobVisit,
	Error,
	{ visitId: string; techIds: string[] }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ visitId, techIds }) =>
			jobApi.assignTechniciansToVisit(visitId, techIds),
		onSuccess: async (updatedVisit) => {
			// Invalidate job visits queries
			await queryClient.invalidateQueries({ queryKey: ["jobVisits"] });
			await queryClient.invalidateQueries({
				queryKey: ["jobs", updatedVisit.job_id, "visits"],
			});
			// Invalidate the parent job
			await queryClient.invalidateQueries({
				queryKey: ["jobById", updatedVisit.job_id],
			});
			// Invalidate all technician visits (old and new assignments)
			await queryClient.invalidateQueries({ queryKey: ["technicians"] });

			queryClient.setQueryData(["jobVisits", updatedVisit.id], updatedVisit);
		},
	});
};

export const useDeleteJobVisitMutation = (): UseMutationResult<
	{ message: string },
	Error,
	string
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: jobApi.deleteJobVisit,
		onSuccess: async (_, visitId) => {
			// Invalidate all job visits queries
			await queryClient.invalidateQueries({ queryKey: ["jobVisits"] });
			await queryClient.invalidateQueries({ queryKey: ["jobs"] });
			await queryClient.invalidateQueries({ queryKey: ["allJobs"] });
			// Invalidate technician visits
			await queryClient.invalidateQueries({ queryKey: ["technicians"] });
			// Remove the deleted visit from cache
			queryClient.removeQueries({ queryKey: ["jobVisits", visitId] });
		},
	});
};

// ============================================
// JOB NOTE QUERIES
// ============================================

export const useJobNotesQuery = (jobId: string): UseQueryResult<JobNote[], Error> => {
	return useQuery({
		queryKey: ["jobs", jobId, "notes"],
		queryFn: () => jobApi.getJobNotes(jobId),
		enabled: !!jobId,
	});
};

// ============================================
// JOB NOTE MUTATIONS
// ============================================

export const useCreateJobNoteMutation = (): UseMutationResult<
	JobNote,
	Error,
	{ jobId: string; data: CreateJobNoteInput }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ jobId, data }: { jobId: string; data: CreateJobNoteInput }) =>
			jobApi.createJobNote(jobId, data),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: ["jobs", variables.jobId],
			});
			await queryClient.invalidateQueries({
				queryKey: ["jobs", variables.jobId, "notes"],
			});
			await queryClient.invalidateQueries({
				queryKey: ["jobById", variables.jobId],
			});
			// If note is attached to a visit, invalidate that visit too
			if (variables.data.visit_id) {
				await queryClient.invalidateQueries({
					queryKey: ["jobVisits", variables.data.visit_id],
				});
			}
		},
	});
};

export const useUpdateJobNoteMutation = (): UseMutationResult<
	JobNote,
	Error,
	{ jobId: string; noteId: string; data: UpdateJobNoteInput }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			jobId,
			noteId,
			data,
		}: {
			jobId: string;
			noteId: string;
			data: UpdateJobNoteInput;
		}) => jobApi.updateJobNote(jobId, noteId, data),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: ["jobs", variables.jobId],
			});
			await queryClient.invalidateQueries({
				queryKey: ["jobs", variables.jobId, "notes"],
			});
			await queryClient.invalidateQueries({
				queryKey: ["jobById", variables.jobId],
			});
			// If note is attached to a visit (or was moved to/from a visit), invalidate visits
			if (variables.data.visit_id) {
				await queryClient.invalidateQueries({
					queryKey: ["jobVisits", variables.data.visit_id],
				});
			}
			await queryClient.invalidateQueries({ queryKey: ["jobVisits"] });
		},
	});
};

export const useDeleteJobNoteMutation = (): UseMutationResult<
	{ message: string },
	Error,
	{ jobId: string; noteId: string }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ jobId, noteId }: { jobId: string; noteId: string }) =>
			jobApi.deleteJobNote(jobId, noteId),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: ["jobs", variables.jobId],
			});
			await queryClient.invalidateQueries({
				queryKey: ["jobs", variables.jobId, "notes"],
			});
			await queryClient.invalidateQueries({
				queryKey: ["jobById", variables.jobId],
			});
			// Invalidate job visits in case the note was attached to a visit
			await queryClient.invalidateQueries({ queryKey: ["jobVisits"] });
		},
	});
};
