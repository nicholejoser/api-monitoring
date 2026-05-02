"use client";
import BreadCrumb from "@/components/BreadCrumb";
import { DatePickerInput } from "@/components/DatePickerInput";
import Loading from "@/components/Loading";
import NewTerminalTable from "@/components/tables/NewTerminalTable";
import TerminalTable from "@/components/tables/TerminalTable";
import { ConsumptionGroupedByClient, TerminalNode } from "@/components/Types";
import { useData } from "@/context/DataContext";
import { formatNumber, getEndOfMonth, getStartOfMonth } from "@/lib/utils";
import { Download, RefreshCcw } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function TerminalNodeSettings() {
  const { fvKill } = useData();
  const [startDate, setStartDate] = useState<Date | undefined>(
    getStartOfMonth(),
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingNew, setIsLoadingNew] = useState<boolean>(false);
  const [terminalNodeData, setTerminalNodeData] = useState<TerminalNode[]>([]);
  const [consumptionGroupData, setConsumptionGroupData] = useState<
    ConsumptionGroupedByClient[]
  >([]);
  const [endDate, setEndDate] = useState<Date | undefined>(getEndOfMonth());
  const [isToken, setIsToken] = useState<string>("");
  const [fetched, setFetched] = useState<number>(0);
  const [nodeInput, setNodeInput] = useState<string>("89833");
  const today = new Date().toLocaleDateString("en-CA");

  const fetchNewData = async () => {
    setIsLoadingNew(true);
    try {
      const res = await fetch(`/data/${today}/terminal_nodes_11-59-42.json`);
      const data = await res.json();
      setTerminalNodeData(data);
    } catch {
      toast.error("Error loading new data");
    } finally {
      setIsLoadingNew(false);
    }
  };
  //   const handleTerminalNode = async () => {
  //     try {
  //       const res = await fetch(`/api/terminalnodes?token=${isToken}`, {
  //         method: "GET",
  //       });
  //       if (!res.ok) {
  //         throw new Error(`Request failed: ${res.status}`);
  //       }
  //     } catch (err) {
  //       console.error("Request failed:", err);
  //     }
  //   };
  const handleTerminalNode = async () => {
    setIsLoading(true);
    fetch(`/api/terminalnodes?token=${fvKill}`, {
      method: "GET",
    });

    const interval = setInterval(async () => {
      const res = await fetch("/api/terminalnodes/progress");
      const data = await res.json();

      setFetched(data.fetched);
      if (!data.running) {
        clearInterval(interval);
        setIsLoading(false);
        fetchNewData();
      }
    }, 500);
  };
  const handleConsMultiple = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/consumption?id=${nodeInput.trim()}&token=${isToken}&type=multiple&start=${startDate?.toLocaleDateString("en-CA")}&end=${endDate?.toLocaleDateString("en-CA")}`,
      );

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Request failed:", err);
    }
  };
  // to generate the filtered clients, those status = "Connected" and excluding those packageName includes "CHB"
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/filter-terminal-nodes");
      if (res.ok) {
        toast.success("Terminal Nodes Filtered", {
          description:
            "Only connected nodes are included; CHB package entries are excluded.",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const hasMountedRef = useRef<boolean>(false);
  //   useEffect(() => {
  //     if (hasMountedRef.current) return;
  //     fetchNewData();
  //     hasMountedRef.current = true;
  //   });
  return (
    <div className="w-full flex flex-col justify-center gap-5">
      {isLoading && (
        <Loading
          title="Fetching Terminal Nodes"
          description={`Fetched ${formatNumber(fetched)} records so far...`}
        />
      )}
      {isLoadingNew && <Loading />}

      <div className="px-5">
        <BreadCrumb title="Terminal Node Settings" />
      </div>
      <div className="w-full flex flex-col bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-gray-200/50 border border-white/60 p-5 gap-3">
        <div className="w-full flex flex-col justify-end lg:flex-row lg:items-center gap-6">
          <button
            onClick={handleClick}
            className="w-fit flex items-center gap-1 bg-linear-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white px-2.5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-slate-200/50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.97]"
          >
            <Download className="w-5 h-5 shrink-0" />
            {loading ? "Processing..." : "Filter Terminal Nodes"}
          </button>
          <button
            onClick={handleTerminalNode}
            disabled={!fvKill}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-black/10 active:scale-[0.97] flex items-center gap-2 ${fvKill ? "bg-slate-600 text-white border border-transparent hover:text-slate-600 hover:border-slate-600 hover:bg-white cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
          >
            <RefreshCcw className="w-5 h-5 shrink-0 active:animate-spin" />
            Fetch Data
          </button>
        </div>
        <div className="w-full">
          <NewTerminalTable
            data={terminalNodeData}
            consumptionData={consumptionGroupData}
          />
        </div>
      </div>
      <div className="w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-gray-200/50 border border-white/60 overflow-hidden p-5">
        <div className="flex flex-row items-center gap-3">
          <div className="flex flex-row items-center gap-3">
            <DatePickerInput date={startDate} setDate={setStartDate} />
            <DatePickerInput date={endDate} setDate={setEndDate} />
          </div>
          <button
            onClick={handleConsMultiple}
            disabled={isLoading || !isToken}
            className="bg-slate-500 hover:bg-slate-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-35 gap-2 shadow-sm cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCcw className="w-5 h-5 shrink-0 animate-spin scale-x-[-1]" />
                Fetching data...
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
