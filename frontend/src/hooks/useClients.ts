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

/* ======================================================
   CLIENTS
====================================================== */

export const useAllClientsQuery = () => {
	return useQuery<Client[], Error>({
		queryKey: ["allClients"],
		queryFn: clientApi.getAllClients,
	});
};

export const useClientByIdQuery = (id: string) => {
	return useQuery<Client, Error>({
		queryKey: ["clientById", id],
		queryFn: () => clientApi.getClientById(id),
		enabled: !!id,
	});
};

export const useCreateClientMutation = (): UseMutationResult<Client, Error, CreateClientInput> => {
	const queryClient = useQueryClient();

	return useMutation<Client, Error, CreateClientInput>({
		mutationFn: clientApi.createClient,
		onSuccess: (newClient: Client) => {
			queryClient.invalidateQueries({ queryKey: ["allClients"] });
			queryClient.setQueryData(["clientById", newClient.id], newClient);
		},
		onError: (error) => {
			console.error("Failed to create client:", error);
		},
	});
};

export const useUpdateClientMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateClientInput }) =>
			clientApi.updateClient(id, data),
		onSuccess: (updatedClient: Client) => {
			queryClient.invalidateQueries({ queryKey: ["allClients"] });

			queryClient.setQueryData(["clientById", updatedClient.id], updatedClient);

			queryClient.setQueryData<Client[]>(["allClients"], (old) => {
				if (!old) return old;
				return old.map((client) =>
					client.id === updatedClient.id ? updatedClient : client
				);
			});
		},
		onError: (error: Error) => {
			console.error("Failed to update client:", error);
		},
	});
};

export const useDeleteClientMutation = (): UseMutationResult<{ message: string }, Error, string> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: clientApi.deleteClient,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["allClients"] });
		},
		onError: (error: Error) => {
			console.error("Failed to delete client:", error);
		},
	});
};

/* ======================================================
   CONTACTS
====================================================== */

export const useClientContactsQuery = (clientId: string): UseQueryResult<ClientContact[], Error> => {
	return useQuery({
		queryKey: ["clients", clientId, "contacts"],
		queryFn: () => clientApi.getClientContacts(clientId),
		enabled: !!clientId,
	});
};

export const useCreateClientContactMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({clientId, data,}: {clientId: string; data: CreateClientContactInput;}) => 
			clientApi.createClientContact(clientId, data),
		onSuccess: (_newContact: ClientContact, { clientId }) => {
			queryClient.invalidateQueries({ queryKey: ["clientById", clientId] });
			queryClient.invalidateQueries({ queryKey: ["allClients"] });
		},
		onError: (error: Error) => {
			console.error("Failed to add contact:", error);
		},
	});
};

export const useUpdateClientContactMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({clientId, contactId, data,}: {clientId: string;contactId: string;data: UpdateClientContactInput;}) => 
			clientApi.updateClientContact(clientId, contactId, data),
		onSuccess: (_updatedContact, { clientId }) => {
			queryClient.invalidateQueries({ queryKey: ["clientById", clientId] });
			queryClient.invalidateQueries({ queryKey: ["allClients"] });
		},
		onError: (error: Error) => {
			console.error("Failed to update contact:", error);
		},
	});
};

export const useDeleteClientContactMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({clientId, contactId,}: {clientId: string; contactId: string;}) => 
			clientApi.deleteClientContact(clientId, contactId),
		onSuccess: (_data, { clientId }) => {
			queryClient.invalidateQueries({ queryKey: ["clientById", clientId] });
			queryClient.invalidateQueries({ queryKey: ["allClients"] });
		},
		onError: (error: Error) => {
			console.error("Failed to delete contact:", error);
		},
	});
};

/* ======================================================
   NOTES
====================================================== */

export const useClientNotesQuery = (clientId: string): UseQueryResult<ClientNote[], Error> => {
	return useQuery({
		queryKey: ["clients", clientId, "notes"],
		queryFn: () => clientApi.getClientNotes(clientId),
		enabled: !!clientId,
	});
};

export const useCreateClientNoteMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({clientId, data,}: {clientId: string; data: CreateClientNoteInput;}) => 
			clientApi.createClientNote(clientId, data),
		onSuccess: (_newNote: ClientNote, { clientId }) => {
			queryClient.invalidateQueries({ queryKey: ["clientById", clientId] });
			queryClient.invalidateQueries({ queryKey: ["allClients"] });
		},
		onError: (error: Error) => {
			console.error("Failed to add note:", error);
		},
	});
};

export const useUpdateClientNoteMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({clientId, noteId, data,}: {clientId: string; noteId: string; data: UpdateClientNoteInput;}) => 
			clientApi.updateClientNote(clientId, noteId, data),
		onSuccess: (_updatedNote, { clientId }) => {
			queryClient.invalidateQueries({ queryKey: ["clientById", clientId] });
			queryClient.invalidateQueries({ queryKey: ["allClients"] });
		},
		onError: (error: Error) => {
			console.error("Failed to update note:", error);
		},
	});
};

export const useDeleteClientNoteMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({clientId, noteId,}: {clientId: string; noteId: string;}) => 
			clientApi.deleteClientNote(clientId, noteId),
		onSuccess: (_data, { clientId }) => {
			queryClient.invalidateQueries({ queryKey: ["clientById", clientId] });
			queryClient.invalidateQueries({ queryKey: ["allClients"] });
		},
		onError: (error: Error) => {
			console.error("Failed to delete note:", error);
		},
	});
};
