"use client";

import React, { useEffect, useRef } from "react";
import { toast } from "sonner";
import { create } from "zustand";

import {
  ConsumptionGroupedByClient,
  TerminalNode,
} from "@/components/Types";

interface DataStore {
  terminalNodeData: TerminalNode[];
  consumptionGroupData: ConsumptionGroupedByClient[];
  isLoading: boolean;
  fvKill: string;

  setIsLoading: (value: boolean) => void;
  setFVKill: (value: string) => void;
  setTerminalNodeData: (
    value: TerminalNode[]
  ) => void;
  setConsumptionGroupData: (
    value: ConsumptionGroupedByClient[]
  ) => void;
  refreshData: () => Promise<void>;
  clearData: () => void;
}

export const useDataStore = create<DataStore>((set) => ({
  terminalNodeData: [],
  consumptionGroupData: [],
  isLoading: false,
  fvKill: "",

  setIsLoading: (value) => {
    set({
      isLoading: value,
    });
  },
  setFVKill: (value) => {
    set({
      fvKill: value,
    });
  },
  setTerminalNodeData: (value) => {
    set({
      terminalNodeData: value,
    });
  },
  setConsumptionGroupData: (value) => {
    set({
      consumptionGroupData: value,
    });
  },
  refreshData: async () => {
    try {
      set({
        isLoading: true,
      });

      const [res1, res2] = await Promise.all([
        fetch(
          "/data/2026-08-01/filtered_terminal_nodes.json"
        ),

        fetch(
          "/data/2026-08-01/consumption_data.json"
        ),
      ]);

      if (!res1.ok) {
        throw new Error(
          `Failed to fetch terminal nodes: ${res1.status} ${res1.statusText}`
        );
      }

      if (!res2.ok) {
        throw new Error(
          `Failed to fetch consumption data: ${res2.status} ${res2.statusText}`
        );
      }

      const [data1, data2] = await Promise.all([
        res1.json() as Promise<TerminalNode[]>,

        res2.json() as Promise<
          ConsumptionGroupedByClient[]
        >,
      ]);

      set({
        terminalNodeData: data1,
      });

      await new Promise<void>((resolve) => {
        setTimeout(resolve, 0);
      });

      set({
        consumptionGroupData: data2,
      });

      toast.success("Data loaded successfully!");
    } catch (error) {
      console.error(
        "Error loading application data:",
        error
      );

      toast.error("Failed to load data");
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  clearData: () => {
    set({
      terminalNodeData: [],
      consumptionGroupData: [],
    });
  },
}));

// ============================================================
// Data Context
// ============================================================
//
// The Context is now only a compatibility layer.
//
// Zustand actually stores all the state.
// This means you can keep:
//
// <DataProvider>
//   {children}
// </DataProvider>
//
// without needing React Context for state management.
// ============================================================

export function DataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasFetchedRef = useRef(false);

  const refreshData = useDataStore(
    (state) => state.refreshData
  );

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;

    refreshData();
  }, [refreshData]);

  return <>{children}</>;
}

// ============================================================
// useData
// ============================================================
//
// Keeps your existing API.
//
// Existing code:
//
// const {
//   terminalNodeData,
//   consumptionGroupData,
//   isLoading,
//   refreshData,
// } = useData();
//
// continues to work.
// ============================================================

export function useData() {
  return useDataStore();
}
