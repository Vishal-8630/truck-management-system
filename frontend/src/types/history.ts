export interface HistoryActor {
  id: string;
  username: string;
  fullname: string;
}

export interface HistoryItem {
  _id: string;
  entityType: string;
  entityId: string;
  action: "create" | "update" | "delete" | "status_change";
  changedFields: string[];
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  actor: HistoryActor;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryResponse {
  rows: HistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
