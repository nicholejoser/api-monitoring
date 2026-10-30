"use client";

import {
  ConsumptionGroupedByClient,
  TerminalNode,
  UserTypes,
} from "@/components/Types";
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
  // refreshData: () => Promise<void>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setTerminalNodeData: React.Dispatch<React.SetStateAction<TerminalNode[]>>;
  setConsumptionGroupData: React.Dispatch<
    React.SetStateAction<ConsumptionGroupedByClient[]>
  >;
  currentUser: UserTypes;
  fiberKill: string;
}
interface DataProviderProps {
  children: React.ReactNode;
  currentUser: UserTypes;
  fiberKill: string;
}
const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({
  children,
  currentUser,
  fiberKill,
}: DataProviderProps) {
  const [terminalNodeData, setTerminalNodeData] = useState<TerminalNode[]>([]);
  const [consumptionGroupData, setConsumptionGroupData] = useState<
    ConsumptionGroupedByClient[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const hasFetchedRef = useRef<boolean>(false);

  // const fetchData = async () => {
  //   try {
  //     setIsLoading(true);

  //     const [res1, res2] = await Promise.all([
  //       // fetch("/data/terminal_nodes.json"),
  //       // fetch("/data/consumption_data.json"),
  //       fetch("/data/2026-07-01/filtered_terminal_nodes.json"),
  //       fetch("/data/2026-07-01/consumption_data.json"),
  //       // fetch("/api/import?type=terminal_nodes", { method: "GET" }),
  //       // fetch("/api/import?type=consumptions", { method: "GET" }),
  //     ]);

  //     const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

  //     setTerminalNodeData(data1);
  //     setConsumptionGroupData(data2);

  //     toast.success("Data loaded successfully!");
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to load data");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   if (hasFetchedRef.current) return;

  //   fetchData();
  //   hasFetchedRef.current = true;
  // }, []);

  return (
    <DataContext.Provider
      value={{
        terminalNodeData,
        consumptionGroupData,
        currentUser,
        fiberKill,
        isLoading,
        setIsLoading,
        // refreshData: fetchData,
        setTerminalNodeData,
        setConsumptionGroupData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// Compatibility hook
export function useData() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useData must be used inside DataProvider");
  }

  return context;
}
