import React, { useState } from "react";
import { useData } from "../hooks/useData";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase";
import {
  Building2,
  Heart,
  Zap,
  CheckCircle2,
  Plus,
  X,
  Code2,
  TrendingUp,
  Activity,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "../lib/utils";
export default function TeamDetails() {
  const { users, tasks } = useData();
  const { userProfile } = useAuth();
  const [newSkill, setNewSkill] = useState<{ [userId: string]: string }>({});
  const handleAddSkill = async (userId: string) => {
    const skill = newSkill[userId]?.trim();
    if (!skill) return;
    try {
      await updateDoc(doc(db, "users", userId), { skills: arrayUnion(skill) });
      setNewSkill((prev) => ({ ...prev, [userId]: "" }));
    } catch (e) {
      console.error("Error adding skill:", e);
    }
  };
  const handleRemoveSkill = async (userId: string, skill: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { skills: arrayRemove(skill) });
    } catch (e) {
      console.error("Error removing skill:", e);
    }
  };
  return (
    <div className="h-full flex flex-col space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      {" "}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
        {" "}
        <div className="space-y-2">
          {" "}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide uppercase">
            {" "}
            <UsersIcon className="h-4 w-4" /> Team Roster{" "}
          </div>{" "}
          <h1 className="text-2xl md:text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Team Details
          </h1>{" "}
          <p className="text-slate-500 dark:text-slate-400 max-w-xl text-sm leading-relaxed">
            {" "}
            A comprehensive overview of your team members, their
            cross-functional expertise, and performance metrics across current
            projects.{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {" "}
        {users.map((user) => {
          const userTasks = tasks.filter((t) => t.assignees.includes(user.id));
          const completedTasks = userTasks.filter(
            (t) => t.status === "done",
          ).length;
          const isMe = user.id === userProfile?.uid;
          return (
            <Card
              key={user.id}
              className="group relative overflow-hidden glass-card text-slate-900 dark:text-slate-100/50 border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-500 rounded-3xl"
            >
              {" "}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />{" "}
              <CardContent className="p-0">
                {" "}
                {/* Header Section */}{" "}
                <div className="p-8 pb-6 flex items-start justify-between relative">
                  {" "}
                  <div className="flex items-center gap-5 relative z-10">
                    {" "}
                    <div className="relative">
                      {" "}
                      <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity duration-500" />{" "}
                      <Avatar
                        src={user.avatar}
                        fallback={user.name.charAt(0)}
                        size="lg"
                        className="relative h-16 w-16 border-2 border-white dark:border-slate-900 shadow-md"
                      />{" "}
                    </div>{" "}
                    <div className="space-y-1">
                      {" "}
                      <div className="flex items-center gap-2">
                        {" "}
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                          {" "}
                          {user.name}{" "}
                        </h3>{" "}
                        {isMe && (
                          <Badge
                            variant="outline"
                            className="text-[9px] uppercase tracking-wider py-0 max-h-5 bg-blue-500/10 border-blue-500/20 text-blue-600"
                          >
                            You
                          </Badge>
                        )}{" "}
                      </div>{" "}
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        {" "}
                        <Building2 className="h-3.5 w-3.5" />{" "}
                        {user.department}{" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <Badge
                    variant={
                      user.role === "Team Lead" ? "default" : "secondary"
                    }
                    className="rounded-xl px-3 py-1 shadow-sm font-medium text-xs"
                  >
                    {" "}
                    {user.role}{" "}
                  </Badge>{" "}
                </div>{" "}
                {/* Main Stats Grid */}
                <div className="px-4 md:px-8 py-5 border-y border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] grid grid-cols-3 gap-2 md:gap-6">
                  <div className="space-y-1.5 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <CheckCircle2 className="h-3 md:h-3.5 w-3 md:w-3.5 hidden sm:block" />
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-center sm:text-left">
                        Tasks
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 justify-center sm:justify-start">
                      <span className="text-sm sm:text-xl font-bold font-mono text-slate-900 dark:text-white">
                        {completedTasks}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        / {userTasks.length}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 border-l border-slate-200 dark:border-white/10 pl-2 md:pl-6 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <TrendingUp className="h-3 md:h-3.5 w-3 md:w-3.5 hidden sm:block" />
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-center sm:text-left">
                        Health
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 justify-center sm:justify-start">
                      <span className="text-sm sm:text-xl font-bold font-mono text-slate-900 dark:text-white">
                        {user.healthScore}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        %
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 border-l border-slate-200 dark:border-white/10 pl-2 md:pl-6 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Activity className="h-3 md:h-3.5 w-3 md:w-3.5 hidden sm:block" />
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-center sm:text-left">
                        Prod.
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 justify-center sm:justify-start">
                      <span className="text-sm sm:text-xl font-bold font-mono text-slate-900 dark:text-white">
                        {user.productivityScore}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        %
                      </span>
                    </div>
                  </div>
                </div>
                {/* Skills Section */}{" "}
                <div className="p-8 space-y-4">
                  {" "}
                  <div className="flex items-center justify-between">
                    {" "}
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                      {" "}
                      <Code2 className="h-4 w-4 text-blue-500" />{" "}
                      <span className="text-sm font-semibold">
                        Core Expertise
                      </span>{" "}
                    </div>{" "}
                    {isMe && (
                      <div className="flex items-center gap-2 group/input focus-within:ring-2 ring-blue-500/20 rounded-full px-2 py-1 bg-slate-100 dark:bg-white/5 transition-all">
                        {" "}
                        <input
                          type="text"
                          value={newSkill[user.id] || ""}
                          onChange={(e) =>
                            setNewSkill((prev) => ({
                              ...prev,
                              [user.id]: e.target.value,
                            }))
                          }
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleAddSkill(user.id)
                          }
                          placeholder="Add skill..."
                          className="text-xs bg-transparent border-none outline-none w-20 text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                        />{" "}
                        <button
                          onClick={() => handleAddSkill(user.id)}
                          className="text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          {" "}
                          <Plus className="h-4 w-4" />{" "}
                        </button>{" "}
                      </div>
                    )}{" "}
                  </div>{" "}
                  <div className="flex flex-wrap gap-2">
                    {" "}
                    {user.skills?.map((skill, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                      >
                        {" "}
                        {skill}{" "}
                        {isMe && (
                          <button
                            onClick={() => handleRemoveSkill(user.id, skill)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-0.5 rounded-full hover:bg-white dark:hover:bg-black/20"
                          >
                            {" "}
                            <X className="h-3 w-3" />{" "}
                          </button>
                        )}{" "}
                      </div>
                    ))}{" "}
                    {(!user.skills || user.skills.length === 0) && (
                      <span className="text-xs text-slate-400 italic">
                        No skills added yet.
                      </span>
                    )}{" "}
                  </div>{" "}
                </div>{" "}
                {/* Footer Metrics */}{" "}
                <div className="px-8 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 flex items-center justify-between mt-auto">
                  {" "}
                  <div className="flex gap-6">
                    {" "}
                    <div className="space-y-0.5">
                      {" "}
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Punctuality
                      </p>{" "}
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                        {user.punctuality}%
                      </p>{" "}
                    </div>{" "}
                    <div className="space-y-0.5 border-l border-slate-200 dark:border-white/10 pl-6">
                      {" "}
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Engagement
                      </p>{" "}
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                        {user.engagement}%
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <button className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all">
                    {" "}
                    <MoreHorizontal className="h-4 w-4" />{" "}
                  </button>{" "}
                </div>{" "}
              </CardContent>{" "}
            </Card>
          );
        })}{" "}
      </div>{" "}
    </div>
  );
}
function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {" "}
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />{" "}
      <circle cx="9" cy="7" r="4" /> <path d="M22 21v-2a4 4 0 0 0-3-3.87" />{" "}
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />{" "}
    </svg>
  );
}
