import axios from "axios";
import type { ApiResponse } from "../types/api";
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
	const response = await api.get<ApiResponse<Client[]>>('/clients');
	return response.data.data || [];
};

export const getClientById = async (id: string): Promise<Client> => {
	const response = await api.get<ApiResponse<Client>>(`/clients/${id}`);
	
	if (!response.data.data) {
		throw new Error('Client not found');
	}
	
	return response.data.data;
};

export const createClient = async (input: CreateClientInput): Promise<Client> => {
	const response = await api.post<ApiResponse<Client>>('/clients', input);
	
	if (!response.data.success) {
		throw new Error(response.data.error?.message || 'Failed to create client');
	}
	
	return response.data.data!;
};

export const updateClient = async (id: string, data: UpdateClientInput): Promise<Client> => {
	const response = await api.put<ApiResponse<Client>>(`/clients/${id}`, data);
	
	if (!response.data.success) {
		throw new Error(response.data.error?.message || 'Failed to update client');
	}
	
	return response.data.data!;
};

export const deleteClient = async (id: string): Promise<{ message: string; id: string }> => {
	const response = await api.delete<ApiResponse<{ message: string; id: string }>>(`/clients/${id}`);
	
	if (!response.data.success) {
		throw new Error(response.data.error?.message || 'Failed to delete client');
	}
	
	return response.data.data || { message: 'Client deleted successfully', id };
};

// ============================================
// CLIENT CONTACT API
// ============================================

export const getClientContacts = async (clientId: string): Promise<ClientContact[]> => {
	const response = await api.get<ApiResponse<ClientContact[]>>(`/clients/${clientId}/contacts`);
	return response.data.data || [];
};

export const createClientContact = async (clientId: string, data: CreateClientContactInput): Promise<ClientContact> => {
	const response = await api.post<ApiResponse<ClientContact>>(`/clients/${clientId}/contacts`, data);
	
	if (!response.data.success) {
		throw new Error(response.data.error?.message || 'Failed to create contact');
	}
	
	return response.data.data!;
};

export const updateClientContact = async (clientId: string,contactId: string,data: UpdateClientContactInput): Promise<ClientContact> => {
	const response = await api.put<ApiResponse<ClientContact>>(`/clients/${clientId}/contacts/${contactId}`, data);
	
	if (!response.data.success) {
		throw new Error(response.data.error?.message || 'Failed to update contact');
	}
	
	return response.data.data!;
};

export const deleteClientContact = async (clientId: string, contactId: string): Promise<{ message: string }> => {
	const response = await api.delete<ApiResponse<{ message: string }>>(`/clients/${clientId}/contacts/${contactId}`);
	
	if (!response.data.success) {
		throw new Error(response.data.error?.message || 'Failed to delete contact');
	}
	
	return response.data.data || { message: 'Contact deleted successfully' };
};

// ============================================
// CLIENT NOTE API
// ============================================

export const getClientNotes = async (clientId: string): Promise<ClientNote[]> => {
	const response = await api.get<ApiResponse<ClientNote[]>>(`/clients/${clientId}/notes`);
	return response.data.data || [];
};

export const createClientNote = async (clientId: string, data: CreateClientNoteInput): Promise<ClientNote> => {
	const response = await api.post<ApiResponse<ClientNote>>(`/clients/${clientId}/notes`, data);
	
	if (!response.data.success) {
		throw new Error(response.data.error?.message || 'Failed to create note');
	}
	
	return response.data.data!;
};

export const updateClientNote = async (clientId: string, noteId: string, data: UpdateClientNoteInput): Promise<ClientNote> => {
	const response = await api.put<ApiResponse<ClientNote>>(`/clients/${clientId}/notes/${noteId}`, data);
	
	if (!response.data.success) {
		throw new Error(response.data.error?.message || 'Failed to update note');
	}
	
	return response.data.data!;
};

export const deleteClientNote = async (clientId: string, noteId: string): Promise<{ message: string }> => {
	const response = await api.delete<ApiResponse<{ message: string }>>(`/clients/${clientId}/notes/${noteId}`);
	
	if (!response.data.success) {
		throw new Error(response.data.error?.message || 'Failed to delete note');
	}
	
	return response.data.data || { message: 'Note deleted successfully' };
};