"use client";

import { Server, Database, Clock } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { DailyConsumption } from "./Types";

export default function MetricsCard({
  terminalNodeNum,
  consumptionNum,
  data,
}: {
  terminalNodeNum: number;
  consumptionNum: number;
  data: DailyConsumption[];
}) {
  const cardBase =
    "relative overflow-hidden group rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-white";

  const iconBase =
    "w-11 h-11 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-lexend">
      {/* ================= TOTAL NODES ================= */}
      <div
        className={`${cardBase} bg-linear-to-br from-indigo-500 to-violet-600`}
      >
        <div className="flex items-center justify-between mb-5">
          <div className={iconBase}>
            <Server className="w-5 h-5 text-white" />
          </div>
        </div>

        <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
          Total Nodes
        </span>

        <p className="text-3xl font-bold mt-2">
          {formatNumber(terminalNodeNum)}
        </p>
        <p className="pt-3 text-slate-200">
          {new Date(data[0]?.consumptionDay).toLocaleDateString("en-CA", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* ================= CONSUMPTION ================= */}
      <div
        className={`${cardBase} bg-linear-to-br from-emerald-500 to-teal-600`}
      >
        <div className="flex items-center justify-between mb-5">
          <div className={iconBase}>
            <Database className="w-5 h-5 text-white" />
          </div>
        </div>

        <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
          Consumption Records
        </span>

        <p className="text-3xl font-bold mt-2">
          {formatNumber(consumptionNum)}
        </p>
        <p className="pt-3 text-slate-200">
          {new Date(data[0]?.consumptionDay).toLocaleDateString("en-CA", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* ================= LAST UPDATED ================= */}
      <div
        className={`${cardBase} bg-linear-to-br from-amber-400 to-orange-500`}
      >
        <div className="flex items-center justify-between mb-5">
          <div className={iconBase}>
            <Clock className="w-5 h-5 text-white" />
          </div>
        </div>

        <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
          Last Updated
        </span>

        <p className="text-3xl font-semibold mt-2">
          {new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
