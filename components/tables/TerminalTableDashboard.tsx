"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import TerminalTable from "./TerminalTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Download, Upload } from "lucide-react";
import { AnalyticsProps } from "../Types";
import { formatBytes } from "@/lib/utils";
import TerminalNodesList from "../TerminalNodesList";
import TerminalPercentileTable from "./TerminalPercentileTable";
import { useDataStore } from "@/store/data-store";

export default function TerminalTableDashboard({
  analytics,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: {
  analytics: AnalyticsProps;
  startDate: Date | undefined;
  setStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  endDate: Date | undefined;
  setEndDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}) {
  const { fetchSyncs, syncs, consumptions, terminalNodes } = useDataStore();

  const [tabType, setTabType] = useState<string>("all");
  const [selected, setSelected] = useState<number | null>(null);
  const selectedDate = useMemo(() => {
    if (!consumptions.length) return null;

    const firstClient = consumptions[0];
    if (!firstClient?.data?.length) return null;
    return firstClient.data[0].consumptionDay; // "2026-04-02"
  }, [consumptions]);
  const hasFetchedRef = useRef<boolean>(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchSyncs();
  }, [fetchSyncs]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">
          Terminal Overview
        </h2>
        <p className="text-sm text-gray-500">
          Data Date: {selectedDate ?? "N/A"}
        </p>
      </div>
      <div className="w-full space-y-6 font-lexend rounded-2xl p-6">
        {/* Tabs */}
        <Tabs
          value={tabType}
          onValueChange={(val) => setTabType(val)}
          className="flex flex-col"
        >
          <div className="flex flex-row items-center gap-3">
            <TerminalNodesList
              syncs={syncs}
              selected={selected}
              setSelected={setSelected}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
            <TabsList className="bg-gray-100 h-11! p-1 rounded-xl shadow-sm flex gap-1 w-fit">
              <TabsTrigger
                value="all"
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${tabType === "all" ? "bg-[#0ea5e9]! shadow-sm text-white!" : "hover:bg-gray-200 text-gray-600"} cursor-pointer`}
              >
                <BarChart3 className="w-4 h-4" />
                All
              </TabsTrigger>
              <TabsTrigger
                value="Top 1k Upload"
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-gray-600 transition-all ${tabType === "Top 1k Upload" ? "bg-[#0ea5e9]! shadow-sm text-white!" : "hover:bg-gray-200 text-gray-600"} cursor-pointer`}
              >
                <Upload className="w-4 h-4" />
                Top 1k UL
              </TabsTrigger>

              <TabsTrigger
                value="Top 1k Download"
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-gray-600 transition-all ${tabType === "Top 1k Download" ? "bg-[#0ea5e9]! shadow-sm text-white!" : "hover:bg-gray-200 text-gray-600"} cursor-pointer`}
              >
                <Download className="w-4 h-4" />
                Top 1k DL
              </TabsTrigger>

              <TabsTrigger
                value="95th Percentile"
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-gray-600 transition-all ${tabType === "95th Percentile" ? "bg-[#0ea5e9]! shadow-sm text-white!" : "hover:bg-gray-200 text-gray-600"} cursor-pointer`}
              >
                <BarChart3 className="w-4 h-4" />
                95th Percentile
              </TabsTrigger>
              <TabsTrigger
                value="0B Upload"
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-gray-600 transition-all ${tabType === "0B Upload" ? "bg-[#0ea5e9]! shadow-sm text-white!" : "hover:bg-gray-200 text-gray-600"} cursor-pointer`}
              >
                <Upload className="w-4 h-4" />
                0B UL
              </TabsTrigger>
              <TabsTrigger
                value="0B Download"
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-gray-600 transition-all ${tabType === "0B Download" ? "bg-[#0ea5e9]! shadow-sm text-white!" : "hover:bg-gray-200 text-gray-600"} cursor-pointer`}
              >
                <Download className="w-4 h-4" />
                0B DL
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="Top 1k Upload">
            <TerminalTable
              terminalNodedata={analytics.topUpload}
              consumptionData={consumptions}
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              tabType={tabType}
            />
          </TabsContent>
          <TabsContent value="Top 1k Download">
            <TerminalTable
              terminalNodedata={analytics.topDownload}
              consumptionData={consumptions}
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              tabType={tabType}
            />
          </TabsContent>
          <TabsContent value="95th Percentile">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-6">
                95th Percentile Analysis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload 95th */}
                <div className="bg-indigo-50 p-5 rounded-xl">
                  <p className="text-xs uppercase text-indigo-500 font-semibold">
                    Upload (95th Percentile)
                  </p>
                  <p className="text-2xl font-bold text-indigo-700 mt-2">
                    {formatBytes(analytics.upload95)}
                  </p>
                </div>

                {/* Download 95th */}
                <div className="bg-emerald-50 p-5 rounded-xl">
                  <p className="text-xs uppercase text-emerald-500 font-semibold">
                    Download (95th Percentile)
                  </p>
                  <p className="text-2xl font-bold text-emerald-700 mt-2">
                    {formatBytes(analytics.download95)}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-6">
                95th percentile represents the value below which 95% of traffic
                falls. It is commonly used in bandwidth billing and performance
                monitoring.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="all">
            <TerminalPercentileTable
              terminalNodedata={terminalNodes}
              consumptionData={consumptions}
              selectedDate={selectedDate}
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              tabType={tabType}
            />
          </TabsContent>
          <TabsContent value="0B Upload">
            <TerminalTable
              terminalNodedata={analytics.zeroBytesUpload}
              consumptionData={consumptions}
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              tabType={tabType}
            />
          </TabsContent>
          <TabsContent value="0B Download">
            <TerminalTable
              terminalNodedata={analytics.zeroBytesDownload}
              consumptionData={consumptions}
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              tabType={tabType}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
