import axios from "axios";
import type { 
	CreateJobInput, 
	Job, 
	JobResponse, 
	CreateJobNoteInput, 
	JobNote, 
	UpdateJobNoteInput,
	JobVisit,
	JobVisitResponse,
	CreateJobVisitInput,
	UpdateJobVisitInput,
} from "../types/jobs";

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
		console.log("Fetching job with ID:", id);
		
		if (!id) {
			throw new Error("Job ID is required");
		}
		
		const response = await api.get<JobResponse>(`/jobs/${id}`);
		console.log("Job response:", response.data);

		if (response.data.err) {
			console.error("API returned error:", response.data.err);
			throw new Error(response.data.err);
		}
		
		if (!response.data.data || !Array.isArray(response.data.data)) {
			console.error("Invalid response format:", response.data);
			throw new Error("Invalid response format from server");
		}
		
		const job = response.data.data[0];
		if (!job) {
			console.error("No job found in response data:", response.data);
			throw new Error("Job not found");
		}
		
		console.log("Successfully fetched job:", job);
		return job;
	} catch (error) {
		if (error instanceof Error) {
			console.error("Failed to fetch job:", error.message);
		} else {
			console.error("Failed to fetch job with unknown error:", error);
		}
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

export const updateJob = async (id: string, updates: Partial<Job>): Promise<Job> => {
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
// JOB VISIT API
// ============================================

export const getAllJobVisits = async (): Promise<JobVisit[]> => {
	try {
		const response = await api.get<JobVisitResponse>(`/job-visits`);
		if (response.data.err) throw new Error(response.data.err);

		return response.data.data;
	} catch (error) {
		console.error("Failed to fetch job visits: ", error);
		throw error;
	}
};

export const getJobVisitById = async (id: string): Promise<JobVisit> => {
	try {
		const response = await api.get<JobVisitResponse>(`/job-visits/${id}`);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.data[0];
	} catch (error) {
		console.error("Failed to fetch job visit: ", error);
		throw error;
	}
};

export const getJobVisitsByJobId = async (jobId: string): Promise<JobVisit[]> => {
	try {
		const response = await api.get<JobVisitResponse>(`/jobs/${jobId}/visits`);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.data;
	} catch (error) {
		console.error("Failed to fetch job visits by job ID: ", error);
		throw error;
	}
};

export const getJobVisitsByTechId = async (techId: string): Promise<JobVisit[]> => {
	try {
		const response = await api.get<JobVisitResponse>(`/technicians/${techId}/visits`);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.data;
	} catch (error) {
		console.error("Failed to fetch job visits by technician ID: ", error);
		throw error;
	}
};

export const getJobVisitsByDateRange = async (
	startDate: Date,
	endDate: Date
): Promise<JobVisit[]> => {
	try {
		const start = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
		const end = endDate.toISOString().split('T')[0];
		
		const response = await api.get<JobVisitResponse>(
			`/job-visits/date-range/${start}/${end}`
		);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.data;
	} catch (error) {
		console.error("Failed to fetch job visits by date range: ", error);
		throw error;
	}
};

export const createJobVisit = async (input: CreateJobVisitInput): Promise<JobVisit> => {
	try {
		const response = await api.post<JobVisitResponse>(`/job-visits`, input);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.data[0];
	} catch (error) {
		console.error("Failed to create job visit: ", error);
		throw error;
	}
};

export const updateJobVisit = async (
	id: string,
	updates: UpdateJobVisitInput
): Promise<JobVisit> => {
	try {
		const response = await api.put<JobVisitResponse>(`/job-visits/${id}`, updates);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.data[0];
	} catch (error) {
		console.error("Failed to update job visit: ", error);
		throw error;
	}
};

export const assignTechniciansToVisit = async (
	visitId: string,
	techIds: string[]
): Promise<JobVisit> => {
	try {
		const response = await api.put<JobVisitResponse>(
			`/job-visits/${visitId}/technicians`,
			{ tech_ids: techIds }
		);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.data[0];
	} catch (error) {
		console.error("Failed to assign technicians to visit: ", error);
		throw error;
	}
};

export const deleteJobVisit = async (id: string): Promise<{ message: string }> => {
	try {
		const response = await api.delete<{ err: string; message?: string }>(
			`/job-visits/${id}`
		);

		if (response.data.err) throw new Error(response.data.err);
		return { message: response.data.message || "Job visit deleted successfully" };
	} catch (error) {
		console.error("Failed to delete job visit: ", error);
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