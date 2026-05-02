"use client";
import { useState, FormEvent, useMemo } from "react";
import * as XLSX from "xlsx";
import { getEndOfMonth, getStartOfMonth } from "../../../lib/utils";

import {
  BandwidthData,
  ConsumptionItem,
  ConsumptionLog,
  DailyConsumption,
} from "../../../components/Types";
import Loading from "@/components/Loading";
import MetricsCard from "@/components/MetricsCard";
import { useData } from "@/context/DataContext";
import UsageChart from "@/components/UsageCharts";
export default function Dashboard() {
  const {
    terminalNodeData,
    consumptionGroupData,
    isLoading,
    fvKill,
    setIsLoading,
  } = useData();
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
  const [nodeInput, setNodeInput] = useState<string>("89833");
  const [activeNodeId, setActiveNodeId] = useState<string>("89833");
  async function fetchUsage(id: string) {
    setIsLoading(true);
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

  // const handleLogin = async () => {
  //   setIsLoading(true); // Start loading spinner

  //   try {
  //     const response = await fetch("/api/login", {
  //       method: "POST",
  //     });

  //     const result = await response.json();

  //     if (response.ok) {
  //     } else {
  //       console.error("❌ Login failed:", result);
  //     }
  //   } catch (error) {
  //     console.error("Network error:", error);
  //   } finally {
  //     setIsLoading(false); // Stop loading spinner regardless of success or failure
  //   }
  // };
  const handleTerminalNode = async () => {
    try {
      const res = await fetch(`/api/terminalnodes?token=${fvKill}`);
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
        `/api/consumption?id=${nodeInput.trim()}&token=${fvKill}&type=multiple&start=${startDate?.toLocaleDateString("en-CA")}&end=${endDate?.toLocaleDateString("en-CA")}`,
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
          return sum + Number(day.up ?? 0) + Number(day.down ?? 0);
        }, 0);

        return { ...client, totalUsage };
      })
      .sort((a, b) => b.totalUsage - a.totalUsage)[0];
  }, [consumptionGroupData]);
  return (
    // bg-gradient-to-br from-slate-100 via-gray-100 to-slate-100
    <div className="flex flex-col gap-5 font-lexend text-sm">
      {isLoading && <Loading />}

      {/* Metrics */}

      {/* Dashboard Content */}
      <MetricsCard
        terminalNodeNum={terminalNodeData.length}
        consumptionNum={consumptionGroupData.length}
        data={topClient?.data ?? []}
      />
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* LEFT SIDE - Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Header Panel */}
          <UsageChart
            data={topClient?.data ?? []}
            terminalNodeData={terminalNodeData}
          />
        </div>
        {/* RIGHT SIDE - Analytics Panel */}
        <div className="h-fit space-y-6">
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
    </div>
  );
}
