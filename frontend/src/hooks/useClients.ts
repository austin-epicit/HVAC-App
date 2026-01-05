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
	Contact,
	ClientContactLink,
	CreateContactInput,
	UpdateContactInput,
	LinkContactInput,
	UpdateClientContactInput,
	ClientNote,
	CreateClientNoteInput,
	UpdateClientNoteInput,
} from "../types/clients";
import * as clientApi from "../api/clients";

// ============================================================================
// CLIENT QUERIES
// ============================================================================

export const useAllClientsQuery = (): UseQueryResult<Client[], Error> => {
	return useQuery({
		queryKey: ["clients"],
		queryFn: clientApi.getAllClients,
	});
};

export const useClientByIdQuery = (
	id: string | null | undefined,
	options?: { enabled?: boolean }
): UseQueryResult<Client, Error> => {
	return useQuery({
		queryKey: ["clients", id],
		queryFn: () => clientApi.getClientById(id!),
		enabled: options?.enabled !== undefined ? options.enabled : !!id,
	});
};

// ============================================================================
// CLIENT MUTATIONS
// ============================================================================

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
	{ message: string; id: string },
	Error,
	string
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: clientApi.deleteClient,
		onSuccess: (data, deletedId) => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
			queryClient.removeQueries({ queryKey: ["clients", deletedId] });
		},
		onError: (error: Error) => {
			console.error("Failed to delete client:", error);
		},
	});
};

// ============================================================================
// INDEPENDENT CONTACT QUERIES
// ============================================================================

/**
 * Get all independent contacts (system-wide)
 */
export const useAllContactsQuery = (): UseQueryResult<Contact[], Error> => {
	return useQuery({
		queryKey: ["contacts"],
		queryFn: clientApi.getAllContacts,
	});
};

/**
 * Get a specific independent contact by ID
 */
export const useContactByIdQuery = (
	contactId: string | null | undefined,
	options?: { enabled?: boolean }
): UseQueryResult<Contact, Error> => {
	return useQuery({
		queryKey: ["contacts", contactId],
		queryFn: () => clientApi.getContactById(contactId!),
		enabled: options?.enabled !== undefined ? options.enabled : !!contactId,
	});
};

/**
 * Get all contacts linked to a specific client
 */
export const useClientContactsQuery = (
	clientId: string | null | undefined,
	options?: { enabled?: boolean }
): UseQueryResult<ClientContactLink[], Error> => {
	return useQuery({
		queryKey: ["clients", clientId, "contacts"],
		queryFn: () => clientApi.getClientContacts(clientId!),
		enabled: options?.enabled !== undefined ? options.enabled : !!clientId,
	});
};

// ============================================================================
// INDEPENDENT CONTACT MUTATIONS
// ============================================================================

export const useSearchContactsQuery = (
	query: string,
	clientId: string,
	enabled: boolean = true
): UseQueryResult<Contact[], Error> => {
	return useQuery({
		queryKey: ["contacts", "search", query, clientId],
		queryFn: () => clientApi.searchContacts(query, clientId),
		enabled: enabled && query.length >= 2,
		staleTime: 30000, // Cache for 30 seconds
	});
};

export const useCreateContactMutation = (): UseMutationResult<
	Contact,
	Error,
	CreateContactInput
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: clientApi.createContact,
		onSuccess: (newContact: Contact) => {
			// Invalidate all contacts list
			queryClient.invalidateQueries({ queryKey: ["contacts"] });

			// Cache the new contact
			queryClient.setQueryData(["contacts", newContact.id], newContact);

			// If linked to a client, invalidate that client's contacts
			if (newContact.client_contacts.length > 0) {
				newContact.client_contacts.forEach((link) => {
					queryClient.invalidateQueries({
						queryKey: ["clients", link.client_id, "contacts"],
					});
					queryClient.invalidateQueries({
						queryKey: ["clients", link.client_id],
					});
				});
			}
		},
		onError: (error: Error) => {
			console.error("Failed to create contact:", error);
		},
	});
};

/**
 * Update an independent contact
 */
export const useUpdateContactMutation = (): UseMutationResult<
	Contact,
	Error,
	{ contactId: string; data: UpdateContactInput }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			contactId,
			data,
		}: {
			contactId: string;
			data: UpdateContactInput;
		}) => clientApi.updateContact(contactId, data),
		onSuccess: (updatedContact: Contact) => {
			// Invalidate all contacts list
			queryClient.invalidateQueries({ queryKey: ["contacts"] });

			// Update cached contact
			queryClient.setQueryData(["contacts", updatedContact.id], updatedContact);

			// Invalidate all clients this contact is linked to
			updatedContact.client_contacts.forEach((link) => {
				queryClient.invalidateQueries({
					queryKey: ["clients", link.client_id, "contacts"],
				});
				queryClient.invalidateQueries({
					queryKey: ["clients", link.client_id],
				});
			});
		},
		onError: (error: Error) => {
			console.error("Failed to update contact:", error);
		},
	});
};

