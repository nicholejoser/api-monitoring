"use client";

import { useEffect, useState, FormEvent } from "react";
import * as XLSX from "xlsx";

// 1. Defined Interface (No 'any' allowed!)
interface ConsumptionLog {
  cityId: string;
  cityName: string;
  contact: string;
  createdAt: string;
  createdById: string;
  createdByName: string;
  deletedAt: string;
  email: string;
  id: string;
  identity: string;
  name: string;
  note: string;
  outerIdentity: string;
  password: string;
  phone: string;
  serviceAreaId: string;
  street: string;
}

export default function Dashboard() {
  // 2. State strictly typed to an array of ConsumptionLog
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
  const [loading, setLoading] = useState(false);
  const [nodeInput, setNodeInput] = useState("89833");
  const [activeNodeId, setActiveNodeId] = useState("89833");

  async function fetchUsage(id: string) {
    setLoading(true);
    try {
      // 3. CRITICAL FIX: We must use the proxy here to avoid the CORS error!
      // Your proxy route will handle hitting the 110.93.79.226 IP securely.
      const res = await fetch(`/api/proxy?id=${id}&token=${isToken}`,);

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
    // 1. Prepare your data. If 'usage' is just one object, put it in an array.
    // If it's already an array of multiple logs, just use it directly.
    const dataToExport = Array.isArray(usage) ? usage : [usage];

    // Optional: Map over the data to format the headers nicely for Excel
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

    // 2. Create a new workbook and a worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();

    // 3. Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Node_Data");

    // 4. Trigger the download!
    XLSX.writeFile(workbook, `Node_Export_${new Date().getTime()}.xlsx`);
  };

  const [isLoading, setIsLoading] = useState(false);
 const [isToken, setIsToken] = useState("");
  const handleLogin = async () => {
    setIsLoading(true); // Start loading spinner

    try {
      const response = await fetch("/api/proxy", {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        // console.log("✅ Logged in successfully!", result);
        setIsToken(result.token.id)
      } else {
        console.error("❌ Login failed:", result);
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setIsLoading(false); // Stop loading spinner regardless of success or failure
    }
  };
  // useEffect(() => {
  //   fetchUsage("89833");
  // }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nodeInput.trim()) {
      fetchUsage(nodeInput.trim());
    }
  };

return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-gray-50 to-blue-50 font-sans text-gray-900 antialiased">
      {/* Ambient background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* TOP BAR / HEADER */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-gray-200/50 border border-white/60 overflow-hidden">
            <div className="bg-linear-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-6">
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
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/15 text-blue-100 backdrop-blur-sm border border-white/10">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        Active
                      </span>
                      <span className="text-sm text-blue-200">
                        Node:{" "}
                        <span className="font-mono font-bold text-white">
                          {activeNodeId}
                        </span>
                      </span>
                    </div>
                    <button
                      onClick={handleLogin}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-35 gap-2 shadow-sm"
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
                      className="pl-10 pr-4 py-2.5 bg-white/95 border-0 rounded-xl focus:ring-2 focus:ring-white/50 outline-none w-full md:w-72 transition-all text-sm text-gray-800 placeholder:text-gray-400 shadow-lg shadow-black/5"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-white hover:bg-gray-50 text-blue-700 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-black/10 active:scale-[0.97] flex items-center gap-2"
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

          {/* METRICS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="group bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm shadow-gray-200/50 border border-white/60 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                  Live
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Total Logs
              </span>
              <p className="text-3xl font-black mt-1 bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {usage?.id ? "1" : "0"}
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm shadow-gray-200/50 border border-white/60 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Network Source
              </span>
              <p className="text-lg font-bold mt-1 text-gray-700">
                Secure Proxy
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm shadow-gray-200/50 border border-white/60 hover:shadow-lg hover:shadow-violet-100/50 transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                  <svg
                    className="w-5 h-5 text-violet-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Security Status
              </span>
              <p className="text-lg font-bold mt-1 text-emerald-600">
                Verified
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm shadow-gray-200/50 border border-white/60 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <svg
                    className="w-5 h-5 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Last Updated
              </span>
              <p className="text-lg font-bold mt-1 text-gray-700">
                {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* DATA TABLE */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-gray-200/50 border border-white/60 overflow-hidden">
            {/* Table Header */}
            <div className="px-8 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
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

              <button
                onClick={handleExport}
                disabled={
                  !usage ||
                  (Array.isArray(usage) && usage.length === 0) ||
                  !usage.id
                }
                className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-200/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.97]"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export to Excel
              </button>
            </div>

            {/* Table Body */}
            {loading ? (
              <div className="p-16 text-center">
                <div className="inline-flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-100 rounded-full" />
                    <div className="absolute inset-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
                    <tr className="group hover:bg-linear-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-200">
                      {/* Node IDs */}
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5">
                          <span className="inline-flex items-center gap-1.5 font-mono text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg w-fit">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
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
                          <div className="w-9 h-9 bg-linear-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-200/50">
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
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-blue-50 px-3 py-1 rounded-lg w-fit">
                            <svg
                              className="w-3.5 h-3.5 text-blue-500"
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
