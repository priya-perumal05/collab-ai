import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { Progress } from "../components/ui/Progress";
import { format, parseISO, isPast } from "date-fns";
import {
  MessageSquare,
  Clock,
  AlertCircle,
  MoreVertical,
  Filter,
  Plus,
  CheckCircle2 as CheckIcon,
  Pause,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Status, Task } from "../types";
import { useData } from "../hooks/useData";
import { useAuth } from "../contexts/AuthContext";
import { TaskModal } from "../components/ui/TaskModal";
import { TaskDetailsModal } from "../components/ui/TaskDetailsModal";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
export function Tasks() {
  const { tasks, users, loading } = useData();
  const { userProfile } = useAuth();
  const [view, setView] = useState<"board" | "list">("board");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };
  const handleStatusUpdate = async (taskId: string, newStatus: Status) => {
    setUpdatingId(taskId);
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, {
        status: newStatus,
        progress: newStatus === "done" ? 100 : undefined,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating task status:", error);
    } finally {
      setUpdatingId(null);
    }
  };
  const columns: { id: Status; label: string; color: string }[] = [
    { id: "todo", label: "New", color: "bg-brand-green" },
    { id: "in-progress", label: "In Progress", color: "bg-brand-pink" },
    { id: "review", label: "Review", color: "bg-brand-blue" },
    { id: "done", label: "Personal", color: "bg-cyan-500" },
  ];
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
        Loading tasks...
      </div>
    );
  }
  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
      {" "}
      {/* Project Header */}{" "}
      <div className="space-y-4">
        {" "}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          {" "}
          <span>Projects MT</span> <span>/</span>{" "}
          <span>Commercial Projects</span> <span>/</span>{" "}
          <span className="text-slate-600 dark:text-slate-300">
            Team Phoenix
          </span>{" "}
        </div>{" "}
        <div className="flex flex-wrap items-end justify-between gap-6">
          {" "}
          <div className="space-y-6">
            {" "}
            <h1 className="text-2xl md:text-2xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              {" "}
              Creating an application for aero.com{" "}
            </h1>{" "}
            <div className="flex items-center gap-6">
              {" "}
              <div className="flex items-center gap-3">
                {" "}
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  All team members:{" "}
                  <span className="text-blue-600 dark:text-blue-400">12</span>
                </span>{" "}
                <div className="flex -space-x-3">
                  {" "}
                  {users.slice(0, 5).map((user, i) => (
                    <Avatar
                      key={i}
                      fallback={user.name.charAt(0)}
                      size="sm"
                      className="border-2 border-white dark:border-[#0A0B0D]"
                    />
                  ))}{" "}
                  <button className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/5 border-2 border-white dark:border-[#0A0B0D] flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {" "}
                    +7{" "}
                  </button>{" "}
                </div>{" "}
                <button className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity ml-2">
                  {" "}
                  <div className="h-8 w-8 rounded-full border-2 border-dashed border-blue-600/30 dark:border-blue-400/30 flex items-center justify-center">
                    {" "}
                    <Plus className="h-4 w-4" />{" "}
                  </div>{" "}
                  Invite{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="flex items-center gap-2 glass-card text-slate-900 dark:text-slate-100 p-1 rounded-2xl ">
              {" "}
              <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white">
                {" "}
                <Pause className="h-5 w-5" />{" "}
              </button>{" "}
              <button className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                {" "}
                <LayoutDashboard className="h-5 w-5" />{" "}
              </button>{" "}
              <button className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                {" "}
                <MoreVertical className="h-5 w-5" />{" "}
              </button>{" "}
            </div>{" "}
            <div className="flex items-center gap-2 glass-card text-slate-900 dark:text-slate-100 p-1 rounded-2xl ">
              {" "}
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                {" "}
                <Filter className="h-4 w-4" /> Filter{" "}
                <ChevronDown className="h-4 w-4 opacity-50" />{" "}
              </button>{" "}
            </div>{" "}
            <div className="flex items-center gap-2 glass-card text-slate-900 dark:text-slate-100 p-1 rounded-2xl ">
              {" "}
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                {" "}
                New from above{" "}
                <ChevronDown className="h-4 w-4 opacity-50" />{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Board View */}{" "}
      <div className="flex-1 overflow-x-auto pb-6 scrollbar-hide">
        {" "}
        <div className="flex gap-8 h-full min-w-max">
          {" "}
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="w-[400px] flex flex-col gap-6">
                {" "}
                <div className="flex items-center justify-between px-2">
                  {" "}
                  <div className="flex items-center gap-4">
                    {" "}
                    <Badge
                      className={cn(
                        "px-4 py-1.5 rounded-full text-white font-bold border-none",
                        col.color,
                      )}
                    >
                      {" "}
                      {col.label}{" "}
                    </Badge>{" "}
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                      {" "}
                      <div className="flex items-center gap-1.5">
                        {" "}
                        <CheckIcon className="h-3.5 w-3.5" /> {colTasks.length}{" "}
                        Task{" "}
                      </div>{" "}
                      <div className="flex items-center gap-1.5">
                        {" "}
                        <Clock className="h-3.5 w-3.5" /> {colTasks.length * 24}{" "}
                        Hours{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    {" "}
                    <MoreVertical className="h-5 w-5" />{" "}
                  </button>{" "}
                </div>{" "}
                <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                  {" "}
                  {colTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="group cursor-pointer hover:border-blue-500/30 dark:hover:border-blue-500/20 transition-all duration-300"
                      onClick={() => handleTaskClick(task)}
                    >
                      {" "}
                      <CardContent className="p-6 space-y-6">
                        {" "}
                        <div className="flex items-center justify-between">
                          {" "}
                          <div className="flex gap-2">
                            {" "}
                            <Badge
                              variant="secondary"
                              className="bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-none px-3 py-1"
                            >
                              {" "}
                              Task list{" "}
                            </Badge>{" "}
                            <Badge
                              variant="secondary"
                              className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none px-3 py-1"
                            >
                              {" "}
                              Personal{" "}
                            </Badge>{" "}
                          </div>{" "}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); /* Add task logic */
                            }}
                            className="h-8 flex items-center gap-1.5 px-3 rounded-xl bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                          >
                            {" "}
                            <Plus className="h-3 w-3" /> ADD{" "}
                          </button>{" "}
                        </div>{" "}
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                          {" "}
                          {task.title}{" "}
                        </h3>{" "}
                        {/* Responsible & Tasks Info */}{" "}
                        <div className="grid grid-cols-2 gap-4">
                          {" "}
                          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                            {" "}
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                              Responsible
                            </p>{" "}
                            <div className="flex items-center gap-2">
                              {" "}
                              <Avatar
                                fallback={
                                  users
                                    .find((u) => u.id === task.assignees[0])
                                    ?.name.charAt(0) || "?"
                                }
                                size="sm"
                              />{" "}
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase truncate">
                                {" "}
                                {users.find((u) => u.id === task.assignees[0])
                                  ?.name || "Unassigned"}{" "}
                              </span>{" "}
                            </div>{" "}
                          </div>{" "}
                          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
                            {" "}
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                              Tasks
                            </p>{" "}
                            <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                              24
                            </span>{" "}
                            <div className="absolute top-0 right-0 w-12 h-12 bg-pink-500/10 rounded-bl-full" />{" "}
                          </div>{" "}
                        </div>{" "}
                        {/* Checklist Placeholder */}{" "}
                        <div className="space-y-3">
                          {" "}
                          {[
                            { label: "Make a business plan", checked: true },
                            { label: "Find a programmer", checked: true },
                            { label: "Find an accountant", checked: false },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              {" "}
                              <div
                                className={cn(
                                  "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                  item.checked
                                    ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white"
                                    : "border-slate-300 dark:border-white/20",
                                )}
                              >
                                {" "}
                                {item.checked && (
                                  <CheckIcon className="h-3 w-3 text-white dark:text-slate-900" />
                                )}{" "}
                              </div>{" "}
                              <span
                                className={cn(
                                  "text-sm font-medium transition-colors",
                                  item.checked
                                    ? "text-slate-400 line-through"
                                    : "text-slate-600 dark:text-slate-300",
                                )}
                              >
                                {" "}
                                {item.label}{" "}
                              </span>{" "}
                            </div>
                          ))}{" "}
                        </div>{" "}
                        <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                          {" "}
                          <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            {" "}
                            Expand list{" "}
                            <ChevronDown className="h-3.5 w-3.5" />{" "}
                          </button>{" "}
                          <div className="flex items-center gap-1.5 text-xs font-bold text-pink-500">
                            {" "}
                            <MessageSquare className="h-4 w-4" /> 19
                            comments{" "}
                          </div>{" "}
                        </div>{" "}
                      </CardContent>{" "}
                    </Card>
                  ))}{" "}
                  {colTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl">
                      {" "}
                      <Plus className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />{" "}
                      <p className="text-sm font-bold text-slate-400">
                        No tasks in this stage
                      </p>{" "}
                    </div>
                  )}{" "}
                </div>{" "}
              </div>
            );
          })}{" "}
        </div>{" "}
      </div>{" "}
      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />{" "}
      <TaskDetailsModal
        task={selectedTask}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />{" "}
    </div>
  );
}
