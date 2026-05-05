"use client";

import { DailyConsumption, TerminalNode } from "./Types";
import Consumption from "./Consumption";

interface UsageChartProps {
  data: DailyConsumption[];
  terminalNodeData: TerminalNode[];
  title: string;
}

export default function UsageChart({
  data,
  terminalNodeData,
  title,
}: UsageChartProps) {
  if (!data?.length) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500 text-sm">No consumption data available.</p>
      </div>
    );
  }

  const clientData = terminalNodeData.find(
    (a) => a.id === data[0].terminalNodeId,
  );

  const totalUpload = data.reduce((sum, d) => sum + Number(d.up ?? 0), 0);

  const totalDownload = data.reduce((sum, d) => sum + Number(d.down ?? 0), 0);

  const formatGB = (bytes: number) =>
    (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB";

  return (
    <div className="relative bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden font-lexend">
      {/* Gradient Accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-indigo-500 via-violet-500 to-purple-500" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          <h2 className="text-lg font-bold text-gray-800">
            {clientData?.name ?? "Unknown Client"}
          </h2>
        </div>

        <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
          Highest Usage
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-indigo-50 rounded-xl p-4">
          <p className="text-xs text-indigo-500 font-medium uppercase">
            Total Upload
          </p>
          <p className="text-lg font-bold text-indigo-700 mt-1">
            {formatGB(totalUpload)}
          </p>
        </div>

        <div className="bg-emerald-50 rounded-xl p-4">
          <p className="text-xs text-emerald-500 font-medium uppercase">
            Total Download
          </p>
          <p className="text-lg font-bold text-emerald-700 mt-1">
            {formatGB(totalDownload)}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="h-100 bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <Consumption data={data} />
      </div>
    </div>
  );
}
