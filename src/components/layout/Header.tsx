import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Mic,
  Bell,
  Settings,
  Plus,
  MessageCircle,
  Clock,
  CheckCircle2,
  User,
  Home,
} from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../hooks/useData";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
interface HeaderProps {
  title: string;
  currentPath?: string;
  onNavigate?: (path: string) => void;
}
export function Header({
  title,
  currentPath = "/",
  onNavigate = () => {},
}: HeaderProps) {
  const { userProfile, teamData, logout } = useAuth();
  const { tasks, users } = useData();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const navLinks = [
    { label: "Your work", path: "/board" },
    { label: "Projects", path: "/roadmap" },
    { label: "Dashboards", path: "/" },
    { label: "AI Insights", path: "/ai-insights" },
  ];
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const myTasks = tasks.filter((t) =>
    t.assignees?.includes(userProfile?.uid || ""),
  );
  const recentTasks = [...myTasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    )
    .slice(0, 2);
  const upcomingDeadlines = myTasks
    .filter((t) => {
      if (!t.deadline) return false;
      const days =
        (new Date(t.deadline).getTime() - new Date().getTime()) /
        (1000 * 3600 * 24);
      return days > 0 && days <= 3;
    })
    .slice(0, 1);
  const notifications = [
    ...recentTasks.map((t) => ({
      id: `task-${t.id}`,
      type: "task",
      icon: CheckCircle2,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      title: "New Task Assigned",
      desc: `You were assigned to "${t.title}"`,
      time: "Recently",
    })),
    ...upcomingDeadlines.map((t) => ({
      id: `deadline-${t.id}`,
      type: "deadline",
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      title: "Deadline Approaching",
      desc: `"${t.title}" is due soon`,
      time: "Upcoming",
    })),
    {
      id: "system-1",
      type: "system",
      icon: Settings,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      title: "System Feature",
      desc: "Team Chat and Voice Search are now live!",
      time: "Just now",
    },
  ];
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Your browser doesn't support voice search. Try Chrome, Edge, or Safari.",
      );
      return;
    }
    /* Stop listening if already active */ if (isListening) return;
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.onstart = () => {
        setIsListening(true);
        setIsSearchFocused(true);
        setSearchQuery("");
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery((prev) => (prev ? prev + " " + transcript : transcript));
      };
      recognition.onerror = (e: any) => {
        console.error("Speech recognition error:", e.error);
        setIsListening(false);
        if (e.error === "not-allowed") {
          alert(
            "Microphone access was denied. Please allow microphone access in your browser to use voice search.",
          );
        } else if (e.error !== "no-speech" && e.error !== "aborted") {
          alert(`Voice search encountered an error: ${e.error}`);
        }
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      console.error("Speech recognition initialization failed:", err);
      setIsListening(false);
    }
  };
  const searchResults = searchQuery
    ? {
        tasks: tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
        users: users.filter(
          (u) =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.role.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      }
    : { tasks: [], users: [] };
  return (
    <header className="relative z-20 h-20 md:h-24 flex items-center justify-between px-4 md:px-8 bg-white/30 dark:bg-black/30 backdrop-blur-md border-b border-white/40 dark:border-white/10 transition-colors duration-300 gap-4">
      {" "}
      {/* Left: Page Title & Team Context */}{" "}
      <div className="flex items-center gap-6 min-w-0 flex-shrink-0 max-w-[30%] lg:max-w-none">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-0.5 whitespace-nowrap">
            <Home className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-500 shrink-0" />
            <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 truncate">
              {teamData?.name || "Personal Workspace"}
            </h2>
          </div>
          <h1 className="text-base md:text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight truncate">
            {title}
          </h1>
        </div>
        <nav className="hidden lg:flex items-center gap-4 border-l border-slate-200 dark:border-white/5 pl-6">
          {navLinks.map((link, i) => (
            <button
              key={i}
              onClick={() => onNavigate(link.path)}
              className={cn(
                "text-sm font-medium transition-colors whitespace-nowrap",
                currentPath === link.path
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
              )}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
      {/* Center: Search Bar */}
      <div className="flex-1 max-w-lg min-w-[200px] hidden sm:block">
        <div className="relative group" ref={searchRef}>
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-full transition-colors outline-none z-10",
              isListening
                ? "text-rose-500 bg-rose-500/10 animate-pulse"
                : "text-slate-400 hover:text-blue-500 hover:bg-blue-500/10",
            )}
            title="Voice search"
          >
            <Mic className="h-4 w-4" />
          </button>

          {isListening && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-60">
              {[1, 3, 2, 4, 2].map((h, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-rose-500 rounded-full animate-bounce"
                  style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )}

          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder={isListening ? "Listening..." : "Search anything..."}
            className="w-full h-12 rounded-full bg-slate-100 dark:bg-white/5 border border-transparent focus:border-blue-500/30 focus:bg-white dark:focus:bg-[#1A1D23] focus:shadow-lg focus:shadow-blue-500/5 pl-14 pr-20 text-sm font-medium text-slate-900 dark:text-white transition-all outline-none"
          />

          {isSearchFocused && searchQuery && (
            <div className="absolute top-14 left-0 right-0 max-h-96 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {" "}
              {searchResults.tasks.length > 0 && (
                <div className="mb-4">
                  {" "}
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 px-3">
                    Tasks
                  </h4>{" "}
                  <div className="space-y-1">
                    {" "}
                    {searchResults.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => {
                          setIsSearchFocused(false);
                          onNavigate("/board");
                        }}
                        className="w-full flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-colors"
                      >
                        {" "}
                        <CheckCircle2 className="h-4 w-4 text-slate-400 mt-0.5" />{" "}
                        <div>
                          {" "}
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {task.title}
                          </p>{" "}
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {task.description}
                          </p>{" "}
                        </div>{" "}
                      </button>
                    ))}{" "}
                  </div>{" "}
                </div>
              )}{" "}
              {searchResults.users.length > 0 && (
                <div>
                  {" "}
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 px-3">
                    Members
                  </h4>{" "}
                  <div className="space-y-1">
                    {" "}
                    {searchResults.users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setIsSearchFocused(false);
                          onNavigate("/team-details");
                        }}
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-colors"
                      >
                        {" "}
                        <Avatar
                          src={user.avatar}
                          fallback={user.name.charAt(0)}
                          className="h-8 w-8"
                        />{" "}
                        <div>
                          {" "}
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {user.name}
                          </p>{" "}
                          <p className="text-xs text-slate-500">
                            {user.role}
                          </p>{" "}
                        </div>{" "}
                      </button>
                    ))}{" "}
                  </div>{" "}
                </div>
              )}{" "}
              {searchResults.tasks.length === 0 &&
                searchResults.users.length === 0 && (
                  <div className="p-4 text-center text-sm text-slate-500">
                    {" "}
                    No results found for "{searchQuery}"{" "}
                  </div>
                )}{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
      {/* Right: Actions */}{" "}
      <div className="flex items-center gap-2 lg:gap-4 shrink-0">
        {" "}
        {userProfile?.role === "Team Lead" && (
          <button
            onClick={() => onNavigate("/board")}
            className="hidden xl:flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 text-white text-base font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:-translate-y-0.5 transition-all"
          >
            {" "}
            <Plus className="h-4 w-4" /> Create{" "}
          </button>
        )}{" "}
        <button
          onClick={() => onNavigate("/chat")}
          className="relative p-2.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors"
        >
          {" "}
          <MessageCircle className="h-5 w-5" />{" "}
          <span className="absolute top-2 right-2 h-2 w-2 bg-green-500 rounded-full border-2 border-white dark:border-[#0F1115]" />{" "}
        </button>{" "}
        <div className="relative" ref={notificationsRef}>
          {" "}
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors"
          >
            {" "}
            <Bell className="h-5 w-5" />{" "}
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 bg-amber-500 rounded-full border-2 border-white dark:border-[#0F1115]" />
            )}{" "}
          </button>{" "}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              {" "}
              <div className="p-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
                {" "}
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Notifications
                </h3>{" "}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  {" "}
                  {notifications.length} New{" "}
                </span>{" "}
              </div>{" "}
              <div className="max-h-[300px] overflow-y-auto p-2">
                {" "}
                {notifications.length > 0 ? (
                  <div className="space-y-1">
                    {" "}
                    {notifications.map((notif) => {
                      const Icon = notif.icon;
                      return (
                        <div
                          key={notif.id}
                          className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                          {" "}
                          <div
                            className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                              notif.bg,
                              notif.color,
                            )}
                          >
                            {" "}
                            <Icon className="h-4 w-4" />{" "}
                          </div>{" "}
                          <div className="flex-1 min-w-0">
                            {" "}
                            <div className="flex items-center justify-between mb-0.5">
                              {" "}
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {notif.title}
                              </p>{" "}
                              <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                {notif.time}
                              </span>{" "}
                            </div>{" "}
                            <p className="text-xs text-slate-500 truncate">
                              {notif.desc}
                            </p>{" "}
                          </div>{" "}
                        </div>
                      );
                    })}{" "}
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-slate-500">
                    {" "}
                    No new notifications{" "}
                  </div>
                )}{" "}
              </div>{" "}
            </div>
          )}{" "}
        </div>{" "}
        <button
          onClick={() => onNavigate("/protection")}
          className="p-2.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors"
        >
          {" "}
          <Settings className="h-5 w-5" />{" "}
        </button>{" "}
        <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2" />{" "}
        <div className="relative" ref={dropdownRef}>
          {" "}
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 group"
          >
            {" "}
            <Avatar
              fallback={userProfile?.name?.charAt(0) || "?"}
              className="h-10 w-10 border-2 border-transparent group-hover:border-blue-500 transition-all"
            />{" "}
          </button>{" "}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              {" "}
              <div className="p-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                {" "}
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {userProfile?.name || "User"}
                </p>{" "}
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {userProfile?.email || "No email"}
                </p>{" "}
              </div>{" "}
              <div className="p-2">
                {" "}
                <button
                  onClick={async () => {
                    setIsProfileOpen(false);
                    try {
                      await logout();
                    } catch (error) {
                      console.error("Logout error", error);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  {" "}
                  Sign Out{" "}
                </button>{" "}
              </div>{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </header>
  );
}
