"use client";
import { useState, FormEvent, useMemo } from "react";
import * as XLSX from "xlsx";
import { DatePickerInput } from "../../../components/DatePickerInput";
import { getEndOfMonth, getStartOfMonth } from "../../../lib/utils";
import { RefreshCcw } from "lucide-react";

import {
  BandwidthData,
  ConsumptionItem,
  ConsumptionLog,
  DailyConsumption,
} from "../../../components/Types";
import TerminalTable from "@/components/tables/TerminalTable";
import Loading from "@/components/Loading";
import MetricsCard from "@/components/MetricsCard";
import { useData } from "@/context/DataContext";
import UsageChart from "@/components/UsageCharts";
export default function Dashboard() {
  const { terminalNodeData, consumptionGroupData, isLoading, setIsLoading } =
    useData();
  const [usage, setUsage] = useState<ConsumptionLog>({
    cityId: "",
    cityName: "",
    contact: "",
    createdAt: "",
    createdById: "",
    createdByName: "",
    deletedAt: "",
    email: "",
    id: "",
    identity: "",
    name: "",
    note: "",
    outerIdentity: "",
    password: "",
    phone: "",
    serviceAreaId: "",
    street: "",
  });
  const [bandwidthData, setBandwidthData] = useState<BandwidthData[]>([]);

  const [consumptionData, setConsumptionData] = useState<DailyConsumption[]>(
    [],
  );
  // Terminal Node All
  const [startDate, setStartDate] = useState<Date | undefined>(
    getStartOfMonth(),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(getEndOfMonth());
  const [isToken, setIsToken] = useState<string>("");
  const [nodeInput, setNodeInput] = useState<string>("89833");
  const [activeNodeId, setActiveNodeId] = useState<string>("89833");
  async function fetchUsage(id: string) {
    setIsLoading(true);
    try {
      // 3. CRITICAL FIX: We must use the proxy here to avoid the CORS error!
      // Your proxy route will handle hitting the 110.93.79.226 IP securely.
      const res = await fetch(`/api/proxy?id=${id}&token=${isToken}`);

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();
      // Safety check: Ensure the data is an array before setting it
      setUsage(data);
      setActiveNodeId(id);
    } catch (err: unknown) {
      console.error("Fetch error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert(`Could not fetch data: ${errorMessage}`);
      setUsage({
        cityId: "",
        cityName: "",
        contact: "",
        createdAt: "",
        createdById: "",
        createdByName: "",
        deletedAt: "",
        email: "",
        id: "",
        identity: "",
        name: "",
        note: "",
        outerIdentity: "",
        password: "",
        phone: "",
        serviceAreaId: "",
        street: "",
      });
    } finally {
      setIsLoading(false);
    }
  }
  const handleExport = () => {
    const dataToExport = Array.isArray(usage) ? usage : [usage];
    const formattedData = dataToExport.map((row) => ({
      "Node ID": row.id,
      "Outer Identity": row.outerIdentity,
      "Client Name": row.name,
      Street: row.street,
      City: row.cityName,
      Phone: row.phone?.trim() ? row.phone : "N/A",
      Email: row.email?.trim() ? row.email : "N/A",
      "Registration Date": row.createdAt
        ? new Date(row.createdAt).toLocaleDateString()
        : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Node_Data");

    XLSX.writeFile(workbook, `Node_Export_${new Date().getTime()}.xlsx`);
  };
  const handleExportConsumption = (data: ConsumptionItem[]) => {
    const formatted = data.map((item) => ({
      Date: item.consumptionDay,
      Upload: Number(item.up),
      Download: Number(item.down),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formatted);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Consumption");

    XLSX.writeFile(
      workbook,
      `Consumption-${startDate?.toLocaleDateString("en-CA")}-${endDate?.toLocaleDateString("en-CA")}.xlsx`,
    );
  };
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nodeInput.trim()) {
      fetchUsage(nodeInput.trim());
    }
  };
  const handleBandwidth = async () => {
    try {
      const res = await fetch(
        `/api/bandwidth?id=${nodeInput.trim()}&token=${isToken}`,
      );

      const data = await res.json();
      setBandwidthData(data);
    } catch (err) {
      console.error("Request failed:", err);
    }
  };
  const handleConsumption = async () => {
    try {
      const res = await fetch(
        `/api/consumption?id=${nodeInput.trim()}&token=${isToken}&type=single&start=${startDate?.toLocaleDateString("en-CA")}&end=${endDate?.toLocaleDateString("en-CA")}`,
      );

      const data = await res.json();
      setConsumptionData(data);
    } catch (err) {
      console.error("Request failed:", err);
    }
  };

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
const topClient = useMemo(() => {
  if (!consumptionGroupData.length) return null;

  return [...consumptionGroupData]
    .map((client) => {
      const totalUsage = client.data.reduce((sum, day) => {
        return (
          sum +
          Number(day.up ?? 0) +
          Number(day.down ?? 0)
        );
      }, 0);

      return { ...client, totalUsage };
    })
    .sort((a, b) => b.totalUsage - a.totalUsage)[0];
}, [consumptionGroupData]);
  return (
    // bg-gradient-to-br from-slate-100 via-gray-100 to-slate-100
   <>
  {isLoading && <Loading />}

  {/* Metrics */}
  <MetricsCard />

  {/* Dashboard Content */}
  <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

    {/* LEFT SIDE - Main Content */}
    <div className="xl:col-span-3 space-y-6">

      {/* Header Panel */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 overflow-hidden">
<UsageChart data={topClient?.data ?? []} />
        {/* Top Bar */}
        <div className="bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Terminal Node
                </h1>
                <p className="text-slate-300 text-sm">
                  Manage and analyze terminal nodes
                </p>
              </div>
            </div>

            {/* Search Section */}
            <div className="flex gap-3 w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search node..."
                className="px-4 py-2 rounded-xl bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 w-full lg:w-60"
              />

              <button
                onClick={handleTerminalNode}
                disabled={!isToken}
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center gap-2
                  ${isToken
                    ? "bg-white hover:bg-gray-50 text-slate-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                <RefreshCcw className="w-4 h-4" />
                Fetch Data
              </button>
            </div>

          </div>
        </div>

        {/* Table Section */}
        <div className="p-6 space-y-6">

          <TerminalTable
            data={terminalNodeData}
            consumptionData={consumptionGroupData}
          />

          {/* Date + Fetch Section */}
          <div className="flex flex-wrap items-center gap-4">

            <DatePickerInput date={startDate} setDate={setStartDate} />
            <DatePickerInput date={endDate} setDate={setEndDate} />

            <button
              onClick={handleConsMultiple}
              disabled={isLoading || !isToken}
              className="bg-slate-600 hover:bg-slate-800 text-white font-semibold py-2 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
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
    </div>

    {/* RIGHT SIDE - Analytics Panel */}
    <div className="space-y-6">

      {/* Quick Stats Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Node Summary
        </h3>

        <div className="mt-4 space-y-4">
          <div className="flex justify-between text-sm">
            <span>Total Nodes</span>
            <span className="font-bold">{terminalNodeData.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Consumption Records</span>
            <span className="font-bold">{consumptionGroupData.length}</span>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Recent Activity
        </h3>

        <ul className="space-y-3 text-sm">
          <li className="flex justify-between">
            <span>Data synced</span>
            <span className="text-gray-400 text-xs">2 min ago</span>
          </li>
          <li className="flex justify-between">
            <span>Node updated</span>
            <span className="text-gray-400 text-xs">10 min ago</span>
          </li>
          <li className="flex justify-between">
            <span>Consumption fetched</span>
            <span className="text-gray-400 text-xs">1 hour ago</span>
          </li>
        </ul>
      </div>

    </div>
  </div>
</>
  );
}