/**
 * Delete an independent contact (only if not linked)
 */
export const useDeleteContactMutation = (): UseMutationResult<
	{ message: string },
	Error,
	string
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: clientApi.deleteContact,
		onSuccess: (data, deletedContactId) => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			queryClient.removeQueries({ queryKey: ["contacts", deletedContactId] });
		},
		onError: (error: Error) => {
			console.error("Failed to delete contact:", error);
		},
	});
};

// ============================================================================
// CLIENT-CONTACT RELATIONSHIP MUTATIONS
// ============================================================================

/**
 * Link an existing contact to a client
 */
export const useLinkContactMutation = (): UseMutationResult<
	ClientContactLink,
	Error,
	{
		clientId: string;
		data: {
			contact_id: string;
			relationship: string;
			is_primary: boolean;
			is_billing: boolean;
		};
	}
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			clientId,
			data,
		}: {
			clientId: string;
			data: {
				contact_id: string;
				relationship: string;
				is_primary: boolean;
				is_billing: boolean;
			};
		}) => clientApi.linkContactToClient(clientId, data),
		onSuccess: (_, variables) => {
			// Invalidate client contacts to refresh the list
			queryClient.invalidateQueries({
				queryKey: ["clients", variables.clientId, "contacts"],
			});
			queryClient.invalidateQueries({
				queryKey: ["clients", variables.clientId],
			});
			// Invalidate the contact
			queryClient.invalidateQueries({
				queryKey: ["contacts", variables.data.contact_id],
			});
			queryClient.invalidateQueries({
				queryKey: ["contacts"],
			});
		},
		onError: (error: Error) => {
			console.error("Failed to link contact:", error);
		},
	});
};

/**
 * Update a client-contact relationship (metadata only)
 */
export const useUpdateClientContactMutation = (): UseMutationResult<
	ClientContactLink,
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
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["clients", variables.clientId, "contacts"],
			});
			queryClient.invalidateQueries({
				queryKey: ["clients", variables.clientId],
			});
		},
		onError: (error: Error) => {
			console.error("Failed to update client-contact relationship:", error);
		},
	});
};

/**
 * Unlink a contact from a client
 */
export const useUnlinkContactFromClientMutation = (): UseMutationResult<
	{ message: string },
	Error,
	{ clientId: string; contactId: string }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ clientId, contactId }: { clientId: string; contactId: string }) =>
			clientApi.unlinkContactFromClient(clientId, contactId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["clients", variables.clientId, "contacts"],
			});
			queryClient.invalidateQueries({
				queryKey: ["clients", variables.clientId],
			});
			queryClient.invalidateQueries({
				queryKey: ["contacts", variables.contactId],
			});
		},
		onError: (error: Error) => {
			console.error("Failed to unlink contact from client:", error);
		},
	});
};

// ============================================================================
// CLIENT NOTE QUERIES & MUTATIONS
// ============================================================================

export const useClientNotesQuery = (
	clientId: string | null | undefined,
	options?: { enabled?: boolean }
): UseQueryResult<ClientNote[], Error> => {
	return useQuery({
		queryKey: ["clients", clientId, "notes"],
		queryFn: () => clientApi.getClientNotes(clientId!),
		enabled: options?.enabled !== undefined ? options.enabled : !!clientId,
	});
};

export const useCreateClientNoteMutation = (): UseMutationResult<
	ClientNote,
	Error,
	{ clientId: string; data: CreateClientNoteInput }
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			clientId,
			data,
		}: {
			clientId: string;
			data: CreateClientNoteInput;
		}) => clientApi.createClientNote(clientId, data),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: ["clients", variables.clientId],
			});
			await queryClient.invalidateQueries({
				queryKey: ["clients", variables.clientId, "notes"],
			});
		},
		onError: (error: Error) => {
			console.error("Failed to create client note:", error);
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
			await queryClient.invalidateQueries({
				queryKey: ["clients", variables.clientId],
			});
			await queryClient.invalidateQueries({
				queryKey: ["clients", variables.clientId, "notes"],
			});
		},
		onError: (error: Error) => {
			console.error("Failed to update client note:", error);
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
			await queryClient.invalidateQueries({
				queryKey: ["clients", variables.clientId],
			});
			await queryClient.invalidateQueries({
				queryKey: ["clients", variables.clientId, "notes"],
			});
		},
		onError: (error: Error) => {
			console.error("Failed to delete client note:", error);
		},
	});
};
