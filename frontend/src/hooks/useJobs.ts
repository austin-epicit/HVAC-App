import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationResult,
} from "@tanstack/react-query";
import type { CreateJobInput, Job } from "../types/jobs";
import { createJob, getAllJobs, getJobById, updateJob } from "../api/jobs";

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