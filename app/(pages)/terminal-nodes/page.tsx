"use client";
import BreadCrumb from "@/components/BreadCrumb";
import Breadcrumb from "@/components/BreadCrumb";
import { DatePickerInput } from "@/components/DatePickerInput";
import Loading from "@/components/Loading";
import TerminalTable from "@/components/tables/TerminalTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useData } from "@/context/DataContext";
import { getEndOfMonth, getStartOfMonth } from "@/lib/utils";
import { RefreshCcw, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function TerminalNodesAll() {
  const { terminalNodeData, consumptionGroupData, isLoading, fvKill } =
    useData();
  const [startDate, setStartDate] = useState<Date | undefined>(
    getStartOfMonth(),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(getEndOfMonth());
  const router = useRouter();
  const [files, setFiles] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");

  // const handleConsMultiple = async () => {
  //   setIsLoading(true);
  //   try {
  //     const res = await fetch(
  //       `/api/consumption?id=${nodeInput.trim()}&token=${fvKill}&type=multiple&start=${startDate?.toLocaleDateString("en-CA")}&end=${endDate?.toLocaleDateString("en-CA")}`,
  //     );

  //     if (!res.ok) {
  //       throw new Error(`Request failed: ${res.status}`);
  //     }
  //     setIsLoading(false);
  //   } catch (err) {
  //     console.error("Request failed:", err);
  //   }
  // };

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

      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5">
        <BreadCrumb />

        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-72 bg-white border-gray-300 shadow-sm">
            <SelectValue placeholder="Select data snapshot" />
          </SelectTrigger>

          <SelectContent
            position="popper"
            className="bg-white shadow-lg border border-gray-200"
          >
            {files.map((file) => (
              <SelectItem key={file} value={file}>
                {file.split("/").pop()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ================= TERMINAL TABLE CARD ================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Terminal Nodes
          </h2>

          <button
            onClick={() => router.push("/terminal-nodes/settings")}
            disabled={!fvKill}
            className={`
          px-5 py-2 rounded-lg text-sm font-medium transition-all
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

        {/* Table Body */}
        <div className="p-6">
          <TerminalTable
            data={terminalNodeData}
            consumptionData={consumptionGroupData}
          />
        </div>
      </div>

      {/* ================= CONSUMPTION CARD ================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-5">
          Fetch Consumption Logs
        </h2>

        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <DatePickerInput date={startDate} setDate={setStartDate} />
            <DatePickerInput date={endDate} setDate={setEndDate} />
          </div>

          <button
            disabled={isLoading || !fvKill}
            className={`
          min-w-[180px] px-6 py-2 rounded-lg text-sm font-medium
          transition-all flex items-center justify-center gap-2
          ${
            isLoading
              ? "bg-slate-400 text-white"
              : fvKill
                ? "bg-slate-600 text-white hover:bg-slate-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }
        `}
          >
            {isLoading ? (
              <>
                <RefreshCcw className="w-4 h-4 animate-spin" />
                Fetching...
              </>
            ) : (
              "Fetch Consumption Logs"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
