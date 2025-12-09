import axios from "axios";
import type { 
	Technician, 
	CreateTechnicianInput, 
	UpdateTechnicianInput,
} from "../types/technicians";

const BASE_URL: string = import.meta.env.VITE_BACKEND_URL;

if (!BASE_URL) console.warn("Failed to load backend url environment variable!");

const api = axios.create({
	baseURL: BASE_URL,
});

// ============================================
// TECHNICIAN API
// ============================================

export const getAllTechnicians = async (): Promise<Technician[]> => {
	try {
		const response = await api.get<{ err: string; data: Technician[] }>(`/technicians`);
		return response.data.data;
	} catch (error) {
		console.error("Failed to fetch technicians: ", error);
		throw error;
	}
};

export const getTechnicianById = async (id: string): Promise<Technician> => {
	try {
		const response = await api.get<{ err: string; data: Technician[] }>(`/technicians/${id}`);
		return response.data.data[0];
	} catch (error) {
		console.error("Failed to fetch technician: ", error);
		throw error;
	}
};

export const createTechnician = async (input: CreateTechnicianInput): Promise<Technician> => {
	try {
		const technicianData = {
			...input,
			coords: input.coords || { lat: 0, lon: 0 }
		};
		
		const response = await api.post<{ err: string; item?: Technician }>(`/technicians`, technicianData);
		
		if (response.data.err) throw new Error(response.data.err);
		
		if (!response.data.item) {
			console.error("Unexpected response format:", response.data);
			throw new Error("Server returned invalid response format");
		}
		
		return response.data.item;
	} catch (error) {
		console.error("Failed to create technician: ", error);
		if (axios.isAxiosError(error) && error.response) {
			console.error("Server response:", error.response.data);
		}
		throw error;
	}
};

export const updateTechnician = async (id: string, data: UpdateTechnicianInput): Promise<Technician> => {
	try {
		const response = await api.put<{ err: string; item?: Technician }>(`/technicians/${id}`, data);

		if (response.data.err) throw new Error(response.data.err);
		
		if (!response.data.item) {
			throw new Error("Server returned invalid response format");
		}
		
		return response.data.item;
	} catch (error) {
		console.error("Failed to update technician: ", error);
		throw error;
	}
};

export const deleteTechnician = async (id: string): Promise<{ message: string }> => {
	try {
		const response = await api.delete<{ err: string; message?: string }>(`/technicians/${id}`);

		if (response.data.err) throw new Error(response.data.err);
		return { message: response.data.message || "Technician deleted successfully" };
	} catch (error) {
		console.error("Failed to delete technician: ", error);
		throw error;
	}
};