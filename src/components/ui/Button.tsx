import * as React from "react";
import { cn } from "@/src/lib/utils";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default:
        "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20",
      destructive:
        "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20",
      outline:
        "border border-slate-300 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200",
      secondary:
        "bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-white/20",
      ghost:
        "hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200",
      link: "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline",
    };
    const sizes = {
      default: "h-9 px-3 text-xs md:h-10 md:px-4 md:text-sm",
      sm: "h-8 px-2 text-[10px] md:h-9 md:px-3 md:text-xs rounded-md",
      lg: "h-10 px-6 text-sm md:h-11 md:px-8 md:text-base rounded-md",
      icon: "h-8 w-8 md:h-10 md:w-10",
    };
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
export { Button };
