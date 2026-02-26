import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";

export const SETTLEMENT_KEYS = {
    all: ["settlements"] as const,
};

export const useSettlements = () => {
    const queryClient = useQueryClient();

    const useSettlementsQuery = () =>
        useQuery({
            queryKey: SETTLEMENT_KEYS.all,
            queryFn: async () => {
                const response = await api.get("/settlements");
                return response.data.data;
            },
        });

    const useSettlementPreviewMutation = () =>
        useMutation({
            mutationFn: async (params: {
                driverId: string;
                from: string;
                to: string;
                ratePerKm: string;
                dieselRate: string;
                extraExpense: string;
            }) => {
                const res = await api.get("/settlements/preview", { params });
                return res.data;
            },
        });

    const useConfirmSettlementMutation = () =>
        useMutation({
            mutationFn: async (payload: { data: any; period: any; driver: any }) => {
                const res = await api.post("/settlements/confirm", payload);
                return res.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: SETTLEMENT_KEYS.all });
            },
        });

    return {
        useSettlementsQuery,
        useSettlementPreviewMutation,
        useConfirmSettlementMutation,
    };
};
