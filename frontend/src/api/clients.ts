import axios from "axios";
import type { Client, ClientResponse, CreateClientInput } from "../types/clients";

const BASE_URL: string = import.meta.env.VITE_BACKEND_URL;

if (!BASE_URL) console.warn("Failed to load backend url environment variable!");

const api = axios.create({
	baseURL: BASE_URL,
});

export const getAllClients = async (): Promise<Client[]> => {
	try {
		const response = await api.get<ClientResponse>(`/clients`);
		if (response.data.err) throw new Error(response.data.err);

		return response.data.data;
	} catch (error) {
		console.error("Failed to fetch clients: ", error);
		throw error;
	}
};

export const getClientById = async (id: string): Promise<Client> => {
	try {
		const response = await api.get<ClientResponse>(`/clients/${id}`);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.data[0];
	} catch (error) {
		console.error("Failed to fetch client: ", error);
		throw error;
	}
};

export const createClient = async (input: CreateClientInput): Promise<Client> => {
	try {
		const response = await api.post<ClientResponse>(`/clients`, input);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.data[0];
	} catch (error) {
		console.error("Failed to post client: ", error);
		throw error;
	}
};
