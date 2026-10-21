"use client";

import React from "react";
import { useDataStore } from "@/store/data-store";

export function DataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

// Compatibility hook
export function useData() {
  return useDataStore();
}
