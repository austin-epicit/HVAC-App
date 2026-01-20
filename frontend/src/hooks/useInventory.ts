import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
    type UseQueryResult,
} from "@tanstack/react-query";

import type {
    InventoryItem
} from "../types/inventory";

import * as inventoryApi from "../api/inventory";


// ============================================================================
// INVENTORY QUERIES
// ============================================================================

export const useAllInventoryQuery = (): UseQueryResult<InventoryItem[], Error> => {
    return useQuery({
        queryKey: ["allInventory"],
        queryFn: () => inventoryApi.getAllInventory(),
    });
};

export const useLowStockInventoryQuery = (): UseQueryResult<InventoryItem[], Error> => {
    return useQuery({
        queryKey: ["allInventory", "low-stock"],
        queryFn: () => inventoryApi.getAllInventory(true),
    });
};

// ============================================================================
// INVENTORY MUTATIONS
// ============================================================================

export const useUpdateItemThresholdMutation = (): UseMutationResult<
    InventoryItem,
    Error,
    {itemId: string; threshold: number | null}
> => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: ({itemId, threshold }: {itemId: string, threshold: number | null }) =>
                inventoryApi.updateItemThreshold(itemId, threshold),
            onSuccess: (updatedItem: InventoryItem)=> {
                // Invalidate all inventory queries
                queryClient.invalidateQueries({ queryKey: ["allInventory"]});
                queryClient.setQueryData(["allInventory", updatedItem.id], updatedItem);
            },
            onError: (error: Error) => {
                console.error("Failed to update inventory threshold:", error);
            },
        });
};