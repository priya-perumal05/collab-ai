import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import {
  Shield,
  Lock,
  Eye,
  History,
  UserCheck,
  Settings,
  Search,
  AlertTriangle,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useData } from "../hooks/useData";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  setDoc,
  serverTimestamp,
  addDoc,
  collection,
} from "firebase/firestore";
export default function Protection() {
  const { users, securityLogs, teamSettings, loading } = useData();
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const isLead = userProfile?.role === "Team Lead";
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase()),
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
  const handleRoleChange = async (
    userId: string,
    userName: string,
    newRole: string,
  ) => {
    if (!isLead) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      await logAction(`Changed role of ${userName} to ${newRole}`, "security");
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  const handleToggle = async (
    key: keyof Omit<typeof teamSettings, "id" | "teamId">,
  ) => {
    if (!isLead || !teamSettings || !userProfile?.teamId) return;
    const newValue = !teamSettings[key];
    try {
      await setDoc(
        doc(db, "teamSettings", userProfile.teamId),
        { ...teamSettings, [key]: newValue },
        { merge: true },
      );
      await logAction(`Toggled ${key} to ${newValue}`, "security");
    } catch (error) {
      console.error("Error updating toggle:", error);
    }
  };
  const getSecurityScore = () => {
    if (!teamSettings) return 50;
    let score = 60;
    if (teamSettings.twoFactorRequired) score += 20;
    if (!teamSettings.publicAccess) score += 10;
    if (teamSettings.apiAccess) score += 5;
    if (teamSettings.fileSharing) score += 5;
    return Math.min(score, 100);
  };
  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading security data...
      </div>
    );
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {" "}
      <div className="flex flex-wrap items-center justify-between gap-6">
        {" "}
        <div className="space-y-1">
          {" "}
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Security & Protection
          </h1>{" "}
          <p className="text-slate-500 dark:text-slate-400">
            Manage team access, roles, and monitor activity logs
          </p>{" "}
        </div>{" "}
        <button
          onClick={() => logAction("Manual security audit triggered", "system")}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20 transition-all"
        >
          {" "}
          <Shield className="h-5 w-5" /> Security Audit{" "}
        </button>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {" "}
        <div className="lg:col-span-2 space-y-8">
          {" "}
          <Card className="">
            {" "}
            <CardHeader className="flex flex-row items-center justify-between">
              {" "}
              <CardTitle className="text-xl font-bold">
                Team Access Control
              </CardTitle>{" "}
              <div className="relative group">
                {" "}
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />{" "}
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border-none text-xs focus:ring-2 focus:ring-blue-500/50 transition-all w-48"
                />{" "}
              </div>{" "}
            </CardHeader>{" "}
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-100 dark:border-white/5">
                      <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Member
                      </th>
                      <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Current Role
                      </th>
                      <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Department
                      </th>
                      <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xs">
                              {user.name.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge
                            variant={
                              user.role === "Team Lead"
                                ? "default"
                                : "secondary"
                            }
                            className="rounded-lg"
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-4 text-sm text-slate-500">
                          {user.department}
                        </td>
                        <td className="py-4 text-right">
                          {isLead && user.id !== userProfile?.uid && (
                            <div className="relative inline-block group/menu">
                              <button className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors flex items-center gap-1">
                                <Settings className="h-4 w-4" />
                                <ChevronDown className="h-3 w-3" />
                              </button>
                              <div className="absolute right-0 top-full mt-1 w-40 glass-card text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl border border-slate-100 dark:border-white/5 py-2 z-50 hidden group-hover/menu:block">
                                {["Team Lead", "Team Member"].map((role) => (
                                  <button
                                    key={role}
                                    disabled={isUpdating}
                                    onClick={() =>
                                      handleRoleChange(user.id, user.name, role)
                                    }
                                    className={cn(
                                      "w-full px-4 py-2 text-left text-xs font-bold transition-colors",
                                      user.role === role
                                        ? "text-blue-600 bg-blue-50 dark:bg-blue-500/10"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5",
                                    )}
                                  >
                                    Set as {role}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>{" "}
          </Card>{" "}
          <Card className="">
            {" "}
            <CardHeader>
              {" "}
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                {" "}
                <Activity className="h-6 w-6 text-blue-500" /> Live Activity
                Logs{" "}
              </CardTitle>{" "}
            </CardHeader>{" "}
            <CardContent className="space-y-4">
              {" "}
              {securityLogs.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm">
                  No activity logs recorded yet.
                </div>
              ) : (
                securityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group"
                  >
                    {" "}
                    <div className="flex items-center gap-4">
                      {" "}
                      <div
                        className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center",
                          log.type === "security"
                            ? "bg-blue-500/10 text-blue-500"
                            : log.type === "warning"
                              ? "bg-red-500/10 text-red-500"
                              : log.type === "auth"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-slate-500/10 text-slate-500",
                        )}
                      >
                        {" "}
                        {log.type === "security" ? (
                          <Shield className="h-5 w-5" />
                        ) : log.type === "warning" ? (
                          <ShieldAlert className="h-5 w-5" />
                        ) : log.type === "auth" ? (
                          <ShieldCheck className="h-5 w-5" />
                        ) : (
                          <Activity className="h-5 w-5" />
                        )}{" "}
                      </div>{" "}
                      <div>
                        <p className="text-base font-semibold font-display tracking-tight text-slate-800 dark:text-slate-200 flex flex-wrap items-center gap-1.5">
                          <span className="text-blue-600 dark:text-blue-400">
                            {log.userName}
                          </span>
                          <span className="opacity-90">
                            {log.action}
                          </span>
                        </p>
                        <p className="text-[11px] font-mono font-medium text-slate-400/80 uppercase tracking-widest mt-0.5">
                          {log.createdAt?.toDate().toLocaleString(undefined, {month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit'}) ||
                            "Just now"}
                        </p>
                      </div>{" "}
                    </div>{" "}
                  </div>
                ))
              )}{" "}
            </CardContent>{" "}
          </Card>{" "}
        </div>{" "}
        <div className="space-y-8">
          {" "}
          <Card className=" bg-blue-600 text-white overflow-hidden relative">
            {" "}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 bg-white/10 rounded-full blur-3xl" />{" "}
            <CardContent className="p-8 space-y-6 relative">
              {" "}
              <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                {" "}
                <Shield className="h-7 w-7" />{" "}
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <h3 className="text-2xl font-bold">Security Score</h3>{" "}
                <div className="flex items-end gap-2">
                  {" "}
                  <span className="text-2xl md:text-2xl md:text-4xl font-bold">
                    {getSecurityScore()}%
                  </span>{" "}
                  <span className="text-blue-200 text-sm mb-1">
                    Protected
                  </span>{" "}
                </div>{" "}
                <p className="text-blue-100 text-sm leading-relaxed">
                  {" "}
                  {getSecurityScore() < 100
                    ? `Enable ${!teamSettings?.twoFactorRequired ? "2FA" : "more policies"} to reach 100%.`
                    : "Your team environment is fully hardened."}{" "}
                </p>{" "}
              </div>{" "}
              <Progress
                value={getSecurityScore()}
                indicatorClassName="bg-white"
                className="h-2 bg-white/20"
              />{" "}
            </CardContent>{" "}
          </Card>{" "}
          <Card className="">
            {" "}
            <CardHeader>
              {" "}
              <CardTitle className="text-lg font-bold">
                Security Policies
              </CardTitle>{" "}
            </CardHeader>{" "}
            <CardContent className="space-y-6">
              {" "}
              {[
                {
                  key: "publicAccess",
                  label: "Public Access",
                  desc: "Allow non-team members to view",
                },
                {
                  key: "fileSharing",
                  label: "File Sharing",
                  desc: "Allow members to upload files",
                },
                {
                  key: "apiAccess",
                  label: "API Access",
                  desc: "Enable external API integrations",
                },
                {
                  key: "twoFactorRequired",
                  label: "Require 2FA",
                  desc: "Force 2FA for all members",
                },
              ].map((toggle) => {
                const isActive = teamSettings
                  ? (teamSettings as any)[toggle.key]
                  : false;
                return (
                  <div
                    key={toggle.key}
                    className="flex items-center justify-between"
                  >
                    {" "}
                    <div className="space-y-1">
                      {" "}
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {toggle.label}
                      </p>{" "}
                      <p className="text-xs text-slate-500">
                        {toggle.desc}
                      </p>{" "}
                    </div>{" "}
                    <div
                      onClick={() => handleToggle(toggle.key as any)}
                      className={cn(
                        "w-12 h-6 rounded-full p-1 cursor-pointer transition-all duration-300",
                        !isLead && "opacity-50 cursor-not-allowed",
                        isActive
                          ? "bg-blue-600"
                          : "bg-slate-200 dark:bg-white/10",
                      )}
                    >
                      {" "}
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full bg-white transition-transform duration-300 shadow-sm",
                          isActive ? "translate-x-6" : "translate-x-0",
                        )}
                      />{" "}
                    </div>{" "}
                  </div>
                );
              })}{" "}
            </CardContent>{" "}
          </Card>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
