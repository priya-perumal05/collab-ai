import * as React from "react";
import { cn } from "@/src/lib/utils";
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning";
}
function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default:
      "border-transparent bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-500/30",
    secondary:
      "border-transparent bg-slate-200 dark:bg-slate-500/20 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500/30",
    destructive:
      "border-transparent bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-500/30",
    success:
      "border-transparent bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-500/30",
    warning:
      "border-transparent bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-500/30",
    outline:
      "text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-500/30",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
export { Badge };
