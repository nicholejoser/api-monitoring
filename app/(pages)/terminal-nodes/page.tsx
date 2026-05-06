"use client";
import BreadCrumb from "@/components/BreadCrumb";
import Loading from "@/components/Loading";
import TerminalTable from "@/components/tables/TerminalTable";
import TerminalNodesList from "@/components/TerminalNodesList";

import { useData } from "@/context/DataContext";
import { getEndOfMonth, getStartOfMonth } from "@/lib/utils";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function TerminalNodesAll() {
  const {
    terminalNodeData,
    consumptionGroupData,
    isLoading,
    setIsLoading,
    setTerminalNodeData,
    setConsumptionGroupData,
    fvKill,
  } = useData();
  const [startDate, setStartDate] = useState<Date | undefined>(
    getStartOfMonth(),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(getEndOfMonth());
  const router = useRouter();
  const [files, setFiles] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const loadFiles = async () => {
      try {
        const res = await fetch("/api/data-files");
        const data = await res.json();

        if (isMounted) {
          setFiles(data);
        }
      } catch {
        toast.error("Failed loading data options");
      }
    };

    loadFiles();

    return () => {
      isMounted = false;
    };
  }, []);

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
              files={files}
              selected={selected}
              setSelected={setSelected}
              setIsLoading={setIsLoading}
              setTerminalNodeData={setTerminalNodeData}
              setConsumptionGroupData={setConsumptionGroupData}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />

            <button
              onClick={() => router.push("/terminal-nodes/settings")}
              disabled={!fvKill}
              className={`
          px-5 py-3 rounded-md text-sm font-medium transition-all
          flex items-center gap-2
          ${
            fvKill
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
              terminalNodedata={terminalNodeData}
              consumptionData={consumptionGroupData}
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
