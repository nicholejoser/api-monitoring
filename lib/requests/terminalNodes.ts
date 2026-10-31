import {
  ConsumptionGroupedByClient,
  SavedConsumptionResponse,
  TerminalNode,
  TerminalNodeSync,
} from "@/components/Types";

export interface TerminalNodeSyncResponse {
  sync: {
    id: number;
    startDate: Date;
    endDate: Date;
    pulledAt: Date;
  };
  totalRecords: number;
  records: TerminalNode[];
}
export interface ConsumptionResponse {
  message: string;
  syncId: number;
  totalClients: number;
  totalFetched: number;
  results: ConsumptionGroupedByClient[];
}
export async function fetchTerminalNodeSyncs(): Promise<TerminalNodeSync[]> {
  const res = await fetch("/api/terminalnodes/syncs", {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch synchronization history");
  }

  const data = await res.json();

  return data.map((sync: TerminalNodeSync) => ({
    ...sync,
    startDate: new Date(sync.startDate),
    endDate: new Date(sync.endDate),
    pulledAt: new Date(sync.pulledAt),
  }));
}
export async function fetchTerminalNodesBySync(
  syncId: number,
): Promise<TerminalNodeSyncResponse> {
  const res = await fetch(`/api/terminalnodes/syncs/${syncId}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch terminal nodes");
  }

  return res.json();
}

export async function fetchConsumptionsBySync(
  syncId: number,
  token: string,
): Promise<ConsumptionResponse> {
  const res = await fetch(`/api/terminalnodes/syncs/${syncId}/consumptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch consumption data");
  }

  return data;
}

export async function fetchSavedConsumptions(
  syncId: number,
): Promise<SavedConsumptionResponse> {
  const res = await fetch(
    `/api/terminalnodes/syncs/${syncId}/consumptions`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error || "Failed to retrieve daily consumptions",
    );
  }

  return data;
}