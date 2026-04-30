"use client";

import { Bell, User } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">Admin Panel</h1>

      <div className="flex items-center gap-4">
        <Bell className="cursor-pointer text-gray-600" />
        <User className="cursor-pointer text-gray-600" />
      </div>
    </header>
  );
}