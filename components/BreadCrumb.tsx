"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home, LucideIcon } from "lucide-react";
import { TooltipComponent } from "./TooltipComponent";
function formatSegment(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
interface BreadCrumbProps {
  title?: string;
  toolTipText?: string;
  toolTipIcon?: LucideIcon;
}
export default function BreadCrumb({
  title,
  toolTipText,
  toolTipIcon: Icon,
}: BreadCrumbProps) {
  const pathname = usePathname();

  const segments = pathname.split("/").filter((segment) => segment.length > 0);

  const paths = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    return { name: formatSegment(segment), href };
  });

  return (
    <div className="w-full flex flex-row items-center justify-between font-lexend text-sm text-slate-700">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          {title}
        </h2>
        {toolTipText && Icon && (
          <TooltipComponent text={toolTipText} icon={Icon} />
        )}
      </div>
      <nav className="flex items-center text-sm font-medium text-gray-500 font-lexend">
        {/* Home */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
        >
          <Home className="w-4 h-4" />
        </Link>

        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;

          return (
            <div key={path.href} className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />

              {isLast ? (
                <span className="text-slate-700 font-semibold">
                  {path.name}
                </span>
              ) : (
                <Link
                  href={path.href}
                  className="hover:text-indigo-600 transition-colors"
                >
                  {path.name}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
