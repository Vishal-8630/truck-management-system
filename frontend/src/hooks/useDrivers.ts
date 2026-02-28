import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DriverType } from "@/types/driver";
import api from "@/api/axios";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const useDrivers = () => {
    const queryClient = useQueryClient();

    // Fetch all drivers
    const useDriversQuery = () =>
        useQuery({
            queryKey: [QUERY_KEYS.DRIVERS],
            queryFn: async () => {
                const response = await api.get("/driver/all");
                return response.data.data as DriverType[];
            },
        });

    // Add a new driver
    const useAddDriverMutation = () =>
        useMutation({
            mutationFn: async (newDriver: FormData) => {
                const response = await api.post("/driver/new", newDriver, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                return response.data.data as DriverType;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DRIVERS] });
            },
        });

    // Update a driver
    const useUpdateDriverMutation = () =>
        useMutation({
            mutationFn: async ({ id, updatedDriver }: { id: string; updatedDriver: FormData }) => {
                const response = await api.put(`/driver/update/${id}`, updatedDriver, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                return response.data.data as DriverType;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DRIVERS] });
            },
        });

    // Delete a driver
    const useDeleteDriverMutation = () =>
        useMutation({
            mutationFn: async (id: string) => {
                await api.delete(`/driver/delete/${id}`);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DRIVERS] });
            },
        });

    return {
        useDriversQuery,
        useAddDriverMutation,
        useUpdateDriverMutation,
        useDeleteDriverMutation,
    };
};
