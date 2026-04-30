"use client";

import { ConsumptionGroupedByClient, TerminalNode } from "@/components/Types";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

interface DataContextType {
  terminalNodeData: TerminalNode[];
  consumptionGroupData: ConsumptionGroupedByClient[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [terminalNodeData, setTerminalNodeData] = useState<TerminalNode[]>([]);
  const [consumptionGroupData, setConsumptionGroupData] = useState<
    ConsumptionGroupedByClient[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const hasFetchedRef = useRef(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const [res1, res2] = await Promise.all([
        fetch("/data/terminal_nodes.json"),
        fetch("/data/consumption_data.json"),
      ]);

      const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

      setTerminalNodeData(data1);
      setConsumptionGroupData(data2);

      toast.success("Data loaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;

    fetchData();
    hasFetchedRef.current = true;
  }, []);

  return (
    <DataContext.Provider
      value={{
        terminalNodeData,
        consumptionGroupData,
        isLoading,
        setIsLoading,
        refreshData: fetchData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useData must be used inside DataProvider");
  }

  return context;
}
