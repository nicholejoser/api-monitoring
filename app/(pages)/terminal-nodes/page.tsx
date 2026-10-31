"use client";
import BreadCrumb from "@/components/BreadCrumb";
import Loading from "@/components/Loading";
import TerminalTable from "@/components/tables/TerminalTable";
import TerminalNodesList from "@/components/TerminalNodesList";
import { useData } from "@/context/DataContext";
import { getEndOfMonth, getStartOfMonth } from "@/lib/utils";
import { useDataStore } from "@/store/data-store";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

export default function TerminalNodesAll() {
  const { fiberKill } = useData();
  const consumptions = useDataStore((state) => state.consumptions);
  const isLoading = useDataStore((state) => state.isLoading);
  const terminalNodes = useDataStore((state) => state.terminalNodes);
  const syncs = useDataStore((state) => state.syncs);
  const fetchSyncs = useDataStore((state) => state.fetchSyncs);

  const [startDate, setStartDate] = useState<Date | undefined>(
    getStartOfMonth(),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(getEndOfMonth());
  const router = useRouter();

  const [selected, setSelected] = useState<number | null>(null);
  const hasFetchedRef = useRef<boolean>(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchSyncs();
  }, [fetchSyncs]);

  return (
    <div className="w-full flex flex-col gap-8 font-lexend">
      {/* ================= LOADING OVERLAY ================= */}
      {isLoading && <Loading />}

      {/* ================= TERMINAL TABLE CARD ================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Card Header */}
        <div className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <BreadCrumb title="Terminal Nodes" />
        </div>

        {/* Table Body */}
        <div className="flex flex-col justify-center gap-3 p-6">
          <div className="flex flex-row items-center justify-between gap-3">
            <TerminalNodesList
              syncs={syncs}
              selected={selected}
              setSelected={setSelected}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
            <button
              onClick={() => router.push("/terminal-nodes/settings")}
              disabled={!fiberKill}
              className={`
          px-5 py-3 rounded-md text-sm font-medium transition-all
          flex items-center gap-2
          ${
            fiberKill
              ? "bg-slate-600 text-white hover:bg-slate-700 shadow-sm cursor-pointer"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }
        `}
            >
              <Settings className="w-4 h-4" />
              Fetch New Data
            </button>
          </div>
          <div className="rounded-xl border border-gray-200 shadow-md p-5">
            <TerminalTable
              terminalNodedata={terminalNodes}
              consumptionData={consumptions}
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
