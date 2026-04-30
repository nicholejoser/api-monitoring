"use client";

import { DailyConsumption } from "./Types";
import Consumption from "./Consumption";

interface UsageChartProps {
  data: DailyConsumption[];
}

export default function UsageChart({ data }: UsageChartProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
     <Consumption data={data}/>
    </div>
  );
}
