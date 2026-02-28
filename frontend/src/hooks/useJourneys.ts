import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { JourneyType } from "@/types/journey";
import api from "@/api/axios";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const useJourneys = () => {
    const queryClient = useQueryClient();

    // Fetch all journeys
    const useJourneysQuery = () =>
        useQuery({
            queryKey: [QUERY_KEYS.JOURNEYS],
            queryFn: async () => {
                const response = await api.get("/journey/all");
                return response.data.data as JourneyType[];
            },
        });

    // Add a new journey
    const useAddJourneyMutation = () =>
        useMutation({
            mutationFn: async (newJourney: Omit<JourneyType, "_id">) => {
                const response = await api.post("/journey/new", newJourney);
                return response.data.data as JourneyType;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNEYS] });
            },
        });

    // Update a journey
    const useUpdateJourneyMutation = () =>
        useMutation({
            mutationFn: async (updatedJourney: JourneyType) => {
                const response = await api.put(`/journey/update/${updatedJourney._id}`, updatedJourney);
                return response.data.data as JourneyType;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNEYS] });
            },
        });

    // Delete a journey
    const useDeleteJourneyMutation = () =>
        useMutation({
            mutationFn: async (id: string) => {
                await api.delete(`/journey/delete/${id}`);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNEYS] });
            },
        });

    return {
        useJourneysQuery,
        useAddJourneyMutation,
        useUpdateJourneyMutation,
        useDeleteJourneyMutation,
    };
};
