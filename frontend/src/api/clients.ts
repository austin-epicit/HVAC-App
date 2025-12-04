import axios from "axios";
import type { 
	Client, 
	CreateClientInput, 
	UpdateClientInput,
	ClientContact,
	CreateClientContactInput,
	UpdateClientContactInput,
	ClientNote,
	CreateClientNoteInput,
	UpdateClientNoteInput,
} from "../types/clients";

const BASE_URL: string = import.meta.env.VITE_BACKEND_URL;

if (!BASE_URL) console.warn("Failed to load backend url environment variable!");

const api = axios.create({
	baseURL: BASE_URL,
});

// ============================================
// CLIENT API
// ============================================

export const getAllClients = async (): Promise<Client[]> => {
	try {
		const response = await api.get<{ err: string; data: Client[] }>(`/clients`);
		return response.data.data;
	} catch (error) {
		console.error("Failed to fetch clients: ", error);
		throw error;
	}
};

export const getClientById = async (id: string): Promise<Client> => {
	try {
		const response = await api.get<{ err: string; data: Client[] }>(`/clients/${id}`);
		return response.data.data[0];
	} catch (error) {
		console.error("Failed to fetch client: ", error);
		throw error;
	}
};

export const createClient = async (input: CreateClientInput): Promise<Client> => {
	try {
		const response = await api.post<{ err: string; item?: Client }>(`/clients`, input);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.item!;
	} catch (error) {
		console.error("Failed to create client: ", error);
		throw error;
	}
};

export const updateClient = async (id: string, data: UpdateClientInput): Promise<Client> => {
	try {
		const response = await api.put<{ err: string; item?: Client }>(`/clients/${id}`, data);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.item!;
	} catch (error) {
		console.error("Failed to update client: ", error);
		throw error;
	}
};

export const deleteClient = async (id: string): Promise<{ message: string }> => {
	try {
		const response = await api.delete<{ err: string; message?: string }>(`/clients/${id}`);

		if (response.data.err) throw new Error(response.data.err);
		return { message: response.data.message || "Client deleted successfully" };
	} catch (error) {
		console.error("Failed to delete client: ", error);
		throw error;
	}
};

// ============================================
// CLIENT CONTACT API
// ============================================

export const getClientContacts = async (clientId: string): Promise<ClientContact[]> => {
	try {
		const response = await api.get<{ err: string; data: ClientContact[] }>(`/clients/${clientId}/contacts`);
		return response.data.data; // Backend wraps in { err: "", data: [] }
	} catch (error) {
		console.error("Failed to fetch contacts: ", error);
		throw error;
	}
};

export const createClientContact = async (clientId: string, data: CreateClientContactInput): Promise<ClientContact> => {
	try {
		const response = await api.post<{ err: string; item?: ClientContact }>(`/clients/${clientId}/contacts`, data);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.item!;
	} catch (error) {
		console.error("Failed to create contact: ", error);
		throw error;
	}
};

export const updateClientContact = async (
	clientId: string,
	contactId: string,
	data: UpdateClientContactInput
): Promise<ClientContact> => {
	try {
		const response = await api.put<{ err: string; item?: ClientContact }>(
			`/clients/${clientId}/contacts/${contactId}`, 
			data
		);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.item!;
	} catch (error) {
		console.error("Failed to update contact: ", error);
		throw error;
	}
};

export const deleteClientContact = async (clientId: string, contactId: string): Promise<{ message: string }> => {
	try {
		const response = await api.delete<{ err: string; message?: string }>(
			`/clients/${clientId}/contacts/${contactId}`
		);

		if (response.data.err) throw new Error(response.data.err);
		return { message: response.data.message || "Contact deleted successfully" };
	} catch (error) {
		console.error("Failed to delete contact: ", error);
		throw error;
	}
};

// ============================================
// CLIENT NOTE API
// ============================================

export const getClientNotes = async (clientId: string): Promise<ClientNote[]> => {
	try {
		const response = await api.get<{ err: string; data: ClientNote[] }>(`/clients/${clientId}/notes`);
		return response.data.data; // Backend wraps in { err: "", data: [] }
	} catch (error) {
		console.error("Failed to fetch notes: ", error);
		throw error;
	}
};

export const createClientNote = async (clientId: string, data: CreateClientNoteInput): Promise<ClientNote> => {
	try {
		const response = await api.post<{ err: string; item?: ClientNote }>(`/clients/${clientId}/notes`, data);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.item!;
	} catch (error) {
		console.error("Failed to create note: ", error);
		throw error;
	}
};

export const updateClientNote = async (clientId: string, noteId: string, data: UpdateClientNoteInput): Promise<ClientNote> => {
	try {
		const response = await api.put<{ err: string; item?: ClientNote }>(
			`/clients/${clientId}/notes/${noteId}`, 
			data
		);

		if (response.data.err) throw new Error(response.data.err);
		return response.data.item!;
	} catch (error) {
		console.error("Failed to update note: ", error);
		throw error;
	}
};

export const deleteClientNote = async (clientId: string, noteId: string): Promise<{ message: string }> => {
	try {
		const response = await api.delete<{ err: string; message?: string }>(
			`/clients/${clientId}/notes/${noteId}`
		);

		if (response.data.err) throw new Error(response.data.err);
		return { message: response.data.message || "Note deleted successfully" };
	} catch (error) {
		console.error("Failed to delete note: ", error);
		throw error;
	}
};