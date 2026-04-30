"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Coffee,
  LogOut,
  Bell,
  Server,
  Search,
  Gauge,
  BarChart,
} from "lucide-react";
import { toast } from "sonner";
import { User } from "./Types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    name: "Terminal Nodes",
    icon: Server, // Main icon for the category
    href: "/terminal-nodes", // Parent link can go to the overview
    subMenu: [
      {
        name: "Node Overview",
        icon: BarChart, // Or a more specific icon
        href: "/terminal-nodes/all", // Page to view all node data
      },
      {
        name: "Find by Client",
        icon: Search,
        href: "/terminal-nodes/search", // Page with a search input for a specific client
      },
    ],
  },
  {
    name: "Consumption",
    icon: Gauge, // Main icon for the category
    href: "/#", // Parent link
    subMenu: [
      {
        name: "Consumption Overview",
        icon: BarChart,
        href: "/#", // Page to view all consumption data
      },
      {
        name: "Find by Client",
        icon: Search,
        href: "/#", // Page to search for a specific client's consumption
      },
    ],
  },
];
interface SidebarProps {
  currentUser: Partial<User> | null;
}
export default function Sidebar({ currentUser }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const handleLogout = async () => {
    const toastId = toast.loading("Logging out...");

    try {
      await fetch("/api/logout", {
        method: "POST",
      });

      toast.success("Logged out successfully", {
        id: toastId,
      });

      router.push("/");
    } catch (error) {
      console.log("Logout error:", error);

      toast.error("Logout failed", {
        id: toastId,
      });
    }
  };
  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-72"
      } bg-gray-900 min-h-screen flex flex-col transition-all duration-300 ease-in-out relative font-lexend`}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-700">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shrink-0">
          <Coffee className="w-6 h-6 text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">DCS</h1>
            <p className="text-gray-400 text-xs">Data Control System</p>
          </div>
        )}
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-colors z-10 shadow-lg cursor-pointer"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <p
          className={`text-gray-500 text-xs font-semibold uppercase tracking-wider mb-4 ${
            collapsed ? "text-center" : "px-4"
          }`}
        >
          {collapsed ? "•••" : "Main Menu"}
        </p>

        <Accordion
          type="single"
          collapsible
          defaultValue={
            menuItems.find((item) =>
              item.subMenu?.some((sub) => pathname.startsWith(sub.href)),
            )?.name
          }
          className="space-y-1"
        >
          {menuItems.map((item) => {
            const hasSubMenu = item.subMenu?.length;
            const isActive =
              pathname === item.href ||
              item.subMenu?.some((sub) => pathname.startsWith(sub.href));

            // 🔹 If NO submenu → render normal link
            if (!hasSubMenu) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
              flex items-center gap-3 px-4 py-3 rounded-lg
              transition-all duration-200
              ${
                isActive
                  ? "bg-slate-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }
            `}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            }

            // 🔹 If HAS submenu → use Accordion
            return (
              <AccordionItem
                key={item.name}
                value={item.name}
                className="border-none"
              >
                <AccordionTrigger
                  className={`
              px-4 py-3 rounded-lg hover:no-underline
              ${
                isActive
                  ? "bg-slate-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }
              ${collapsed ? "justify-center" : ""}
            `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </div>
                </AccordionTrigger>

                {!collapsed && (
                  <AccordionContent className="pl-8 space-y-1">
                    {item.subMenu?.map((sub) => {
                      const isSubActive = pathname === sub.href;

                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                      transition-all duration-200
                      ${
                        isSubActive
                          ? "bg-slate-500 text-white"
                          : "text-gray-400 hover:bg-gray-700 hover:text-white"
                      }
                    `}
                        >
                          <sub.icon className="w-4 h-4 shrink-0" />
                          <span>{sub.name}</span>
                        </Link>
                      );
                    })}
                  </AccordionContent>
                )}
              </AccordionItem>
            );
          })}
        </Accordion>
      </nav>

      {/* Bottom Section */}
      <div className="px-4 py-4 border-t border-gray-700 space-y-1">
        <Link
          href="#"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ${collapsed ? "justify-center px-2" : ""}`}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="font-medium">Settings</span>}
        </Link>
        <button
          onClick={() => handleLogout()}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 w-full cursor-pointer ${collapsed ? "justify-center px-2" : ""}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && (
            <span className="font-medium font-lexend">Logout</span>
          )}
        </button>
      </div>

      {/* User Profile */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              JS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {currentUser?.name}
              </p>
              <p className="text-gray-400 text-xs truncate capitalize">
                {currentUser?.role}
              </p>
            </div>
            <Bell className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>
      )}
    </aside>
  );
}
