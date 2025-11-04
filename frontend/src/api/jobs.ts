import axios from "axios";
import type { Job, JobResponse } from "../types/jobs";

const BASE_URL: string = import.meta.env.VITE_BACKEND_URL;

if (!BASE_URL) console.warn("Failed to load backend url environment variable!");

const api = axios.create({
	baseURL: BASE_URL,
});

export const getAllJobs = async (): Promise<Job[]> => {
	try {
		const response = await api.get<JobResponse>(`/jobs`);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.jobs;
	} catch (error) {
		console.error("Failed to fetch jobs: ", error);
		throw error;
	}
};

export const getBucketById = async (id: string): Promise<Job> => {
	try {
		const response = await api.get<JobResponse>(`/jobs/${id}`);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.jobs[0];
	} catch (error) {
		console.error("Failed to fetch job: ", error);
		throw error;
	}
};
