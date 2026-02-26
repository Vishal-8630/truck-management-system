import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";
import { type BillEntryType } from "@/types/billEntry";
import { type VehicleEntryType } from "@/types/vehicleEntry";

export const LEDGER_KEYS = {
    all: ["ledgers"] as const,
    billEntries: ["billEntries"] as const,
    vehicleEntries: ["vehicleEntries"] as const,
};

export const useLedgers = () => {
    const queryClient = useQueryClient();

    const useLedgersQuery = () =>
        useQuery<any[]>({
            queryKey: LEDGER_KEYS.all,
            queryFn: async () => {
                const response = await api.get("/ledger/all");
                return response.data.data;
            },
        });

    const useAddLedgerMutation = () =>
        useMutation({
            mutationFn: async (newLedger: any) => {
                const response = await api.post("/ledger/new", newLedger);
                return response.data.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: LEDGER_KEYS.all });
            },
        });

    const useUpdateLedgerMutation = () =>
        useMutation({
            mutationFn: async (updatedLedger: any) => {
                const response = await api.put(`/ledger/update/${updatedLedger._id}`, updatedLedger);
                return response.data.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: LEDGER_KEYS.all });
            },
        });

    return {
        useLedgersQuery,
        useAddLedgerMutation,
        useUpdateLedgerMutation,
    };
};

export const useBillEntries = () => {
    const queryClient = useQueryClient();

    const useBillEntriesQuery = () =>
        useQuery<BillEntryType[]>({
            queryKey: LEDGER_KEYS.billEntries,
            queryFn: async () => {
                const response = await api.get("/bill-entry/all");
                return response.data.data;
            },
        });

    const useAddBillEntryMutation = () =>
        useMutation({
            mutationFn: async (newEntry: Omit<BillEntryType, "_id">) => {
                const response = await api.post("/bill-entry/new", newEntry);
                return response.data.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: LEDGER_KEYS.billEntries });
            },
        });

    const useUpdateBillEntryMutation = () =>
        useMutation({
            mutationFn: async (updatedEntry: BillEntryType) => {
                const response = await api.put(`/bill-entry/update/${updatedEntry._id}`, updatedEntry);
                return response.data.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: LEDGER_KEYS.billEntries });
            },
        });

    const useDeleteBillEntryMutation = () =>
        useMutation({
            mutationFn: async (id: string) => {
                await api.delete(`/bill-entry/delete/${id}`);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: LEDGER_KEYS.billEntries });
            },
        });

    const useSearchBillEntriesByParamMutation = () =>
        useMutation({
            mutationFn: async (params: Record<string, any>) => {
                const response = await api.post("/bill-entry/search/by-param", { params });
                return response.data.data;
            },
        });

    return {
        useBillEntriesQuery,
        useAddBillEntryMutation,
        useUpdateBillEntryMutation,
        useDeleteBillEntryMutation,
        useSearchBillEntriesByParamMutation,
    };
};

export const useVehicleEntries = () => {
    const queryClient = useQueryClient();

    const useVehicleEntriesQuery = () =>
        useQuery<VehicleEntryType[]>({
            queryKey: LEDGER_KEYS.vehicleEntries,
            queryFn: async () => {
                const response = await api.get("/vehicle-entry/all");
                return response.data.data;
            },
        });

    const useAddVehicleEntryMutation = () =>
        useMutation({
            mutationFn: async (newEntry: Omit<VehicleEntryType, "_id">) => {
                const response = await api.post("/vehicle-entry/new", newEntry);
                return response.data.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: LEDGER_KEYS.vehicleEntries });
            },
        });

    const useUpdateVehicleEntryMutation = () =>
        useMutation({
            mutationFn: async (updatedEntry: VehicleEntryType) => {
                const response = await api.put(`/vehicle-entry/update/${updatedEntry._id}`, updatedEntry);
                return response.data.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: LEDGER_KEYS.vehicleEntries });
            },
        });

    const useDeleteVehicleEntryMutation = () =>
        useMutation({
            mutationFn: async (id: string) => {
                await api.delete(`/vehicle-entry/delete/${id}`);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: LEDGER_KEYS.vehicleEntries });
            },
        });

    const useVehicleEntriesByPartyQuery = (partyId: string) =>
        useQuery<VehicleEntryType[]>({
            queryKey: [...LEDGER_KEYS.vehicleEntries, "by-party", partyId],
            queryFn: async () => {
                const response = await api.get(`/vehicle-entry/by-party/${partyId}`);
                return response.data.data;
            },
            enabled: !!partyId,
        });

    return {
        useVehicleEntriesQuery,
        useVehicleEntriesByPartyQuery,
        useAddVehicleEntryMutation,
        useUpdateVehicleEntryMutation,
        useDeleteVehicleEntryMutation,
    };
};
