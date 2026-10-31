"use client";

import { create } from "zustand";
import {
  ConsumptionGroupedByClient,
  SavedConsumptionResponse,
  TerminalNode,
  TerminalNodeSync,
} from "@/components/Types";
import {
  ConsumptionResponse,
  fetchConsumptionsBySync,
  fetchSavedConsumptions,
  fetchTerminalNodesBySync,
  fetchTerminalNodeSyncs,
} from "@/lib/requests/terminalNodes";

interface DataStore {
  syncs: TerminalNodeSync[];
  terminalNodes: TerminalNode[];
  consumptions: ConsumptionGroupedByClient[];

  isLoading: boolean;
  fvKill: string;

  setSyncs: React.Dispatch<React.SetStateAction<TerminalNodeSync[]>>;
  setIsLoading: (value: boolean) => void;

  fetchConsumptions: (
    syncId: number,
    token: string,
  ) => Promise<ConsumptionResponse>;
  fetchSyncs: () => Promise<void>;
  fetchSavedConsumptions: (syncId: number) => Promise<SavedConsumptionResponse>;

  setFVKill: (value: string) => void;
  setTerminalNodeData: (data: TerminalNode[]) => void;
  setConsumptionGroupData: (data: ConsumptionGroupedByClient[]) => void;
  refreshData: (date: number) => Promise<void>;
  clearData: () => void;
}

export const useDataStore = create<DataStore>((set) => ({
  terminalNodes: [],
  consumptions: [],
  syncs: [],
  isLoading: false,
  fvKill: "",

  setSyncs: (syncs) =>
    set((state) => ({
      syncs: typeof syncs === "function" ? syncs(state.syncs) : syncs,
    })),

  setIsLoading: (value) => {
    set({ isLoading: value });
  },

  setFVKill: (value) => {
    set({ fvKill: value });
  },

  setTerminalNodeData: (data) => {
    set({
      terminalNodes: data,
    });
  },

  setConsumptionGroupData: (data) => {
    set({
      consumptions: data,
    });
  },
  fetchSyncs: async () => {
    try {
      const syncs = await fetchTerminalNodeSyncs();
      set({ syncs });
    } catch (error) {
      console.error("Failed to fetch synchronization history:", error);
    }
  },
  fetchConsumptions: async (syncId, token) => {
    set({ isLoading: true });

    try {
      const data = await fetchConsumptionsBySync(syncId, token);

      set({ consumptions: data.results });

      return data;
    } catch (error) {
      console.error("Failed to fetch consumptions:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  fetchSavedConsumptions: async (syncId) => {
    set({ isLoading: true });

    try {
      const data = await fetchSavedConsumptions(syncId);

      set({
        consumptions: data.results,
      });

      return data;
    } catch (error) {
      console.error("Failed to fetch saved consumptions:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  refreshData: async (syncId) => {
    set({ isLoading: true });

    try {
      const data = await fetchTerminalNodesBySync(syncId);

      set({
        terminalNodes: data.records,
      });
    } catch (error) {
      console.error("Failed to fetch terminal nodes:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  clearData: () => {
    set({
      terminalNodes: [],
      consumptions: [],
    });
  },
}));
