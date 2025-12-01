import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationResult,
	type UseQueryResult,
} from "@tanstack/react-query";
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
import * as clientApi from "../api/clients";

// ============================================
// CLIENT QUERIES
// ============================================

export const useAllClientsQuery = (): UseQueryResult<Client[], Error> => {
	return useQuery({
		queryKey: ["clients"],
		queryFn: clientApi.getAllClients,
	});
};

export const useClientByIdQuery = (id: string): UseQueryResult<Client, Error> => {
	return useQuery({
		queryKey: ["clients", id],
		queryFn: () => clientApi.getClientById(id),
		enabled: !!id,
	});
};

// ============================================
// CLIENT MUTATIONS
// ============================================

export const useCreateClientMutation = (): UseMutationResult<Client, Error, CreateClientInput> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: clientApi.createClient,
		onSuccess: (newClient: Client) => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
			queryClient.setQueryData(["clients", newClient.id], newClient);
		},
		onError: (error) => {
			console.error("Failed to create client:", error);
		},
	});
};

export const useUpdateClientMutation = (): UseMutationResult<
	Client,
	Error,
	{ id: string; data: UpdateClientInput }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateClientInput }) =>
			clientApi.updateClient(id, data),
		onSuccess: (updatedClient: Client) => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
			queryClient.setQueryData(["clients", updatedClient.id], updatedClient);
		},
		onError: (error: Error) => {
			console.error("Failed to update client:", error);
		},
	});
};

export const useDeleteClientMutation = (): UseMutationResult<
	{ message: string },
	Error,
	string
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: clientApi.deleteClient,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
		},
		onError: (error: Error) => {
			console.error("Failed to delete client:", error);
		},
	});
};

// ============================================
// CLIENT CONTACT QUERIES
// ============================================

export const useClientContactsQuery = (clientId: string): UseQueryResult<ClientContact[], Error> => {
	return useQuery({
		queryKey: ["clients", clientId, "contacts"],
		queryFn: () => clientApi.getClientContacts(clientId),
		enabled: !!clientId,
	});
};

// ============================================
// CLIENT CONTACT MUTATIONS
// ============================================

export const useCreateClientContactMutation = (): UseMutationResult<
	ClientContact,
	Error,
	{ clientId: string; data: CreateClientContactInput }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ clientId, data }: { clientId: string; data: CreateClientContactInput }) =>
			clientApi.createClientContact(clientId, data),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({ queryKey: ["clients", variables.clientId] });
			await queryClient.invalidateQueries({ queryKey: ["clients", variables.clientId, "contacts"] });
		},
		onError: (error: Error) => {
			console.error("Failed to create contact:", error);
		},
	});
};

export const useUpdateClientContactMutation = (): UseMutationResult<
	ClientContact,
	Error,
	{ clientId: string; contactId: string; data: UpdateClientContactInput }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			clientId,
			contactId,
			data,
		}: {
			clientId: string;
			contactId: string;
			data: UpdateClientContactInput;
		}) => clientApi.updateClientContact(clientId, contactId, data),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({ queryKey: ["clients", variables.clientId] });
			await queryClient.invalidateQueries({ queryKey: ["clients", variables.clientId, "contacts"] });
		},
		onError: (error: Error) => {
			console.error("Failed to update contact:", error);
		},
	});
};

export const useDeleteClientContactMutation = (): UseMutationResult<
	{ message: string },
	Error,
	{ clientId: string; contactId: string }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ clientId, contactId }: { clientId: string; contactId: string }) =>
			clientApi.deleteClientContact(clientId, contactId),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({ queryKey: ["clients", variables.clientId] });
			await queryClient.invalidateQueries({ queryKey: ["clients", variables.clientId, "contacts"] });
		},
		onError: (error: Error) => {
			console.error("Failed to delete contact:", error);
		},
	});
};

// ============================================
// CLIENT NOTE QUERIES
// ============================================

export const useClientNotesQuery = (clientId: string): UseQueryResult<ClientNote[], Error> => {
	return useQuery({
		queryKey: ["clients", clientId, "notes"],
		queryFn: () => clientApi.getClientNotes(clientId),
		enabled: !!clientId,
	});
};

// ============================================
// CLIENT NOTE MUTATIONS
// ============================================

export const useCreateClientNoteMutation = (): UseMutationResult<
	ClientNote,
	Error,
	{ clientId: string; data: CreateClientNoteInput }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ clientId, data }: { clientId: string; data: CreateClientNoteInput }) =>
			clientApi.createClientNote(clientId, data),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({ queryKey: ["clients", variables.clientId] });
			await queryClient.invalidateQueries({ queryKey: ["clients", variables.clientId, "notes"] });
		},
		onError: (error: Error) => {
			console.error("Failed to create note:", error);
		},
	});
};

export const useUpdateClientNoteMutation = (): UseMutationResult<
	ClientNote,
	Error,
	{ clientId: string; noteId: string; data: UpdateClientNoteInput }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			clientId,
			noteId,
			data,
		}: {
			clientId: string;
			noteId: string;
			data: UpdateClientNoteInput;
		}) => clientApi.updateClientNote(clientId, noteId, data),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({ queryKey: ["clients", variables.clientId] });
			await queryClient.invalidateQueries({ queryKey: ["clients", variables.clientId, "notes"] });
		},
		onError: (error: Error) => {
			console.error("Failed to update note:", error);
		},
	});
};

export const useDeleteClientNoteMutation = (): UseMutationResult<
	{ message: string },
	Error,
	{ clientId: string; noteId: string }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ clientId, noteId }: { clientId: string; noteId: string }) =>
			clientApi.deleteClientNote(clientId, noteId),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({ queryKey: ["clients", variables.clientId] });
			await queryClient.invalidateQueries({ queryKey: ["clients", variables.clientId, "notes"] });
		},
		onError: (error: Error) => {
			console.error("Failed to delete note:", error);
		},
	});
};