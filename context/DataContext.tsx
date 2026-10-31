"use client";

import {
  UserTypes,
} from "@/components/Types";
import React, {
  createContext,
  useContext,
} from "react";

interface DataContextType {
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
  
  return (
    <DataContext.Provider
      value={{
        currentUser,
        fiberKill,
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
