"use client";

import { Bell, Search, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 py-5 sticky top-0 z-50">
      
      {/* Left Section */}
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-semibold text-slate-800">
          Dashboard
        </h1>

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-slate-100 px-3 py-2 rounded-lg w-64">
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm ml-2 w-full text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6 relative">

        {/* Notifications */}
        <div className="relative cursor-pointer">
          <Bell className="text-slate-600 hover:text-slate-900 transition" />
          <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            3
          </span>
        </div>

        {/* Profile */}
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-medium">
            RL
          </div>

          <div className="hidden md:block text-sm">
            <p className="font-medium text-slate-700">Ricklee</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>

          <ChevronDown size={16} className="text-slate-500" />
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-14 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-2 text-sm">
            <button className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700">
              Profile
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700">
              Settings
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-slate-100 text-red-500">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}