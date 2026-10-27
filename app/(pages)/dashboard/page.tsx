"use client";
import { useState, useMemo } from "react";
import {
  getEndOfLastMonth,
  getStartOfLastMonth,
  isWithinDateRange,
  percentile,
} from "../../../lib/utils";

import { DailyConsumption } from "../../../components/Types";
import Loading from "@/components/Loading";
import MetricsCard from "@/components/MetricsCard";
import { useData } from "@/context/DataContext";
import UsageChart from "@/components/UsageCharts";
import TerminalTableDashboard from "@/components/tables/TerminalTableDashboard";
export default function Dashboard() {
  const { terminalNodeData, consumptionGroupData, isLoading } = useData();

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

      const filteredConsumption = clientConsumption.filter((row) =>
        isWithinDateRange(row.consumptionDay, startDate, endDate),
      );

      // per-day values (important change)
      const upValues = filteredConsumption.map((row) => Number(row.up));
      const downValues = filteredConsumption.map((row) => Number(row.down));

      const totalUp = upValues.reduce((sum, v) => sum + v, 0);
      const totalDown = downValues.reduce((sum, v) => sum + v, 0);

      // NEW: per-client percentile (this is the key change)
      const upload95 = percentile(upValues, 95);
      const download95 = percentile(downValues, 95);

      return {
        ...item,
        totalUp,
        totalDown,
        upload95,
        download95,
      };
    });
  }, [terminalNodeData, consumptionMap, startDate, endDate]);

  const analytics = useMemo(() => {
    if (!enrichedData.length) {
      return {
        topUpload: [],
        topDownload: [],
        zeroBytesUpload: [],
        zeroBytesDownload: [],
        upload95: 0,
        download95: 0,
      };
    }

    const topUpload = [...enrichedData]
      .sort((a, b) => b.totalUp - a.totalUp)
      .slice(0, 1000);

    const topDownload = [...enrichedData]
      .sort((a, b) => b.totalDown - a.totalDown)
      .slice(0, 1000);

    const upload95 =
      enrichedData.reduce((sum, d) => sum + d.upload95, 0) /
      enrichedData.length;

    const download95 =
      enrichedData.reduce((sum, d) => sum + d.download95, 0) /
      enrichedData.length;

    const zeroBytesUpload = enrichedData.filter((d) => d.totalUp === 0);

    const zeroBytesDownload = enrichedData.filter((d) => d.totalDown === 0);

    return {
      topUpload,
      topDownload,
      upload95,
      download95,
      zeroBytesUpload,
      zeroBytesDownload,
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
