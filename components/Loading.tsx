import { Loader2 } from "lucide-react";
import React from "react";

export default function Loading() {
  return (
    <div className="absolute inset-0 bg-black/30 z-50 flex items-center justify-center backdrop-blur-sm font-lexend">
      <div className="flex flex-col items-center gap-3 text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">Loading data...</p>
      </div>
    </div>
  );
}
