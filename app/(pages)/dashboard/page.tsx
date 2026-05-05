"use client";
import { useState, useMemo } from "react";
import { getEndOfLastMonth, getStartOfLastMonth } from "../../../lib/utils";

import {
  DailyConsumption,
} from "../../../components/Types";
import Loading from "@/components/Loading";
import MetricsCard from "@/components/MetricsCard";
import { useData } from "@/context/DataContext";
import UsageChart from "@/components/UsageCharts";
import TerminalTableDashboard from "@/components/tables/TerminalTableDashboard";
export default function Dashboard() {
  const {
    terminalNodeData,
    consumptionGroupData,
    isLoading,
  } = useData();

  const [startDate, setStartDate] = useState<Date | undefined>(
    getStartOfLastMonth(),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(getEndOfLastMonth());
  const safeNumber = (val: string) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };
  const topClient = useMemo(() => {
    if (!consumptionGroupData.length) return null;

    return [...consumptionGroupData]
      .map((client) => {
        const totalUpload = client.data.reduce(
          (sum, day) => sum + safeNumber(day.up),
          0,
        );

        const totalDownload = client.data.reduce(
          (sum, day) => sum + safeNumber(day.down),
          0,
        );

        return {
          ...client,
          totalUpload,
          totalDownload,
          totalUsage: totalUpload + totalDownload,
        };
      })
      .sort((a, b) => b.totalUsage - a.totalUsage)[0];
  }, [consumptionGroupData]);

  const consumptionMap = useMemo(() => {
    const map: Record<number, DailyConsumption[]> = {};

    consumptionGroupData.forEach((item) => {
      map[Number(item.clientId)] = item.data;
    });

    return map;
  }, [consumptionGroupData]);
  // 🔍 Filtered data

  const enrichedData = useMemo(() => {
    return terminalNodeData.map((item) => {
      const clientConsumption = consumptionMap[item.clientId] || [];

      const filteredConsumption = clientConsumption.filter((row) => {
        if (!startDate && !endDate) return true;

        const rowDate = new Date(row.consumptionDay);

        if (startDate && rowDate < startDate) return false;
        if (endDate && rowDate > endDate) return false;

        return true;
      });

      const totalUp = filteredConsumption.reduce(
        (sum, row) => sum + Number(row.up),
        0,
      );

      const totalDown = filteredConsumption.reduce(
        (sum, row) => sum + Number(row.down),
        0,
      );

      return {
        ...item,
        totalUp,
        totalDown,
      };
    });
  }, [terminalNodeData, consumptionMap, startDate, endDate]);

  const analytics = useMemo(() => {
    if (!enrichedData.length) {
      return {
        topUpload: [],
        topDownload: [],
        upload95: 0,
        download95: 0,
      };
    }

    const topUpload = [...enrichedData]
      .sort((a, b) => b.totalUp - a.totalUp)
      .slice(0, 20000);

    const topDownload = [...enrichedData]
      .sort((a, b) => b.totalDown - a.totalDown)
      .slice(0, 20000);

    const percentile = (arr: number[], p: number) => {
      if (!arr.length) return 0;

      const sorted = [...arr].sort((a, b) => a - b);
      const index = Math.ceil((p / 100) * sorted.length) - 1;

      return sorted[index] ?? 0;
    };

    const upload95 = percentile(
      enrichedData.map((d) => d.totalUp),
      95,
    );

    const download95 = percentile(
      enrichedData.map((d) => d.totalDown),
      95,
    );

    return {
      topUpload,
      topDownload,
      upload95,
      download95,
    };
  }, [enrichedData]);

  return (
    <div className="flex flex-col gap-10 font-lexend text-sm">
      {isLoading && <Loading />}

      <div>
        <MetricsCard
          terminalNodeNum={terminalNodeData.length}
          consumptionNum={consumptionGroupData.length}
          data={topClient?.data ?? []}
          analytics={analytics}
        />
      </div>

      <div className="space-y-8">
        <div className="py-6">
          <UsageChart
            data={topClient?.data ?? []}
            terminalNodeData={terminalNodeData}
            title="Top Client Bandwidth Usage"
          />
        </div>
      </div>

      <div className="xpy-6">
        <TerminalTableDashboard
          analytics={analytics}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />
      </div>
    </div>
  );
}
