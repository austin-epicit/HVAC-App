import { useQuery } from "@tanstack/react-query";
import type { Job } from "../types/jobs";
import { getAllJobs } from "../api/jobs";

export const useAllJobsQuery = () => {
	return useQuery<Job[], Error>({
		queryKey: ["allJobs"],
		queryFn: getAllJobs,
	});
};

// export const useJobByIdQuery = (id: string | undefined) => {
// 	return useQuery<Job, Error>({
// 		queryKey: ["jobById", id],
// 		queryFn: () => (id!),
// 		enabled: !!id,
// 	});
// };
