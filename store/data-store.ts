import { create } from "zustand";
import {
  ConsumptionGroupedByClient,
  TerminalNode,
} from "@/components/Types";
import { toast } from "sonner";

interface DataStore {
  // Data
  terminalNodeData: TerminalNode[];
  consumptionGroupData: ConsumptionGroupedByClient[];

  // UI state
  isLoading: boolean;
  fvKill: string;

  // Actions
  setIsLoading: (value: boolean) => void;
  setFVKill: (value: string) => void;

  setTerminalNodeData: (data: TerminalNode[]) => void;
  setConsumptionGroupData: (
    data: ConsumptionGroupedByClient[]
  ) => void;

  refreshData: () => Promise<void>;
  clearData: () => void;
}

export const useDataStore = create<DataStore>((set) => ({
  // --------------------------------------------------
  // Initial state
  // --------------------------------------------------

  terminalNodeData: [],
  consumptionGroupData: [],

  isLoading: false,
  fvKill: "",

  // --------------------------------------------------
  // Setters
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Fetch data
  // --------------------------------------------------

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
          `Terminal nodes request failed: ${res1.status}`
        );
      }

      if (!res2.ok) {
        throw new Error(
          `Consumption request failed: ${res2.status}`
        );
      }

      const [data1, data2] = await Promise.all([
        res1.json() as Promise<TerminalNode[]>,
        res2.json() as Promise<
          ConsumptionGroupedByClient[]
        >,
      ]);

      // Allow the browser to render between large updates.
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 0);
      });

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
      console.error("Failed to load data:", error);

      toast.error("Failed to load data");
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  // --------------------------------------------------
  // Clear data
  // --------------------------------------------------

  clearData: () => {
    set({
      terminalNodeData: [],
      consumptionGroupData: [],
    });
  },
}));
