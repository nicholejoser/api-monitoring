"use client";

import { create } from "zustand";
import { toast } from "sonner";

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

  setTerminalNodeData: (data: TerminalNode[]) => void;

  setConsumptionGroupData: (
    data: ConsumptionGroupedByClient[]
  ) => void;

  refreshData: (date: string) => Promise<void>;

  clearData: () => void;
}

export const useDataStore = create<DataStore>((set) => ({
  terminalNodeData: [],
  consumptionGroupData: [],

  isLoading: false,
  fvKill: "",

  setIsLoading: (value) => {
    set({ isLoading: value });
  },

  setFVKill: (value) => {
    set({ fvKill: value });
  },

  setTerminalNodeData: (data) => {
    set({
      terminalNodeData: data,
    });
  },

  setConsumptionGroupData: (data) => {
    set({
      consumptionGroupData: data,
    });
  },

  refreshData: async (date: string) => {
    try {
      set({
        isLoading: true,
      });

      const [terminalResponse, consumptionResponse] =
        await Promise.all([
          fetch(
            `/data/${date}/filtered_terminal_nodes.json`
          ),
          fetch(
            `/data/${date}/consumption_data.json`
          ),
        ]);

      if (!terminalResponse.ok) {
        throw new Error(
          `Terminal nodes request failed: ${terminalResponse.status}`
        );
      }

      if (!consumptionResponse.ok) {
        throw new Error(
          `Consumption request failed: ${consumptionResponse.status}`
        );
      }

      const [
        terminalData,
        consumptionData,
      ] = await Promise.all([
        terminalResponse.json() as Promise<TerminalNode[]>,

        consumptionResponse.json() as Promise<
          ConsumptionGroupedByClient[]
        >,
      ]);

      // ------------------------------------------
      // Update terminal data
      // ------------------------------------------

      set({
        terminalNodeData: terminalData,
      });

      // Allow browser to render
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 0);
      });

      // ------------------------------------------
      // Update consumption data
      // ------------------------------------------

      set({
        consumptionGroupData: consumptionData,
      });

      toast.success("Data loaded successfully!");
    } catch (error) {
      console.error(
        "Failed to load selected data:",
        error
      );

      toast.error("Failed to load selected data");

      set({
        terminalNodeData: [],
        consumptionGroupData: [],
      });
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
