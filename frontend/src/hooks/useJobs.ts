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
import { 
	createJob, 
	getAllJobs, 
	getJobById, 
	updateJob, 
	getJobNotes, 
	createJobNote, 
	updateJobNote, 
	deleteJobNote,
	getAllJobVisits,
	getJobVisitById,
	getJobVisitsByJobId,
	getJobVisitsByTechId,
	getJobVisitsByDateRange,
	createJobVisit,
	updateJobVisit,
	assignTechniciansToVisit,
	deleteJobVisit,
} from "../api/jobs";

// ============================================
// JOB HOOKS
// ============================================

export const useAllJobsQuery = () => {
	return useQuery<Job[], Error>({
		queryKey: ["allJobs"],
		queryFn: getAllJobs,
	});
};

export const useJobByIdQuery = (id: string) => {
	return useQuery<Job, Error>({
		queryKey: ["jobById", id],
		queryFn: () => getJobById(id),
		enabled: !!id,
	});
};

export const useCreateJobMutation = (): UseMutationResult<Job, Error, CreateJobInput> => {
	const queryClient = useQueryClient();

	return useMutation<Job, Error, CreateJobInput>({
		mutationFn: createJob,
		onSuccess: async (newJob: Job) => {
			await queryClient.invalidateQueries({ queryKey: ["allJobs"] });
			await queryClient.invalidateQueries({ queryKey: ["clients", newJob.client_id] });
			await queryClient.invalidateQueries({ queryKey: ["clients"] });

			queryClient.setQueryData(["jobById", newJob.id], newJob);
		},
		onError: (error) => {
			console.error("Failed to create job:", error);
		},
	});
};

export const useUpdateJobMutation = () => {
	const queryClient = useQueryClient();

	return useMutation<Job, Error, { id: string; updates: Partial<Job> }>({
		mutationFn: ({ id, updates }) => updateJob(id, updates),
		onSuccess: async (updatedJob) => {
			await queryClient.invalidateQueries({ queryKey: ["allJobs"] });
			await queryClient.invalidateQueries({ queryKey: ["clients", updatedJob.client_id] });
			await queryClient.invalidateQueries({ queryKey: ["clients"] });
			
			queryClient.setQueryData(["jobById", updatedJob.id], updatedJob);
		},
		onError: (err) => {
			console.error("Failed to update job:", err);
		},
	});
};

// ============================================
// JOB VISIT HOOKS
// ============================================

export const useAllJobVisitsQuery = (): UseQueryResult<JobVisit[], Error> => {
	return useQuery({
		queryKey: ["jobVisits"],
		queryFn: getAllJobVisits,
	});
};

export const useJobVisitByIdQuery = (id: string): UseQueryResult<JobVisit, Error> => {
	return useQuery({
		queryKey: ["jobVisits", id],
		queryFn: () => getJobVisitById(id),
		enabled: !!id,
	});
};

export const useJobVisitsByJobIdQuery = (jobId: string): UseQueryResult<JobVisit[], Error> => {
	return useQuery({
		queryKey: ["jobs", jobId, "visits"],
		queryFn: () => getJobVisitsByJobId(jobId),
		enabled: !!jobId,
	});
};

export const useJobVisitsByTechIdQuery = (techId: string): UseQueryResult<JobVisit[], Error> => {
	return useQuery({
		queryKey: ["technicians", techId, "visits"],
		queryFn: () => getJobVisitsByTechId(techId),
		enabled: !!techId,
	});
};

export const useJobVisitsByDateRangeQuery = (
	startDate: Date,
	endDate: Date,
	options?: { enabled?: boolean }
): UseQueryResult<JobVisit[], Error> => {
	return useQuery({
		queryKey: ["jobVisits", "dateRange", startDate.toISOString(), endDate.toISOString()],
		queryFn: () => getJobVisitsByDateRange(startDate, endDate),
		enabled: options?.enabled !== undefined ? options.enabled : true,
	});
};

