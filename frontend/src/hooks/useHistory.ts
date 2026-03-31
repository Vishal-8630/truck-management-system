import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";
import type { HistoryResponse } from "@/types/history";

export const useHistory = (entityType?: string, entityId?: string) =>
  useQuery({
    queryKey: ["history", entityType, entityId],
    queryFn: async () => {
      const response = await api.get(`/history/${entityType}/${entityId}`);
      return response.data.data as HistoryResponse;
    },
    enabled: Boolean(entityType && entityId),
  });
