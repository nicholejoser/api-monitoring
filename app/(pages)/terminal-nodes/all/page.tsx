"use client";
import { DatePickerInput } from "@/components/DatePickerInput";
import Header from "@/components/Header";
import TerminalTable from "@/components/tables/TerminalTable";
import { ConsumptionGroupedByClient, TerminalNode } from "@/components/Types";
import { getEndOfMonth, getStartOfMonth } from "@/lib/utils";
import { Loader2, RefreshCcw } from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

export default function TerminalNodesAll() {
  const [startDate, setStartDate] = useState<Date | undefined>(
    getStartOfMonth(),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(getEndOfMonth());
  const [terminalNodeData, setTerminalNodeData] = useState<TerminalNode[]>([]);
  const [consumptionGroupData, setconsumptionGroupData] = useState<
    ConsumptionGroupedByClient[]
  >([]);
  const hasMountedRef = useRef<boolean>(false);
  const [isToken, setIsToken] = useState<string>("");
  const [nodeInput, setNodeInput] = useState<string>("89833");
  const [activeNodeId, setActiveNodeId] = useState<string>("89833");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleLogin = async () => {
    setIsLoading(true); // Start loading spinner

    try {
      const response = await fetch("/api/login", {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        setIsToken(result.token.id);
      } else {
        console.error("❌ Login failed:", result);
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setIsLoading(false); // Stop loading spinner regardless of success or failure
    }
  };
  const handleTerminalNode = async () => {
    try {
      const res = await fetch(`/api/terminalnodes?token=${isToken}`);
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
    } catch (err) {
      console.error("Request failed:", err);
    }
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
  const fetchTermConsumpData = async () => {
    try {
      setIsLoading(true);

      const [res1, res2] = await Promise.all([
        fetch("/data/terminal_nodes.json"),
        fetch("/data/consumption_data.json"),
      ]);

      const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

      setTerminalNodeData(data1);
      setconsumptionGroupData(data2);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      hasMountedRef.current = true;
      toast.success("Data loaded successfully!");
    }
  };
  // useEffect(() => {
  //   if (hasMountedRef.current) return;
  //   fetchTermConsumpData();
  // });
  return (
    <div className="w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-gray-200/50 border border-white/60 overflow-hidden">
     
      {isLoading && (
        <div className="absolute inset-0 bg-black/30 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-white">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Loading data...</p>
          </div>
        </div>
      )}
      <div className="w-full flex flex-row items-center justify-between">
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="bg-slate-500 hover:bg-slate-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-35 gap-2 shadow-sm cursor-pointer"
        >
          {isLoading ? (
            <>
              {/* Loading Spinner SVG */}
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Connecting...
            </>
          ) : (
            "Login to API"
          )}
        </button>
      </div>
      <div className="w-full bg-linear-to-r from-slate-600 via-slate-700 to-slate-800 px-8 py-6">
        <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Terminal Node
              </h1>
            </div>
          </div>
          <input type="text" />
          <input type="text" />
          <button
            onClick={handleTerminalNode}
            disabled={!isToken}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-black/10 active:scale-[0.97] flex items-center gap-2 ${isToken ? "bg-white hover:bg-gray-50 text-slate-700 cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
          >
            <RefreshCcw className="w-5 h-5 shrink-0 active:animate-spin" />
            Fetch Data
          </button>
        </div>
      </div>
      <div className="w-full p-5">
        <TerminalTable
          data={terminalNodeData}
          consumptionData={consumptionGroupData}
        />
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
