"use client";
import {
  BandwidthData,
  ConsumptionItem,
  ConsumptionLog,
  DailyConsumption,
} from "@/components/Types";
import { getEndOfMonth, getStartOfMonth } from "@/lib/utils";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import React, { FormEvent, useState } from "react";
import { DatePickerInput } from "@/components/DatePickerInput";
import Consumption from "@/components/Consumption";
import BandwidthChart from "@/components/BandwidthChart";
import { useData } from "@/context/DataContext";

export default function TerminalNodesSearch() {
  const { fvKill } = useData();
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
  const [loading, setLoading] = useState(false);
  const [nodeInput, setNodeInput] = useState("89833");
  const [activeNodeId, setActiveNodeId] = useState("89833");
  const [startDate, setStartDate] = useState<Date | undefined>(
    getStartOfMonth(),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(getEndOfMonth());
  async function fetchUsage(id: string) {
    setLoading(true);
    try {
      // 3. CRITICAL FIX: We must use the proxy here to avoid the CORS error!
      // Your proxy route will handle hitting the 110.93.79.226 IP securely.
      const res = await fetch(`/api/proxy?id=${id}&token=${fvKill}`);

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
      setLoading(false);
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
        `/api/bandwidth?id=${nodeInput.trim()}&token=${fvKill}`,
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
        `/api/consumption?id=${nodeInput.trim()}&token=${fvKill}&type=single&start=${startDate?.toLocaleDateString("en-CA")}&end=${endDate?.toLocaleDateString("en-CA")}`,
      );

      const data = await res.json();
      setConsumptionData(data);
    } catch (err) {
      console.error("Request failed:", err);
    }
  };

  return (
    <div className="w-full min-h-screen font-lexend text-gray-900 antialiased">
      {/* Ambient background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-slate-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-10">
        <div className="max-w-8xl mx-auto space-y-8">
          {/* TOP BAR / HEADER */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-gray-200/50 border border-white/60 overflow-hidden">
            <div className="bg-linear-to-r from-slate-600 via-slate-700 to-slate-800 px-8 py-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
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
                      Terminal Monitoring
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/15 text-slate-100 backdrop-blur-sm border border-white/10">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        Active
                      </span>
                      <span className="text-sm text-slate-200">
                        Node:{" "}
                        <span className="font-mono font-bold text-white">
                          {activeNodeId}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex gap-3">
                  <div className="relative">
                    <svg
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Enter Terminal Node ID..."
                      value={nodeInput}
                      onChange={(e) => setNodeInput(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-white/95 border-0 rounded-xl focus:ring-2 focus:ring-white/50 outline-none w-full md:w-72 transition-all text-sm font-lexend text-gray-800 placeholder:text-gray-400 shadow-lg shadow-black/5"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!fvKill}
                    className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-black/10 active:scale-[0.97] flex items-center gap-2 ${fvKill ? "bg-white hover:bg-gray-50 text-slate-700 cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Update
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* DATA TABLE */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-gray-200/50 border border-white/60 overflow-hidden">
            {/* Table Header */}
            <div className="px-8 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-linear-to-br from-slate-400 to-slate-500 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200/50">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">
                    Node Profile Details
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Complete terminal registration information
                  </p>
                </div>
              </div>
              <div className="flex flex-row items-center gap-3">
                <button
                  onClick={handleExport}
                  disabled={
                    !usage ||
                    (Array.isArray(usage) && usage.length === 0) ||
                    !usage.id
                  }
                  className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-200/50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.97]"
                >
                  <Download className="w-5 h-5 shrink-0" />
                  Export to Excel
                </button>
                <button
                  onClick={handleBandwidth}
                  disabled={
                    !usage ||
                    (Array.isArray(usage) && usage.length === 0) ||
                    !usage.id
                  }
                  className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-slate-500  text-white font-lexend hover:bg-slate-700 cursor-pointer active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  Bandwidth
                </button>
                <button
                  onClick={handleConsumption}
                  disabled={
                    !usage ||
                    (Array.isArray(usage) && usage.length === 0) ||
                    !usage.id
                  }
                  className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-slate-500  text-white font-lexend hover:bg-slate-700 cursor-pointer active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  Consumption
                </button>
              </div>
            </div>

            {/* Table Body */}
            {loading ? (
              <div className="p-16 text-center">
                <div className="inline-flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-slate-100 rounded-full" />
                    <div className="absolute inset-0 w-12 h-12 border-4 border-slate-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">
                      Querying terminal node...
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Please wait while we fetch the data
                    </p>
                  </div>
                </div>
              </div>
            ) : usage?.id ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                            />
                          </svg>
                          Node ID
                        </div>
                      </th>
                      <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Client Name
                        </div>
                      </th>
                      <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Location
                        </div>
                      </th>
                      <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          Contact
                        </div>
                      </th>
                      <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Registered On
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="group hover:bg-linear-to-r hover:from-slate-50/50 hover:to-indigo-50/30 transition-all duration-200">
                      {/* Node IDs */}
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5">
                          <span className="inline-flex items-center gap-1.5 font-mono text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg w-fit">
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                            {usage.id}
                          </span>
                          {usage.outerIdentity && (
                            <span className="text-xs text-gray-400 font-mono pl-1">
                              ↳ Outer: {usage.outerIdentity}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Client Name */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-linear-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shadow-slate-200/50">
                            {usage.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="font-bold text-gray-800">
                            {usage.name}
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-8 py-5">
                        <div className="flex items-start gap-2">
                          <svg
                            className="w-4 h-4 text-gray-300 mt-0.5 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                          </svg>
                          <div>
                            <span className="block text-sm font-medium text-gray-700">
                              {usage.street}
                            </span>
                            <span className="text-xs text-gray-400">
                              {usage.cityName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-8 py-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-3.5 h-3.5 text-gray-300 shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <span className="text-sm text-gray-600">
                              {usage.phone?.trim() ? (
                                usage.phone
                              ) : (
                                <span className="text-gray-300 italic">
                                  No Phone
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-3.5 h-3.5 text-gray-300 shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-sm text-gray-600">
                              {usage.email?.trim() ? (
                                usage.email
                              ) : (
                                <span className="text-gray-300 italic">
                                  No Email
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Registration Date */}
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-slate-50 px-3 py-1 rounded-lg w-fit">
                            <svg
                              className="w-3.5 h-3.5 text-slate-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {usage.createdAt
                              ? new Date(usage.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )
                              : "N/A"}
                          </span>
                          <span className="text-xs text-gray-400 pl-1">
                            by{" "}
                            <span className="font-medium text-gray-500">
                              {usage.createdByName}
                            </span>
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 text-center">
                <div className="inline-flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 font-semibold">
                      No profile records found
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Enter a valid Node ID above to fetch terminal data
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-20">
            {bandwidthData.length > 0 && (
              <div className="flex flex-col items-start gap-5 p-5">
                <button
                  onClick={handleBandwidth}
                  disabled={
                    !usage ||
                    (Array.isArray(usage) && usage.length === 0) ||
                    !usage.id
                  }
                  className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-slate-500  text-white font-lexend hover:bg-slate-700 cursor-pointer active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  Refresh
                </button>
                <BandwidthChart data={bandwidthData} />
              </div>
            )}
            {consumptionData.length > 0 ? (
              <div className="flex flex-col items-start gap-5 p-5">
                <div className="flex flex-row items-center justify-between w-full">
                  <div className="flex flex-row gap-5 ">
                    <button
                      onClick={handleConsumption}
                      disabled={
                        !usage ||
                        (Array.isArray(usage) && usage.length === 0) ||
                        !usage.id
                      }
                      className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-slate-500  text-white font-lexend hover:bg-slate-700 cursor-pointer active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      Refresh
                    </button>
                    <div className="flex flex-row items-center gap-3">
                      <DatePickerInput
                        date={startDate}
                        setDate={setStartDate}
                      />
                      <DatePickerInput date={endDate} setDate={setEndDate} />
                    </div>
                  </div>
                  <button
                    onClick={() => handleExportConsumption(consumptionData)}
                    disabled={
                      !usage ||
                      (Array.isArray(usage) && usage.length === 0) ||
                      !usage.id
                    }
                    className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-2.5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-200/50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.97]"
                  >
                    <Download className="w-5 h-5 shrink-0" />
                  </button>
                </div>
                <div className="w-full h-100">
                  <Consumption data={consumptionData} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-5 p-5">
                <div className="flex flex-row gap-5 ">
                  <button
                    onClick={handleConsumption}
                    disabled={
                      !usage ||
                      (Array.isArray(usage) && usage.length === 0) ||
                      !usage.id
                    }
                    className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-slate-500  text-white font-lexend hover:bg-slate-700 cursor-pointer active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    Refresh
                  </button>
                  <div className="flex flex-row items-center gap-3">
                    <DatePickerInput date={startDate} setDate={setStartDate} />
                    <DatePickerInput date={endDate} setDate={setEndDate} />
                  </div>
                </div>
                <Consumption data={consumptionData} />
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="text-center py-4">
            <p className="text-xs text-gray-400">
              Terminal Monitoring System • Data refreshed in real-time • All
              connections encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
