import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  Search,
  ExternalLink,
  Plus,
  X,
  Globe,
  User,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Layout,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useData } from "../hooks/useData";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
export default function Apps() {
  const { apps } = useData();
  const { userProfile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {},
  );
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    loginId: "",
    password: "",
  });
  const filteredApps = apps.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const logAction = async (
    action: string,
    type: "security" | "auth" | "system" | "warning",
  ) => {
    if (!userProfile?.teamId) return;
    try {
      await addDoc(collection(db, "securityLogs"), {
        userId: userProfile.uid,
        userName: userProfile.name,
        action,
        type,
        teamId: userProfile.teamId,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Error logging action:", e);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.teamId) return;
    try {
      await addDoc(collection(db, "apps"), {
        ...formData,
        teamId: userProfile.teamId,
        creatorId: userProfile.uid,
        createdAt: serverTimestamp(),
      });
      await logAction(`Added new app integration: ${formData.name}`, "system");
      setFormData({ name: "", url: "", loginId: "", password: "" });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding app:", error);
    }
  };
  const handleDelete = async (appId: string) => {
    const app = apps.find((a) => a.id === appId);
    try {
      await deleteDoc(doc(db, "apps", appId));
      await logAction(
        `Removed app integration: ${app?.name || appId}`,
        "warning",
      );
    } catch (error) {
      console.error("Error deleting app:", error);
    }
  };
  const togglePassword = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const handleAppClick = (url: string) => {
    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
    window.open(formattedUrl, "_blank");
  };
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {" "}
      <div className="flex flex-wrap items-center justify-between gap-6">
        {" "}
        <div className="space-y-1">
          {" "}
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            App Integrations
          </h1>{" "}
          <p className="text-slate-500 dark:text-slate-400">
            Shared team credentials and quick access to external tools
          </p>{" "}
        </div>{" "}
        <div className="flex items-center gap-4">
          {" "}
          <div className="relative group">
            {" "}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />{" "}
            <input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl glass-card text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all w-64"
            />{" "}
          </div>{" "}
          {true && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/20 transition-all"
            >
              {" "}
              <Plus className="h-4 w-4" /> Add New App{" "}
            </button>
          )}{" "}
        </div>{" "}
      </div>{" "}
      {filteredApps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          {" "}
          <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
            {" "}
            <Layout className="h-10 w-10" />{" "}
          </div>{" "}
          <div className="space-y-1">
            {" "}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No apps found
            </h3>{" "}
            <p className="text-sm text-slate-500">
              Start by adding your team's common tools and credentials.
            </p>{" "}
          </div>{" "}
          {true && (
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="rounded-xl"
            >
              {" "}
              Add First App{" "}
            </Button>
          )}{" "}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {" "}
          {filteredApps.map((app) => (
            <Card
              key={app.id}
              className=" glass-card text-slate-900 dark:text-slate-100 hover:border-blue-500/30 transition-all group overflow-hidden"
            >
              {" "}
              <CardContent className="p-0">
                {" "}
                <div
                  onClick={() => handleAppClick(app.url)}
                  className="p-8 space-y-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  {" "}
                  <div className="flex items-start justify-between">
                    {" "}
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                      {" "}
                      {app.name.charAt(0)}{" "}
                    </div>{" "}
                    <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />{" "}
                  </div>{" "}
                  <div className="space-y-1">
                    {" "}
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {app.name}
                    </h3>{" "}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      {" "}
                      <Globe className="h-3 w-3" />{" "}
                      <span className="truncate max-w-[200px]">
                        {app.url}
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="px-8 pb-8 space-y-4">
                  {" "}
                  <div className="space-y-3">
                    {" "}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                      {" "}
                      <div className="flex items-center gap-3">
                        {" "}
                        <User className="h-4 w-4 text-slate-400" />{" "}
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {app.loginId}
                        </span>{" "}
                      </div>{" "}
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Login ID
                      </span>{" "}
                    </div>{" "}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                      {" "}
                      <div className="flex items-center gap-3">
                        {" "}
                        <Lock className="h-4 w-4 text-slate-400" />{" "}
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {" "}
                          {showPasswords[app.id]
                            ? app.password
                            : "••••••••"}{" "}
                        </span>{" "}
                      </div>{" "}
                      <button
                        onClick={() => togglePassword(app.id)}
                        className="text-slate-400 hover:text-blue-500 transition-colors"
                      >
                        {" "}
                        {showPasswords[app.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}{" "}
                      </button>{" "}
                    </div>{" "}
                  </div>{" "}
                  {true && (
                    <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                      {" "}
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="w-full py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                      >
                        {" "}
                        <Trash2 className="h-4 w-4" /> Remove Integration{" "}
                      </button>{" "}
                    </div>
                  )}{" "}
                </div>{" "}
              </CardContent>{" "}
            </Card>
          ))}{" "}
        </div>
      )}{" "}
      {/* Add App Modal */}{" "}
      <AnimatePresence>
        {" "}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {" "}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />{" "}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-card text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl overflow-hidden"
            >
              {" "}
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                {" "}
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Add Team App
                </h2>{" "}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                  {" "}
                  <X className="h-5 w-5 text-slate-400" />{" "}
                </button>{" "}
              </div>{" "}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {" "}
                <div className="space-y-2">
                  {" "}
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    App Name
                  </label>{" "}
                  <input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="e.g. GitHub, Slack, Jira"
                  />{" "}
                </div>{" "}
                <div className="space-y-2">
                  {" "}
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    App URL
                  </label>{" "}
                  <input
                    required
                    type="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, url: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="https://app.example.com"
                  />{" "}
                </div>{" "}
                <div className="space-y-2">
                  {" "}
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Login ID / Username
                  </label>{" "}
                  <input
                    required
                    value={formData.loginId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        loginId: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="team-account@example.com"
                  />{" "}
                </div>{" "}
                <div className="space-y-2">
                  {" "}
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Password
                  </label>{" "}
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="••••••••"
                  />{" "}
                </div>{" "}
                <div className="flex gap-3 pt-4">
                  {" "}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-12 rounded-2xl"
                  >
                    {" "}
                    Cancel{" "}
                  </Button>{" "}
                  <Button type="submit" className="flex-1 h-12 rounded-2xl">
                    {" "}
                    Add Integration{" "}
                  </Button>{" "}
                </div>{" "}
              </form>{" "}
            </motion.div>{" "}
          </div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
}
