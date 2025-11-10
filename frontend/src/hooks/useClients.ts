import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationResult,
} from "@tanstack/react-query";
import type { Client, CreateClientInput } from "../types/clients";
import { createClient, getAllClients, getClientById } from "../api/clients";

export const useAllClientsQuery = () => {
	return useQuery<Client[], Error>({
		queryKey: ["allClients"],
		queryFn: getAllClients,
	});
};

export const useClientByIdQuery = (id: string) => {
	return useQuery<Client, Error>({
		queryKey: ["clientById", id],
		queryFn: () => getClientById(id),
		enabled: !!id,
	});
};

export const useCreateClientMutation = (): UseMutationResult<Client, Error, CreateClientInput> => {
	const queryClient = useQueryClient();

	return useMutation<Client, Error, CreateClientInput>({
		mutationFn: createClient,
		onSuccess: (newClient: Client) => {
			queryClient.invalidateQueries({ queryKey: ["allClients"] });
			queryClient.setQueryData(["clientById", newClient.id], newClient);
		},
		onError: (error) => {
			console.error("Failed to create client:", error);
		},
	});
};
