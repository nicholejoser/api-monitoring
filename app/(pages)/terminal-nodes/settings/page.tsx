"use client";
import BreadCrumb from "@/components/BreadCrumb";
import { DatePickerInput } from "@/components/DatePickerInput";
import Loading from "@/components/Loading";
import NewTerminalTable from "@/components/tables/NewTerminalTable";
import { useData } from "@/context/DataContext";
import { formatNumber, getEndOfMonth, getStartOfMonth } from "@/lib/utils";
import { Download, RefreshCcw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import TerminalNodesList from "@/components/TerminalNodesList";

export default function TerminalNodeSettings() {
  const {
    fvKill,
    isLoading,
    terminalNodeData,
    consumptionGroupData,
    setIsLoading,
    setTerminalNodeData,
    setConsumptionGroupData,
  } = useData();
  const [startDate, setStartDate] = useState<Date | undefined>(
    getStartOfMonth(),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(getEndOfMonth());
  const [isLoadingNew, setIsLoadingNew] = useState<boolean>(false);
  const [fetched, setFetched] = useState<number>(0);
  const today = new Date().toLocaleDateString("en-CA");
  const [files, setFiles] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);

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
  //       const res = await fetch(`/api/terminalnodes?token=${fvKill}`, {
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
      fetch(
        `/api/consumption?token=${fvKill}&type=multiple&start=${startDate?.toLocaleDateString("en-CA")}&end=${endDate?.toLocaleDateString("en-CA")}`,
      );
      const interval = setInterval(async () => {
        const res = await fetch("/api/terminalnodes/progress");
        const data = await res.json();

        setFetched(data.fetched);
        if (!data.running) {
          clearInterval(interval);
          setIsLoading(false);
        }
      }, 500);
    } catch (err) {
      console.error("Request failed:", err);
    }
  };
  // to generate the filtered clients, those status = "Connected" and excluding those packageName includes "CHB"
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
    <div className="w-full flex flex-col justify-center gap-5">
      {isLoading && (
        <Loading
          title="Fetching Terminal Nodes"
          description={`Fetched ${formatNumber(fetched)} records so far...`}
        />
      )}
      {loading && (
        <Loading
          title="Filtering Terminal Nodes"
          description={`Filtered based on status connected and excluce CHB records`}
        />
      )}
      {isLoadingNew && <Loading />}

      <div className="px-5">
        <BreadCrumb title="Terminal Node Settings" />
      </div>
      <div className="w-full flex flex-col bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-gray-200/50 border border-white/60 p-5 gap-3">
        <div className="w-full flex flex-col justify-between lg:flex-row lg:items-center gap-6">
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
          <div className="flex flex-row items-center gap-3">
            <button
              onClick={handleClick}
              className="w-fit flex items-center gap-1 bg-linear-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white px-2.5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-slate-200/50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.97]"
            >
              <Download className="w-5 h-5 shrink-0" />
              {loading ? "Processing..." : "Filter Terminal Nodes"}
            </button>
            <button
              onClick={handleTerminalNode}
              disabled={!fvKill}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-black/10 active:scale-[0.97] flex items-center gap-2 ${fvKill ? "bg-slate-600 text-white border border-transparent hover:text-slate-600 hover:border-slate-600 hover:bg-white cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
            >
              <RefreshCcw className="w-5 h-5 shrink-0 active:animate-spin" />
              Fetch Data
            </button>
          </div>
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
            disabled={isLoading || !fvKill}
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
