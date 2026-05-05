import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Pause, 
  MessageCircle, 
  PieChart, 
  User,
  Menu,
  X,
  Target,
  Users,
  Shield,
  Star,
  Key,
  Sparkles,
  Link2,
  Map,
  Sun,
  Moon
} from "lucide-react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Dashboard } from "@/src/pages/Dashboard";
import { Tasks } from "@/src/pages/Tasks";
import { Performance } from "@/src/pages/Performance";
import { TeamInsights } from "@/src/pages/TeamInsights";
import { Profile } from "@/src/pages/Profile";
import Roadmap from "@/src/pages/Roadmap";
import Board from "@/src/pages/Board";
import Goals from "@/src/pages/Goals";
import Reports from "@/src/pages/Reports";
import Favorites from "@/src/pages/Favorites";
import Protection from "@/src/pages/Protection";
import TeamDetails from "@/src/pages/TeamDetails";
import Apps from "@/src/pages/Apps";
import AIInsights from "@/src/pages/AIInsights";
import Chat from "@/src/pages/Chat";
import Teams from "@/src/pages/Teams";
import { Chatbot } from "../Chatbot";
import { useTheme } from "../../contexts/ThemeContext";

export function Layout() {
  const [currentPath, setCurrentPath] = useState("/");
  const [isBooting, setIsBooting] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  /* App opening animation duration */ useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 3200);
    /* 3.2 seconds total splash for super smooth slower entrance */ return () =>
      clearTimeout(timer);
  }, []);
  const renderContent = () => {
    switch (currentPath) {
      case "/":
        return <Dashboard />;
      case "/roadmap":
        return <Roadmap />;
      case "/board":
        return <Board />;
      case "/goals":
        return <Goals />;
      case "/reports":
        return <Reports />;
      case "/favorites":
        return <Favorites />;
      case "/protection":
        return <Protection />;
      case "/team-details":
        return <TeamDetails />;
      case "/teams":
        return <Teams />;
      case "/chat":
        return <Chat />;
      case "/apps":
        return <Apps />;
      case "/ai-insights":
        return <AIInsights />;
      case "/performance":
        return <Performance />;
      case "/team":
        return <TeamInsights />;
      case "/profile":
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };
  const getTitle = () => {
    switch (currentPath) {
      case "/":
        return "Dashboard Overview";
      case "/roadmap":
        return "Project Roadmap";
      case "/board":
        return "Task Board";
      case "/goals":
        return "Strategic Goals";
      case "/reports":
        return "Analytics & Reports";
      case "/favorites":
        return "Favorites";
      case "/protection":
        return "Security & Protection";
      case "/team-details":
        return "Team Details";
      case "/teams":
        return "Teams";
      case "/chat":
        return "Team Chat";
      case "/apps":
        return "App Integrations";
      case "/ai-insights":
        return "AI Project Insights";
      case "/performance":
        return "Personal Performance";
      case "/team":
        return "Team Insights";
      case "/profile":
        return "My Profile";
      default:
        return "Dashboard";
    }
  };
  return (
    <>
      {" "}
      <AnimatePresence>
        {" "}
        {isBooting && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B1120] overflow-hidden perspective-[1000px]"
            exit={{ opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            {" "}
            {/* Immersive 3D Splah Screen */}{" "}
            <motion.div
              className="flex flex-col items-center justify-center transform-gpu origin-center"
              initial={{ opacity: 0, scale: 0.5, rotateY: 180, rotateZ: 45 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0, rotateZ: 0 }}
              exit={{
                scale: 15,
                opacity: 0,
                transition: { duration: 1.2, ease: [0.64, 0, 0.78, 0] },
              }}
              transition={{
                duration: 2.2,
                /* Much slower initial drop-in */ ease: [
                  0.16, 1, 0.3, 1,
                ] /* Very slow, buttery ease-out */,
              }}
            >
              {" "}
              <motion.div
                className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_80px_rgba(59,130,246,0.6)]"
                animate={{
                  rotateX: [0, 8, -8, 0],
                  rotateY: [0, -8, 8, 0],
                  transformPerspective: 800,
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              >
                {" "}
                <motion.svg
                  className="w-16 h-16 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, delay: 0.8, ease: "easeInOut" }}
                >
                  {" "}
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />{" "}
                </motion.svg>{" "}
              </motion.div>{" "}
              <motion.h1
                className="mt-8 text-4xl font-black text-white tracking-widest uppercase"
                initial={{ opacity: 0, y: 50, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                transition={{
                  duration: 1.8,
                  delay: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  transformStyle: "preserve-3d",
                  transformPerspective: 500,
                }}
              >
                {" "}
                Collab AI{" "}
              </motion.h1>{" "}
              <motion.div
                className="mt-4 w-48 h-1 overflow-hidden bg-white/10 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.4, duration: 1 }}
              >
                {" "}
                <motion.div
                  className="w-full h-full bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 1.6, delay: 1.4, ease: "circOut" }}
                />{" "}
              </motion.div>{" "}
            </motion.div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
      <motion.div
        className="flex fixed inset-0 w-full global-glass-bg text-slate-900 dark:text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30 transition-colors duration-300 transform-gpu origin-center"
        initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
        animate={{
          opacity: isBooting ? 0 : 1,
          scale: isBooting ? 1.05 : 1,
          filter: isBooting ? "blur(20px)" : "blur(0px)",
        }}
        transition={{
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1],
          delay: isBooting ? 0 : 0,
        }}
      >
        {" "}
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur-3xl absolute inset-0 pointer-events-none" />{" "}
        <div className="z-10 flex h-full w-full">
          {" "}
          <Sidebar currentPath={currentPath} onNavigate={setCurrentPath} />{" "}
          <div className="flex-1 flex flex-col h-full overflow-hidden pb-[72px] md:pb-0">
            {" "}
            <Header
              title={getTitle()}
              currentPath={currentPath}
              onNavigate={setCurrentPath}
            />{" "}
            <main className="flex-1 overflow-hidden p-3 md:p-6 lg:p-8 scroll-smooth z-10 relative flex flex-col">
              {" "}
              <div className="w-full h-full flex-1 flex flex-col overflow-y-auto">
                {" "}
                {renderContent()}{" "}
              </div>{" "}
            </main>{" "}
          </div>{" "}
          
          {/* Mobile Bottom Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-white/60 dark:bg-[#0B1120]/80 backdrop-blur-2xl border-t border-white/40 dark:border-white/10 z-[60] flex items-center justify-around px-2 pb-safe">
            {[
              { path: "/", icon: LayoutDashboard, label: "Home" },
              { path: "/board", icon: Pause, label: "Tasks" },
              { path: "/chat", icon: MessageCircle, label: "Chat" },
              { path: "/reports", icon: PieChart, label: "Stats" },
              { path: "menu", icon: Menu, label: "Menu" },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (currentPath === '/' && item.path === '/');
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    if (item.path === "menu") {
                      setIsMobileMenuOpen(true);
                    } else {
                      setCurrentPath(item.path);
                    }
                  }}
                  className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
                    isActive && item.path !== "menu"
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive && item.path !== "menu" ? "scale-110 drop-shadow-md" : ""}`} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Full Screen Mobile Menu Overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="md:hidden fixed inset-0 z-[100] bg-white/95 dark:bg-black/95 backdrop-blur-3xl overflow-y-auto pb-24"
              >
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white/50 dark:bg-black/50 backdrop-blur-md z-10">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Menu</h2>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    { icon: Map, path: "/roadmap", label: "Roadmap" },
                    { icon: Sparkles, path: "/ai-insights", label: "AI Insights" },
                    { icon: Target, path: "/goals", label: "Goals" },
                    { icon: Users, path: "/team-details", label: "Team Details" },
                    { icon: Shield, path: "/teams", label: "Teams" },
                    { icon: User, path: "/profile", label: "Profile" },
                    { icon: Star, path: "/favorites", label: "Favorites" },
                    { icon: Key, path: "/protection", label: "Protection" },
                    { icon: Link2, path: "/apps", label: "Apps" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          setCurrentPath(item.path);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-colors ${
                          currentPath === item.path
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                            : "text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-semibold">{item.label}</span>
                      </button>
                    )
                  })}
                  
                  {/* Theme Toggle in Mobile Menu */}
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between gap-4 p-4 rounded-2xl transition-colors text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5"
                  >
                    <div className="flex items-center gap-4">
                      {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                      <span className="font-semibold">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                    <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>{" "}
        <Chatbot currentPath={currentPath} />{" "}
      </motion.div>{" "}
    </>
  );
}
