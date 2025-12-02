import axios from "axios";
import type { CreateJobInput, Job, JobResponse, CreateJobNoteInput, JobNote, UpdateJobNoteInput } from "../types/jobs";

const BASE_URL: string = import.meta.env.VITE_BACKEND_URL;

if (!BASE_URL) console.warn("Failed to load backend url environment variable!");

const api = axios.create({
	baseURL: BASE_URL,
});

// ============================================
// JOB API
// ============================================

export const getAllJobs = async (): Promise<Job[]> => {
	try {
		const response = await api.get<JobResponse>(`/jobs`);
		if (response.data.err) throw new Error(response.data.err);

		return response.data.data;
	} catch (error) {
		console.error("Failed to fetch jobs: ", error);
		throw error;
	}
};

export const getJobById = async (id: string): Promise<Job> => {
	try {
		const response = await api.get<JobResponse>(`/jobs/${id}`);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.data[0];
	} catch (error) {
		console.error("Failed to fetch job: ", error);
		throw error;
	}
};

export const createJob = async (input: CreateJobInput): Promise<Job> => {
	try {
		const response = await api.post<JobResponse>(`/jobs`, input);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.data[0];
	} catch (error) {
		console.error("Failed to post job: ", error);
		throw error;
	}
};

export const updateJob = async ( id: string, updates: Partial<Job>): Promise<Job> => {
	try {
		const response = await api.patch<JobResponse>(`/jobs/${id}`, updates);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.data[0];
	} catch (error) {
		console.error("Failed to update job: ", error);
		throw error;
	}
};

// ============================================
// JOB NOTES API
// ============================================

export const getJobNotes = async (jobId: string): Promise<JobNote[]> => {
	try {
		const response = await api.get<{ err: string; data: JobNote[] }>(`/jobs/${jobId}/notes`);
		return response.data.data;
	} catch (error) {
		console.error("Failed to fetch job notes:", error);
		throw error;
	}
};

export const createJobNote = async (jobId: string, data: CreateJobNoteInput): Promise<JobNote> => {
	try {
		const response = await api.post<{ err: string; item?: JobNote }>(`/jobs/${jobId}/notes`, data);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.item!;
	} catch (error) {
		console.error("Failed to create job note:", error);
		throw error;
	}
};

export const updateJobNote = async (jobId: string, noteId: string, data: UpdateJobNoteInput): Promise<JobNote> => {
	try {
		const response = await api.put<{ err: string; item?: JobNote }>(
			`/jobs/${jobId}/notes/${noteId}`,
			data
		);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.item!;
	} catch (error) {
		console.error("Failed to update job note:", error);
		throw error;
	}
};

export const deleteJobNote = async (jobId: string, noteId: string): Promise<{ message: string }> => {
	try {
		const response = await api.delete<{ err: string; message: string }>(
			`/jobs/${jobId}/notes/${noteId}`
		);

		if (response.data.err) throw new Error(response.data.err);
		return { message: response.data.message };
	} catch (error) {
		console.error("Failed to delete job note:", error);
		throw error;
	}
};