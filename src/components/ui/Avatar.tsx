import * as React from "react";
import { cn } from "@/src/lib/utils";
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}
export function Avatar({
  className,
  src,
  alt,
  fallback,
  size = "md",
  ...props
}: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };
  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-white/10",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {" "}
      {src ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="aspect-square h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium">
          {" "}
          {fallback || "?"}{" "}
        </div>
      )}{" "}
    </div>
  );
}
