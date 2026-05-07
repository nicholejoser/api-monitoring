"use client";

import { Server, Database } from "lucide-react";
import { formatBytes, formatNumber } from "@/lib/utils";
import { AnalyticsProps, DailyConsumption } from "./Types";

export default function MetricsCard({
  terminalNodeNum,
  consumptionNum,
  data,
  analytics,
}: {
  terminalNodeNum: number;
  consumptionNum: number;
  data: DailyConsumption[];
  analytics: AnalyticsProps;
}) {
  const periodLabel = data?.[0]?.consumptionDay
    ? new Date(data[0].consumptionDay).toLocaleDateString("en-CA", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const cardBase =
    "w-full overflow-hidden group rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-white";

  const iconBase =
    "w-11 h-11 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110";

  return (
    <div className="flex flex-row items-center justify-between gap-6 font-lexend">
      {/* TOTAL NODES */}
      <div
        className={`${cardBase} bg-linear-to-br from-amber-400 to-orange-500 hover:shadow-amber-200/50`}
      >
        <div className="flex items-center justify-end">
          <div className={iconBase}>
            <Server className="w-5 h-5 text-white" />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">
            Total Nodes
          </p>
          <p className="text-3xl font-bold mt-2">
            {formatNumber(terminalNodeNum)}
          </p>
          <p className="pt-3 text-white/70 text-sm">{periodLabel}</p>
        </div>
      </div>

      {/* CONSUMPTION RECORDS */}
      <div
        className={`${cardBase} bg-linear-to-br from-emerald-500 to-teal-600 hover:shadow-emerald-200/50`}
      >
        <div className="flex items-center justify-end">
          <div className={iconBase}>
            <Database className="w-5 h-5 text-white" />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">
            Consumption Records
          </p>
          <p className="text-3xl font-bold mt-2">
            {formatNumber(consumptionNum)}
          </p>
          <p className="pt-3 text-white/70 text-sm">{periodLabel}</p>
        </div>
      </div>

      {/* <div className={`${cardBase} bg-linear-to-br from-indigo-500 to-violet-600`}>
        <div className="flex items-center justify-between">
          <div className={iconBase}>
            <Upload className="w-5 h-5 text-white" />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
            Upload (95th)
          </p>
          <p className="text-3xl font-bold mt-2">
            {formatBytes(analytics.upload95)}
          </p>
          <p className="pt-3 text-black text-sm">
            Network billing metric
          </p>
        </div>
      </div> */}

      {/* DOWNLOAD 95th */}
      <div
        className={`${cardBase} bg-linear-to-br from-indigo-500 to-violet-600 hover:shadow-indigo-200/50`}
      >
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
          95th Percentile Analysis
        </h3>

        <div className="flex flex-row gap-2">
          {/* Upload 95th */}
          <div className="w-full bg-indigo-50 p-5 rounded-xl">
            <p className="text-xs uppercase text-indigo-500 font-semibold">
              Upload (95th Percentile)
            </p>
            <p className="text-xl font-bold text-indigo-700 mt-2">
              {formatBytes(analytics.upload95)}
            </p>
          </div>

          {/* Download 95th */}
          <div className="w-full bg-emerald-50 p-5 rounded-xl">
            <p className="text-xs uppercase text-emerald-500 font-semibold">
              Download (95th Percentile)
            </p>
            <p className="text-xl font-bold text-emerald-700 mt-2">
              {formatBytes(analytics.download95)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
