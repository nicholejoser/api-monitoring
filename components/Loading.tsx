"use client";

import { Loader2 } from "lucide-react";
import React from "react";

interface LoadingProps {
  title?: string;
  description?: string;
  progress?: number; // 0 - 100
}

export default function Loading({
  title = "Loading",
  description = "Please wait while we process your request.",
  progress,
}: LoadingProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    progress !== undefined
      ? circumference - (progress / 100) * circumference
      : circumference;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm font-lexend">
      <div className="bg-white rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center gap-6 w-75 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Circular Progress */}
        <div className="relative w-24 h-10 flex items-center justify-center">
          {progress !== undefined ? (
            <>
              <svg
                className="w-24 h-24 -rotate-90"
                viewBox="0 0 100 100"
              >
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#6366f1"
                  strokeWidth="8"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300"
                />
              </svg>

              {/* Percentage Text */}
              <span className="absolute text-lg font-semibold text-gray-800">
                {progress}%
              </span>
            </>
          ) : (
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          )}
        </div>

        {/* Text */}
        <div className="text-center">
          <h3 className="text-base font-semibold text-gray-900">
            {title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}