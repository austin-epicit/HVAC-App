import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationResult,
} from "@tanstack/react-query";
import type { CreateJobInput, Job } from "../types/jobs";
import { createJob, getAllJobs, getJobById } from "../api/jobs";

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
		onSuccess: (newJob: Job) => {
			queryClient.invalidateQueries({ queryKey: ["allJobs"] });
			queryClient.setQueryData(["jobById", newJob.id], newJob);
		},
		onError: (error) => {
			console.error("Failed to create job:", error);
		},
	});
};
