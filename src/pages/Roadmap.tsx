import React, { useState, useMemo } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import {
  Calendar,
  Milestone,
  ZoomIn,
  ZoomOut,
  Users,
  Plus,
  Trash2,
  Check,
  X,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useData } from "../hooks/useData";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
interface RoadTask {
  id: string;
  title: string;
  date: string;
  status: "todo" | "in-progress" | "done";
}
interface Phase {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  members: number;
  tasks: RoadTask[];
  order: number;
  teamId: string;
}
export default function Roadmap() {
  const { roadmapPhases, loading } = useData();
  const { userProfile } = useAuth();
  const [view, setView] = useState<"weekly" | "monthly" | "quarterly">(
    "monthly",
  );
  const [filter, setFilter] = useState<string>("all");
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>(
    {},
  );
  const calculateProgress = (tasks: RoadTask[]) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    return Math.round(((completed + inProgress * 0.5) / tasks.length) * 100);
  };
  const getPhaseStatus = (tasks: RoadTask[]) => {
    if (!tasks || tasks.length === 0) return "todo";
    const allDone = tasks.every((t) => t.status === "done");
    if (allDone) return "completed";
    const anyStarted = tasks.some((t) => t.status !== "todo");
    if (anyStarted) return "in-progress";
    return "todo";
  };
  const filteredPhases = useMemo(() => {
    if (filter === "all") return roadmapPhases;
    return roadmapPhases.filter((p) => getPhaseStatus(p.tasks) === filter);
  }, [roadmapPhases, filter]);
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    if (view === "weekly")
      return `W${Math.ceil(new Date(dateStr).getDate() / 7)} ${dateStr}`;
    if (view === "quarterly")
      return `Q${Math.ceil((new Date(dateStr).getMonth() + 1) / 3)} ${dateStr}`;
    return dateStr;
  };
  const addPhase = async () => {
    if (!userProfile?.teamId) return;
    try {
      await addDoc(collection(db, "roadmapPhases"), {
        title: "New Phase",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        members: 1,
        tasks: [],
        order: roadmapPhases.length,
        teamId: userProfile.teamId,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding phase:", error);
    }
  };
  const updatePhase = async (id: string, updates: Partial<Phase>) => {
    try {
      await updateDoc(doc(db, "roadmapPhases", id), updates);
    } catch (error) {
      console.error("Error updating phase:", error);
    }
  };
  const deletePhase = async (id: string) => {
    try {
      await deleteDoc(doc(db, "roadmapPhases", id));
    } catch (error) {
      console.error("Error deleting phase:", error);
    }
  };
  const addTask = async (phaseId: string) => {
    const phase = roadmapPhases.find((p) => p.id === phaseId);
    if (!phase) return;
    const newTask: RoadTask = {
      id: `task-${Date.now()}`,
      title: "New Task",
      date: new Date().toISOString().split("T")[0],
      status: "todo",
    };
    try {
      await updateDoc(doc(db, "roadmapPhases", phaseId), {
        tasks: [...(phase.tasks || []), newTask],
      });
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };
  const updateTask = async (
    phaseId: string,
    taskId: string,
    updates: Partial<RoadTask>,
  ) => {
    const phase = roadmapPhases.find((p) => p.id === phaseId);
    if (!phase) return;
    const newTasks = phase.tasks.map((t: RoadTask) =>
      t.id === taskId ? { ...t, ...updates } : t,
    );
    try {
      await updateDoc(doc(db, "roadmapPhases", phaseId), { tasks: newTasks });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  const deleteTask = async (phaseId: string, taskId: string) => {
    const phase = roadmapPhases.find((p) => p.id === phaseId);
    if (!phase) return;
    const newTasks = phase.tasks.filter((t: RoadTask) => t.id !== taskId);
    try {
      await updateDoc(doc(db, "roadmapPhases", phaseId), { tasks: newTasks });
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };
  const toggleExpand = (id: string) => {
    setExpandedPhases((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        {" "}
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />{" "}
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
          Loading Roadmap...
        </p>{" "}
      </div>
    );
  }
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {" "}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        {" "}
        <div className="space-y-1">
          {" "}
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Project Roadmap
          </h1>{" "}
          <p className="text-slate-500 dark:text-slate-400">
            Visual timeline and strategic planning
          </p>{" "}
        </div>{" "}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          {" "}
          <div className="flex items-center gap-3 glass-card text-slate-900 dark:text-slate-100 p-1 rounded-2xl flex-1 sm:flex-initial justify-between sm:justify-start">
            {" "}
            <button
              onClick={() =>
                setView((v) =>
                  v === "weekly"
                    ? "monthly"
                    : v === "monthly"
                      ? "quarterly"
                      : "weekly",
                )
              }
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors"
            >
              {" "}
              <ZoomOut className="h-5 w-5" />{" "}
            </button>{" "}
            <span className="text-xs font-bold px-2 capitalize min-w-[60px] text-center">
              {view}
            </span>{" "}
            <button
              onClick={() =>
                setView((v) =>
                  v === "quarterly"
                    ? "monthly"
                    : v === "monthly"
                      ? "weekly"
                      : "quarterly",
                )
              }
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors"
            >
              {" "}
              <ZoomIn className="h-5 w-5" />{" "}
            </button>{" "}
            <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1" />{" "}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer px-2"
            >
              {" "}
              <option value="all">All Phases</option>{" "}
              <option value="completed">Completed</option>{" "}
              <option value="in-progress">In Progress</option>{" "}
              <option value="todo">To Do</option>{" "}
            </select>{" "}
          </div>{" "}
          <button
            onClick={addPhase}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20 transition-all"
          >
            {" "}
            <Plus className="h-5 w-5" /> Add Phase{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="relative space-y-6 md:space-y-12">
        {" "}
        <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-slate-200 dark:bg-white/10" />{" "}
        {filteredPhases.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 md:py-20 text-center">
            {" "}
            <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6">
              {" "}
              <Milestone className="h-10 w-10 text-slate-400" />{" "}
            </div>{" "}
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No Phases Found
            </h3>{" "}
            <p className="text-slate-500 dark:text-slate-400 max-w-xs">
              {" "}
              Start by adding a new phase to your project roadmap to visualize
              your timeline.{" "}
            </p>{" "}
          </div>
        )}{" "}
        {filteredPhases.map((phase) => (
          <div key={phase.id} className="relative pl-10 md:pl-20 group">
            {" "}
            <div
              className={cn(
                "absolute left-2.5 md:left-6 top-0 h-4 w-4 rounded-full border-4 border-white dark:border-[#0A0B0D] z-10 transition-transform group-hover:scale-125",
                getPhaseStatus(phase.tasks) === "completed"
                  ? "bg-emerald-500"
                  : getPhaseStatus(phase.tasks) === "in-progress"
                    ? "bg-blue-500"
                    : "bg-slate-300 dark:bg-slate-700",
              )}
            />{" "}
            <Card className="hover:border-blue-500/30 transition-all overflow-hidden">
              {" "}
              <CardContent className="p-0">
                {" "}
                <div className="p-4 md:p-8">
                  {" "}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-8">
                    {" "}
                    <div className="flex-1 space-y-2">
                      {" "}
                      <div className="flex items-center gap-3">
                        {" "}
                        <EditableText
                          value={phase.title}
                          onSave={(val) =>
                            updatePhase(phase.id, { title: val })
                          }
                          className="text-xl font-bold text-slate-900 dark:text-white"
                        />{" "}
                        <button
                          onClick={() => deletePhase(phase.id)}
                          className="p-1.5 sm:opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                        >
                          {" "}
                          <Trash2 className="h-4 w-4" />{" "}
                        </button>{" "}
                      </div>{" "}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 sm:mt-0">
                        {" "}
                        <span className="flex items-center gap-1.5">
                          {" "}
                          <Calendar className="h-3.5 w-3.5" />{" "}
                          <div className="flex items-center gap-1">
                            {" "}
                            <EditableText
                              type="date"
                              value={phase.startDate}
                              displayValue={formatDate(phase.startDate)}
                              onSave={(val) =>
                                updatePhase(phase.id, { startDate: val })
                              }
                            />{" "}
                            <span>-</span>{" "}
                            <EditableText
                              type="date"
                              value={phase.endDate}
                              displayValue={formatDate(phase.endDate)}
                              onSave={(val) =>
                                updatePhase(phase.id, { endDate: val })
                              }
                            />{" "}
                          </div>{" "}
                        </span>{" "}
                        <span className="flex items-center gap-1.5">
                          {" "}
                          <Users className="h-3.5 w-3.5" />{" "}
                          <EditableText
                            type="number"
                            value={`${phase.members}`}
                            displayValue={`${phase.members} Members`}
                            onSave={(val) =>
                              updatePhase(phase.id, {
                                members: parseInt(val) || 0,
                              })
                            }
                          />{" "}
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="flex items-center justify-between sm:justify-end gap-8 pt-4 sm:pt-0 border-t border-slate-200 dark:border-white/10 sm:border-0 w-full sm:w-auto mt-2 sm:mt-0">
                      {" "}
                      <div className="text-left sm:text-right space-y-2">
                        {" "}
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {calculateProgress(phase.tasks)}%
                        </div>{" "}
                        <Progress
                          value={calculateProgress(phase.tasks)}
                          className="w-32 h-2"
                        />{" "}
                      </div>{" "}
                      <button
                        onClick={() => toggleExpand(phase.id)}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-colors"
                      >
                        {" "}
                        {expandedPhases[phase.id] ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}{" "}
                      </button>{" "}
                    </div>{" "}
                  </div>{" "}
                  <AnimatePresence>
                    {" "}
                    {expandedPhases[phase.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4"
                      >
                        {" "}
                        {(phase.tasks || []).map((task: RoadTask) => (
                          <div
                            key={task.id}
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-col gap-3 group/ms hover:border-blue-500/30 transition-all"
                          >
                            {" "}
                            <div className="flex items-center justify-between">
                              {" "}
                              <div className="flex items-center gap-3">
                                {" "}
                                <div
                                  onClick={() => {
                                    const nextStatus =
                                      task.status === "todo"
                                        ? "in-progress"
                                        : task.status === "in-progress"
                                          ? "done"
                                          : "todo";
                                    updateTask(phase.id, task.id, {
                                      status: nextStatus,
                                    });
                                  }}
                                  className={cn(
                                    "h-8 w-8 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-110",
                                    task.status === "done"
                                      ? "bg-emerald-500/10 text-emerald-500"
                                      : task.status === "in-progress"
                                        ? "bg-blue-500/10 text-blue-500"
                                        : "bg-slate-200 dark:bg-white/10 text-slate-400",
                                  )}
                                >
                                  {" "}
                                  <Milestone className="h-4 w-4" />{" "}
                                </div>{" "}
                                <div className="flex flex-col min-w-0">
                                  {" "}
                                  <EditableText
                                    value={task.title}
                                    onSave={(val) =>
                                      updateTask(phase.id, task.id, {
                                        title: val,
                                      })
                                    }
                                    className="text-sm font-bold text-slate-900 dark:text-white truncate"
                                  />{" "}
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {formatDate(task.date)}
                                  </span>{" "}
                                </div>{" "}
                              </div>{" "}
                              <button
                                onClick={() => deleteTask(phase.id, task.id)}
                                className="p-1.5 sm:opacity-0 group-hover/ms:opacity-100 text-slate-400 hover:text-red-500 transition-all font-bold shrink-0 ml-2"
                              >
                                {" "}
                                <Trash2 className="h-4 w-4" />{" "}
                              </button>{" "}
                            </div>{" "}
                          </div>
                        ))}{" "}
                        <button
                          onClick={() => addTask(phase.id)}
                          className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 text-slate-400 hover:text-blue-500 hover:border-blue-500/30 transition-all group/add"
                        >
                          {" "}
                          <Plus className="h-4 w-4 group-hover/add:scale-110 transition-transform" />{" "}
                          <span className="text-xs font-bold">
                            Add Task
                          </span>{" "}
                        </button>{" "}
                      </motion.div>
                    )}{" "}
                  </AnimatePresence>{" "}
                </div>{" "}
              </CardContent>{" "}
            </Card>{" "}
          </div>
        ))}{" "}
      </div>{" "}
    </div>
  );
}
interface EditableTextProps {
  value: string;
  displayValue?: string;
  onSave: (val: string) => void;
  className?: string;
  type?: "text" | "date" | "number";
}
function EditableText({
  value,
  displayValue,
  onSave,
  className,
  type = "text",
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
  };
  if (isEditing) {
    return (
      <div
        className="flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {" "}
        <input
          autoFocus
          type={type}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className={cn(
            "glass-card text-slate-900 dark:text-slate-100 border border-blue-500/50 rounded px-2 py-0.5 outline-none text-sm w-full",
            className,
          )}
        />{" "}
      </div>
    );
  }
  return (
    <span
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer hover:text-blue-500 transition-colors",
        className,
      )}
    >
      {" "}
      {displayValue || value}{" "}
    </span>
  );
}
