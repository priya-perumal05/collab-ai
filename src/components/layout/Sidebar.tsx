import React, { useState } from "react";
import {
  LayoutDashboard,
  Activity,
  Users,
  User,
  Settings,
  Plus,
  Key,
  Star,
  PieChart,
  Pause,
  Sun,
  Moon,
  Target,
  Shield,
  Grid,
  ChevronRight,
  ChevronLeft,
  Link2,
  Sparkles,
  MessageCircle,
  Home,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Avatar } from "../ui/Avatar";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useData } from "../../hooks/useData";
interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}
export function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const { userProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { apps } = useData();
  const [isExpanded, setIsExpanded] = useState(false);
  const menuItems: { icon: any, path: string, label: string, badge?: string }[] = [
    { icon: Home, path: "/", label: "Dashboard" },
    { icon: LayoutDashboard, path: "/roadmap", label: "Roadmap" },
    { icon: Pause, path: "/board", label: "Board" },
    { icon: Sparkles, path: "/ai-insights", label: "AI Insights" },
    { icon: Users, path: "/team-details", label: "Team Details" },
    { icon: Shield, path: "/teams", label: userProfile?.role === "Team Lead" ? "Manage Teams" : "My Teams" },
    { icon: MessageCircle, path: "/chat", label: "Chat" },
    { icon: Target, path: "/goals", label: "Goals" },
    { icon: PieChart, path: "/reports", label: "Reports" },
    { icon: Star, path: "/favorites", label: "Favorites" },
    { icon: Key, path: "/protection", label: "Protection" },
  ];
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col py-6 bg-white/30 dark:bg-black/30 backdrop-blur-2xl border-r border-white/40 dark:border-white/10 h-screen sticky top-0 z-30 transition-all duration-500 ease-in-out group/sidebar",
        isExpanded ? "w-64" : "w-20",
      )}
      onClick={() => !isExpanded && setIsExpanded(true)}
    >
      {" "}
      {/* Expand Toggle Button */}{" "}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg z-50 hover:scale-110 transition-transform"
      >
        {" "}
        {isExpanded ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}{" "}
      </button>{" "}
      {/* User Profile */}{" "}
      <div
        className={cn(
          "px-4 mb-10 transition-all duration-300",
          isExpanded ? "flex items-center gap-4" : "flex flex-col items-center",
        )}
      >
        {" "}
        <div
          className="relative group cursor-pointer"
          onClick={() => onNavigate("/profile")}
        >
          {" "}
          <Avatar
            fallback={userProfile?.name?.charAt(0) || "?"}
            className="h-12 w-12 border-2 border-transparent group-hover:border-blue-500 transition-all"
          />{" "}
          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-white dark:border-[#0F1115] rounded-full flex items-center justify-center">
            {" "}
            <Plus className="h-3 w-3 text-white" />{" "}
          </div>{" "}
        </div>{" "}
        {isExpanded && (
          <div className="animate-in fade-in slide-in-from-left-2 duration-300">
            {" "}
            <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">
              Hello
            </p>{" "}
            <p className="text-base md:text-lg font-black font-display text-slate-900 dark:text-white truncate max-w-[120px]">
              {" "}
              {userProfile?.name || "Evgeniy P."}{" "}
            </p>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* Scrollable Content */}{" "}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-2 space-y-10">
        {" "}
        {/* Main Menu */}{" "}
        <div className="flex flex-col gap-2 w-full">
          {" "}
          <p
            className={cn(
              "text-xs font-bold text-slate-400 dark:text-slate-600 tracking-widest mb-4 uppercase transition-all",
              isExpanded ? "px-4" : "text-center",
            )}
          >
            {" "}
            Menu{" "}
          </p>{" "}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(item.path);
                }}
                className={cn(
                  "flex items-center rounded-2xl transition-all duration-300 group relative w-full",
                  isExpanded ? "px-4 py-3 gap-4" : "p-3 justify-center",
                  isActive
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20"
                    : "text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200",
                )}
              >
                {" "}
                <div className="relative flex items-center justify-center transition-all">
                  {" "}
                  <Icon className="h-6 w-6 transition-transform group-hover:scale-110" />{" "}
                  {item.badge && !isExpanded && (
                    <div className="absolute -top-2 -right-2 h-4 w-4 bg-amber-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#0F1115]">
                      {" "}
                      {item.badge}{" "}
                    </div>
                  )}{" "}
                </div>{" "}
                {isExpanded && (
                  <span className="text-base font-bold flex-1 text-left animate-in fade-in slide-in-from-left-2 duration-300">
                    {" "}
                    {item.label}{" "}
                  </span>
                )}{" "}
                {item.badge && isExpanded && (
                  <div className="h-6 w-6 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20">
                    {" "}
                    {item.badge}{" "}
                  </div>
                )}{" "}
                {isActive && !isExpanded && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
                )}{" "}
              </button>
            );
          })}{" "}
        </div>{" "}
        {/* Apps Section */}{" "}
        <div className="flex flex-col gap-4 w-full">
          {" "}
          <div
            className={cn(
              "flex items-center gap-2 mb-2 transition-all",
              isExpanded ? "px-4" : "justify-center",
            )}
          >
            {" "}
            <Link2 className="h-3 w-3 text-slate-400" />{" "}
            <p
              className={cn(
                "text-[10px] font-bold text-slate-400 dark:text-slate-600 tracking-widest uppercase",
                !isExpanded && "hidden",
              )}
            >
              {" "}
              Apps{" "}
            </p>{" "}
          </div>{" "}
          {apps.slice(0, 4).map((app) => (
            <button
              key={app.id}
              onClick={(e) => {
                e.stopPropagation();
                window.open(app.url, "_blank");
              }}
              className={cn(
                "flex items-center transition-all duration-300 group cursor-pointer",
                isExpanded ? "px-4 py-2 gap-4" : "justify-center",
              )}
            >
              {" "}
              <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                {" "}
                {app.name.charAt(0)}{" "}
              </div>{" "}
              {isExpanded && (
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors animate-in fade-in slide-in-from-left-2 duration-300 truncate">
                  {" "}
                  {app.name}{" "}
                </span>
              )}{" "}
            </button>
          ))}{" "}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate("/apps");
            }}
            className={cn(
              "flex items-center transition-all duration-300 group cursor-pointer",
              isExpanded ? "px-4 py-2 gap-4" : "justify-center",
            )}
          >
            {" "}
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
              {" "}
              <Plus className="h-5 w-5" />{" "}
            </div>{" "}
            {isExpanded && (
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors animate-in fade-in slide-in-from-left-2 duration-300">
                {" "}
                Add App{" "}
              </span>
            )}{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      {/* Theme Toggle */}{" "}
      <div
        className={cn(
          "mt-auto px-4 transition-all duration-300",
          isExpanded
            ? "flex items-center justify-between glass-card p-2 mx-4"
            : "flex flex-col items-center gap-2 glass-card p-1.5 mx-2",
        )}
      >
        {" "}
        <button
          onClick={(e) => {
            e.stopPropagation();
            theme === "dark" && toggleTheme();
          }}
          className={cn(
            "p-2 rounded-xl transition-all",
            theme === "light"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-500 hover:text-slate-300",
          )}
        >
          {" "}
          <Sun className="h-5 w-5" />{" "}
        </button>{" "}
        <button
          onClick={(e) => {
            e.stopPropagation();
            theme === "light" && toggleTheme();
          }}
          className={cn(
            "p-2 rounded-xl transition-all",
            theme === "dark"
              ? "bg-[#1A1D23] text-blue-400 shadow-sm"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          {" "}
          <Moon className="h-5 w-5" />{" "}
        </button>{" "}
      </div>{" "}
    </aside>
  );
}
