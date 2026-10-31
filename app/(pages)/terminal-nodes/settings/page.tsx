"use client";
import BreadCrumb from "@/components/BreadCrumb";
import { DatePickerInput } from "@/components/DatePickerInput";
import Loading from "@/components/Loading";
import NewTerminalTable from "@/components/tables/NewTerminalTable";
import { useData } from "@/context/DataContext";
import {
  formatDate,
  formatNumber,
  getEndOfMonth,
  getStartOfMonth,
} from "@/lib/utils";
import { Info, RefreshCcw } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import UploadJson from "@/components/UploadJson";
import { useDataStore } from "@/store/data-store";
import TerminalNodesList from "@/components/TerminalNodesList";

export default function TerminalNodeSettings() {
  const { fiberKill } = useData();
  const {
    fetchSyncs,
    fetchConsumptions,
    syncs,
    consumptions,
    terminalNodes,
    isLoading,
    setIsLoading,
  } = useDataStore();
  const [selected, setSelected] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(
    getStartOfMonth(),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(getEndOfMonth());
  const [fetched, setFetched] = useState<number>(0);
  const hasFetchedRef = useRef<boolean>(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchSyncs();
  }, [fetchSyncs]);

  const handleTerminalNode = async () => {
    setIsLoading(true);
    console.log(formatDate(startDate!));
    console.log(formatDate(endDate!));
    const params = new URLSearchParams({
      token: fiberKill,
      startDate: startDate ? formatDate(startDate) : "",
      endDate: endDate ? formatDate(endDate) : "",
    });

    fetch(`/api/terminalnodes?${params}`, {
      method: "GET",
    });

    const interval = setInterval(async () => {
      const res = await fetch("/api/progress");
      const data = await res.json();

      setFetched(data.fetched);
      if (!data.running) {
        clearInterval(interval);
        setIsLoading(false);
        toast.success(data.message);
        // fetchNewData();
      }
    }, 500);
  };
  const handleConsMultiple = async () => {
    if (selected === null) {
      toast.error("Please select a synchronization first.");
      return;
    }

    setIsLoading(true);
    setFetched(0);

    let interval: NodeJS.Timeout | undefined;

    try {
      const requestPromise = fetchConsumptions(selected, fiberKill);

      interval = setInterval(async () => {
        try {
          const res = await fetch("/api/progress");
          if (!res.ok) return;

          const progress = await res.json();

          setFetched(progress.fetched);

          if (!progress.running) {
            if (interval) clearInterval(interval);
          }
        } catch (error) {
          console.error("Failed to fetch progress:", error);
        }
      }, 500);

      const data = await requestPromise;

      toast.success(data.message, {
        description: `Total clients: ${data.totalClients}. Total fetched: ${data.totalFetched}`,
      });
    } catch (err) {
      console.error("Consumption request failed:", err);

      toast.error(
        err instanceof Error ? err.message : "Failed to fetch consumption data",
      );
    } finally {
      if (interval) clearInterval(interval);
      setIsLoading(false);
    }
  };
  console.log(consumptions);
  return (
    <div className="w-full flex flex-col justify-center gap-5">
      {isLoading && (
        <Loading
          title="Fetching Terminal Nodes"
          description={`Fetched ${formatNumber(fetched)} records so far...`}
        />
      )}
      {isLoading && (
        <Loading
          title="Filtering Terminal Nodes"
          description={`Filtered based on status connected and excluce CHB records`}
        />
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Card Header */}
        <div className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <BreadCrumb
            title="Terminal Node Settings"
            toolTipText={`Steps to Use Terminal Node Settings: \n
              1. Fetch Terminal Node first.
              2. Look at the Select Data dropdown option to check if a new option has been added.
              3. Select that option.
              4. You can now see the whole terminal node data.
              5. If you want to fetch the consumption logs, click the Filter Terminal Node button to remove unnecessary data such as Suspended, Terminated, and CHB.
              6. Before clicking Fetch Consumption, make sure you set the date for the data you prefer to fetch.`}
            toolTipIcon={Info}
          />
        </div>
        <div className="w-full flex flex-col bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-gray-200/50 border border-white/60 p-5 gap-3">
          <div className="w-full flex flex-col justify-between lg:flex-row lg:items-center gap-6">
            <TerminalNodesList
              syncs={syncs}
              selected={selected}
              setSelected={setSelected}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
            <div className="flex flex-row items-center gap-3">
              <button
                onClick={handleTerminalNode}
                disabled={!fiberKill}
                className={`px-3 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-black/10 active:scale-[0.97] flex items-center gap-2 ${fiberKill ? "bg-slate-600 text-white border border-transparent hover:text-slate-600 hover:border-slate-600 hover:bg-white cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
              >
                <RefreshCcw className="w-5 h-5 shrink-0 active:animate-spin" />
                Fetch Terminal Nodes
              </button>
            </div>
          </div>
          <div className="w-full">
            <NewTerminalTable
              data={terminalNodes}
              consumptionData={consumptions}
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          </div>
        </div>
      </div>
      {/* ================= CONSUMPTION CARD ================= */}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Fetch Consumption Logs
          </h2>
        </div>
        <div className="bg-white p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <DatePickerInput date={startDate} setDate={setStartDate} />
              <DatePickerInput date={endDate} setDate={setEndDate} />
            </div>

            <button
              disabled={isLoading || !fiberKill}
              onClick={handleConsMultiple}
              className={`
          min-w-45 px-6 py-2 rounded-lg text-sm font-medium
          transition-all flex items-center justify-center gap-2
          ${
            isLoading
              ? "bg-slate-400 text-white"
              : fiberKill
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
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Import Data to Database
          </h2>
        </div>
        <div className="p-6">
          <UploadJson />
        </div>
      </div>
    </div>
  );
}
