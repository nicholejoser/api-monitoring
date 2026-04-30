"use client";
import React, { useState } from "react";
import { ConsumptionLog } from "./Types";

export default function MetricsCard() {
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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card */}
      <div className="relative group rounded-2xl p-[1px] bg-gradient-to-br from-slate-200/60 via-white/40 to-slate-100/60 hover:from-indigo-200/60 hover:to-violet-200/60 transition-all duration-500">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 h-full border border-white/60 shadow-sm hover:shadow-xl hover:shadow-indigo-100/40 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-5 h-5 text-slate-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>

          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Total Logs
          </span>

          <p className="text-4xl font-extrabold mt-2 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
            {usage?.id ? "1" : "0"}
          </p>
        </div>
      </div>

      {/* Card 2 */}
      <div className="group bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/60 shadow-sm hover:shadow-xl hover:shadow-indigo-100/40 transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between mb-5">
          <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Network Source
        </span>

        <p className="text-lg font-semibold mt-2 text-gray-800">Secure Proxy</p>
      </div>

      {/* Card 3 */}
      <div className="group bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/60 shadow-sm hover:shadow-xl hover:shadow-violet-100/40 transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between mb-5">
          <div className="w-11 h-11 bg-violet-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg
              className="w-5 h-5 text-violet-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
        </div>

        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Security Status
        </span>

        <p className="text-lg font-semibold mt-2 text-emerald-600">Verified</p>
      </div>

      {/* Card 4 */}
      <div className="group bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/60 shadow-sm hover:shadow-xl hover:shadow-amber-100/40 transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between mb-5">
          <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg
              className="w-5 h-5 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Last Updated
        </span>

        <p className="text-lg font-semibold mt-2 text-gray-800">
          {new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
