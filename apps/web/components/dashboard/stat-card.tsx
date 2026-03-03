import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
  accent?: "indigo" | "emerald" | "amber" | "red";
  className?: string;
}

const accentClasses: Record<string, { icon: string; trend: string; bg: string }> = {
  indigo: {
    icon: "text-indigo-400",
    trend: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  emerald: {
    icon: "text-emerald-400",
    trend: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  amber: {
    icon: "text-amber-400",
    trend: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  red: {
    icon: "text-red-400",
    trend: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
};

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = "indigo",
  className,
}: StatCardProps) {
  const colors = accentClasses[accent];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-5 transition-all duration-200 hover:border-slate-700",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-3xl font-bold text-slate-100 tabular-nums">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
          {trend && (
            <p className={cn("text-xs font-medium", colors.trend)}>
              {trend.value > 0 ? "+" : ""}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", colors.bg)}>
            <Icon className={cn("h-5 w-5", colors.icon)} />
          </div>
        )}
      </div>

      {/* Subtle gradient */}
      <div className={cn("absolute inset-x-0 bottom-0 h-1 opacity-20", {
        "bg-gradient-to-r from-indigo-500 to-indigo-400": accent === "indigo",
        "bg-gradient-to-r from-emerald-500 to-emerald-400": accent === "emerald",
        "bg-gradient-to-r from-amber-500 to-amber-400": accent === "amber",
        "bg-gradient-to-r from-red-500 to-red-400": accent === "red",
      })} />
    </div>
  );
}
