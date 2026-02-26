import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TruckType } from "@/types/truck";
import api from "@/api/axios";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const useTrucks = () => {
    const queryClient = useQueryClient();

    // Fetch all trucks
    const useTrucksQuery = () =>
        useQuery({
            queryKey: [QUERY_KEYS.TRUCKS],
            queryFn: async () => {
                const response = await api.get("/truck/all");
                return response.data.data as TruckType[];
            },
        });

    // Add a new truck
    const useAddTruckMutation = () =>
        useMutation({
            mutationFn: async (newTruck: FormData) => {
                const response = await api.post("/truck/new", newTruck, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                return response.data.data as TruckType;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRUCKS] });
            },
        });

    // Update a truck
    const useUpdateTruckMutation = () =>
        useMutation({
            mutationFn: async ({ id, updatedTruck }: { id: string; updatedTruck: FormData }) => {
                const response = await api.put(`/truck/update/${id}`, updatedTruck, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                return response.data.data as TruckType;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRUCKS] });
            },
        });

    // Delete a truck
    const useDeleteTruckMutation = () =>
        useMutation({
            mutationFn: async (id: string) => {
                await api.delete(`/truck/delete/${id}`);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRUCKS] });
            },
        });

    return {
        useTrucksQuery,
        useAddTruckMutation,
        useUpdateTruckMutation,
        useDeleteTruckMutation,
    };
};
