import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";
import { type BalancePartyType } from "@/types/vehicleEntry";
import { type BillingPartyType } from "@/types/billingParty";

export const PARTY_KEYS = {
    balanceAll: ["balanceParties"] as const,
    billingAll: ["billingParties"] as const,
};

export const useParties = () => {
    const queryClient = useQueryClient();

    // Balance Parties
    const useBalancePartiesQuery = () =>
        useQuery<BalancePartyType[]>({
            queryKey: PARTY_KEYS.balanceAll,
            queryFn: async () => {
                const response = await api.get("/balance-party/all");
                return response.data.data;
            },
        });

    const useAddBalancePartyMutation = () =>
        useMutation({
            mutationFn: async (newParty: Omit<BalancePartyType, "_id">) => {
                const response = await api.post("/balance-party/new", newParty);
                return response.data.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: PARTY_KEYS.balanceAll });
            },
        });

    const useUpdateBalancePartyMutation = () =>
        useMutation({
            mutationFn: async ({ id, updatedParty }: { id: string; updatedParty: Partial<BalancePartyType> }) => {
                const response = await api.put(`/balance-party/update/${id}`, updatedParty);
                return response.data.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: PARTY_KEYS.balanceAll });
            },
        });

    const useDeleteBalancePartyMutation = () =>
        useMutation({
            mutationFn: async (id: string) => {
                const response = await api.delete(`/balance-party/delete/${id}`);
                return response.data.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: PARTY_KEYS.balanceAll });
            },
        });

    // Billing Parties
    const useBillingPartiesQuery = () =>
        useQuery<BillingPartyType[]>({
            queryKey: PARTY_KEYS.billingAll,
            queryFn: async () => {
                const response = await api.get("/billing-party/all");
                return response.data.data;
            },
        });

    const useAddBillingPartyMutation = () =>
        useMutation({
            mutationFn: async (newParty: Omit<BillingPartyType, "_id">) => {
                const response = await api.post("/billing-party/new", newParty);
                return response.data.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: PARTY_KEYS.billingAll });
            },
        });

    const useUpdateBillingPartyMutation = () =>
        useMutation({
            mutationFn: async ({ id, updatedParty }: { id: string; updatedParty: Partial<BillingPartyType> }) => {
                const response = await api.put(`/billing-party/update/${id}`, updatedParty);
                return response.data.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: PARTY_KEYS.billingAll });
            },
        });

    const useDeleteBillingPartyMutation = () =>
        useMutation({
            mutationFn: async (id: string) => {
                const response = await api.delete(`/billing-party/delete/${id}`);
                return response.data.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: PARTY_KEYS.billingAll });
            },
        });

    return {
        useBalancePartiesQuery,
        useAddBalancePartyMutation,
        useUpdateBalancePartyMutation,
        useDeleteBalancePartyMutation,
        useBillingPartiesQuery,
        useAddBillingPartyMutation,
        useUpdateBillingPartyMutation,
        useDeleteBillingPartyMutation,
    };
};