export const useCreateJobVisitMutation = (): UseMutationResult<
	JobVisit,
	Error,
	CreateJobVisitInput
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createJobVisit,
		onSuccess: async (newVisit) => {
			// Invalidate job visits queries
			await queryClient.invalidateQueries({ queryKey: ["jobVisits"] });
			await queryClient.invalidateQueries({ queryKey: ["jobs", newVisit.job_id, "visits"] });
			
			// Invalidate the parent job
			await queryClient.invalidateQueries({ queryKey: ["jobById", newVisit.job_id] });
			await queryClient.invalidateQueries({ queryKey: ["allJobs"] });
			
			// Invalidate technician visits if techs are assigned
			if (newVisit.visit_techs && newVisit.visit_techs.length > 0) {
				for (const vt of newVisit.visit_techs) {
					await queryClient.invalidateQueries({ queryKey: ["technicians", vt.tech_id, "visits"] });
				}
			}

			queryClient.setQueryData(["jobVisits", newVisit.id], newVisit);
		},
		onError: (error) => {
			console.error("Failed to create job visit:", error);
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
		mutationFn: ({ id, data }) => updateJobVisit(id, data),
		onSuccess: async (updatedVisit) => {
			// Invalidate job visits queries
			await queryClient.invalidateQueries({ queryKey: ["jobVisits"] });
			await queryClient.invalidateQueries({ queryKey: ["jobs", updatedVisit.job_id, "visits"] });
			
			// Invalidate the parent job
			await queryClient.invalidateQueries({ queryKey: ["jobById", updatedVisit.job_id] });
			await queryClient.invalidateQueries({ queryKey: ["allJobs"] });
			
			// Invalidate technician visits
			if (updatedVisit.visit_techs && updatedVisit.visit_techs.length > 0) {
				for (const vt of updatedVisit.visit_techs) {
					await queryClient.invalidateQueries({ queryKey: ["technicians", vt.tech_id, "visits"] });
				}
			}

			queryClient.setQueryData(["jobVisits", updatedVisit.id], updatedVisit);
		},
		onError: (error) => {
			console.error("Failed to update job visit:", error);
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
		mutationFn: ({ visitId, techIds }) => assignTechniciansToVisit(visitId, techIds),
		onSuccess: async (updatedVisit) => {
			// Invalidate job visits queries
			await queryClient.invalidateQueries({ queryKey: ["jobVisits"] });
			await queryClient.invalidateQueries({ queryKey: ["jobs", updatedVisit.job_id, "visits"] });
			
			// Invalidate the parent job
			await queryClient.invalidateQueries({ queryKey: ["jobById", updatedVisit.job_id] });
			
			// Invalidate all technician visits (old and new assignments)
			await queryClient.invalidateQueries({ queryKey: ["technicians"] });

			queryClient.setQueryData(["jobVisits", updatedVisit.id], updatedVisit);
		},
		onError: (error) => {
			console.error("Failed to assign technicians:", error);
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
		mutationFn: deleteJobVisit,
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
		onError: (error) => {
			console.error("Failed to delete job visit:", error);
		},
	});
};

// ============================================
// JOB NOTES HOOKS
// ============================================

export const useJobNotesQuery = (jobId: string): UseQueryResult<JobNote[], Error> => {
	return useQuery({
		queryKey: ["jobs", jobId, "notes"],
		queryFn: () => getJobNotes(jobId),
		enabled: !!jobId,
	});
};

export const useCreateJobNoteMutation = (): UseMutationResult<
	JobNote,
	Error,
	{ jobId: string; data: CreateJobNoteInput }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ jobId, data }: { jobId: string; data: CreateJobNoteInput }) =>
			createJobNote(jobId, data),
		onSuccess: async (_, variables) => {
			console.log("Job note created, invalidating queries");
			await queryClient.invalidateQueries({ queryKey: ["jobs", variables.jobId] });
			await queryClient.invalidateQueries({ queryKey: ["jobs", variables.jobId, "notes"] });
			await queryClient.invalidateQueries({ queryKey: ["jobById", variables.jobId] });
			
			// If note is attached to a visit, invalidate that visit too
			if (variables.data.visit_id) {
				await queryClient.invalidateQueries({ queryKey: ["jobVisits", variables.data.visit_id] });
			}
			
			console.log("Queries invalidated successfully");
		},
		onError: (error: Error) => {
			console.error("Failed to create job note:", error);
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
		}) => updateJobNote(jobId, noteId, data),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({ queryKey: ["jobs", variables.jobId] });
			await queryClient.invalidateQueries({ queryKey: ["jobs", variables.jobId, "notes"] });
			await queryClient.invalidateQueries({ queryKey: ["jobById", variables.jobId] });
			
			// If note is attached to a visit (or was moved to/from a visit), invalidate visits
			if (variables.data.visit_id) {
				await queryClient.invalidateQueries({ queryKey: ["jobVisits", variables.data.visit_id] });
			}
			await queryClient.invalidateQueries({ queryKey: ["jobVisits"] });
		},
		onError: (error: Error) => {
			console.error("Failed to update job note:", error);
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
			deleteJobNote(jobId, noteId),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({ queryKey: ["jobs", variables.jobId] });
			await queryClient.invalidateQueries({ queryKey: ["jobs", variables.jobId, "notes"] });
			await queryClient.invalidateQueries({ queryKey: ["jobById", variables.jobId] });
			
			// Invalidate job visits in case the note was attached to a visit
			await queryClient.invalidateQueries({ queryKey: ["jobVisits"] });
		},
		onError: (error: Error) => {
			console.error("Failed to delete job note:", error);
		},
	});
};