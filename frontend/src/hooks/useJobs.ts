import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationResult,
	type UseQueryResult,
} from "@tanstack/react-query";
import type { CreateJobInput, Job,  JobNote, CreateJobNoteInput, UpdateJobNoteInput } from "../types/jobs";
import { createJob, getAllJobs, getJobById, updateJob, getJobNotes, createJobNote, updateJobNote, deleteJobNote } from "../api/jobs";

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
		},
		onError: (error: Error) => {
			console.error("Failed to delete job note:", error);
		},
	});
};