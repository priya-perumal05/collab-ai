import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { Progress } from "../components/ui/Progress";
import { Button } from "../components/ui/Button";
import { TaskDetailsModal } from "../components/ui/TaskDetailsModal";
import {
  Plus,
  MoreVertical,
  MessageSquare,
  Paperclip,
  Clock,
  Filter,
  Search,
  Layout,
  Trash2,
  Edit2,
  X,
  Check,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useData } from "../hooks/useData";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { Task, Priority, Status } from "../types";
export default function Board() {
  const { tasks, users } = useData();
  const { currentUser, userProfile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedViewTask, setSelectedViewTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    status: "todo" as Status,
    assignees: [] as string[],
    deadline: "",
    progress: 0,
    subtasks: [] as { id: string; title: string; completed: boolean }[],
  });
  const [newSubtask, setNewSubtask] = useState("");
  const isLead = userProfile?.role === "Team Lead";
  const columns = [
    { id: "todo", label: "To Do", color: "bg-blue-500" },
    { id: "in-progress", label: "In Progress", color: "bg-amber-500" },
    { id: "review", label: "Review", color: "bg-purple-500" },
    { id: "done", label: "Done", color: "bg-emerald-500" },
  ];
  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        assignees: task.assignees,
        deadline: task.deadline,
        progress: task.progress || 0,
        subtasks: task.subtasks || [],
      });
    } else {
      if (!isLead) return;
      setEditingTask(null);
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        assignees: [],
        deadline: new Date().toISOString().split("T")[0],
        progress: 0,
        subtasks: [],
      });
    }
    setIsModalOpen(true);
  };
  const calculateProgress = (subtasks: { completed: boolean }[]) => {
    if (subtasks.length === 0) return 0;
    const completed = subtasks.filter((s) => s.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  };
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
    const progress = calculateProgress(formData.subtasks);
    const data = { ...formData, progress, updatedAt: serverTimestamp() };
    try {
      if (editingTask) {
        await updateDoc(doc(db, "tasks", editingTask.id), data);
        await logAction(`Updated task: ${formData.title}`, "system");
      } else {
        if (!isLead) return;
        const now = new Date();
        const docRef = await addDoc(collection(db, "tasks"), {
          ...data,
          teamId: userProfile.teamId,
          creatorId: userProfile.uid,
          createdAt: serverTimestamp(),
          comments: [],
          riskLevel: "low",
        });
        await logAction(`Created new task: ${formData.title}`, "system");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };
  const handleDelete = async (taskId: string) => {
    if (!isLead) return;
    const task = tasks.find((t) => t.id === taskId);
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      await logAction(`Deleted task: ${task?.title || taskId}`, "warning");
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };
  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setFormData((prev) => ({
      ...prev,
      subtasks: [
        ...prev.subtasks,
        {
          id: Math.random().toString(36).substr(2, 9),
          title: newSubtask,
          completed: false,
        },
      ],
    }));
    setNewSubtask("");
  };
  const removeSubtask = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((s) => s.id !== id),
    }));
  };
  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updatedSubtasks = (task.subtasks || []).map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s,
    );
    const progress = calculateProgress(updatedSubtasks);
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        subtasks: updatedSubtasks,
        progress,
      });
    } catch (error) {
      console.error("Error updating subtask:", error);
    }
  };
  const toggleAssignee = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter((id) => id !== userId)
        : [...prev.assignees, userId],
    }));
  };
  return (
    <div className="h-full flex flex-col space-y-4 md:space-y-8 animate-in fade-in duration-500">
      {" "}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        {" "}
        <div className="space-y-1">
          {" "}
          <h1 className="text-2xl md:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Task Board
          </h1>{" "}
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
            Manage and track your team's workflow
          </p>{" "}
        </div>{" "}
        <div className="flex items-center gap-4 w-full md:w-auto">
          {" "}
          <div className="relative group flex-1 md:flex-initial">
            {" "}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />{" "}
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl glass-card text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all w-full sm:w-64"
            />{" "}
          </div>{" "}
          {isLead && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm font-bold shadow-lg shadow-blue-600/20 transition-all whitespace-nowrap"
            >
              {" "}
              <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" /> <span className="hidden sm:inline">New Task</span>
            </button>
          )}{" "}
        </div>{" "}
      </div>{" "}
      <div className="flex-1 overflow-x-auto overflow-y-auto pb-6 custom-scrollbar">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 h-full md:min-w-max">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="w-full md:w-80 flex flex-col gap-4 md:gap-6 shrink-0"
              >
                {" "}
                <div className="flex items-center justify-between px-2">
                  {" "}
                  <div className="flex items-center gap-3">
                    {" "}
                    <div
                      className={cn("h-2 w-2 rounded-full", col.color)}
                    />{" "}
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {col.label}
                    </h3>{" "}
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-none"
                    >
                      {" "}
                      {colTasks.length}{" "}
                    </Badge>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex-1 space-y-4 overflow-y-visible md:overflow-y-auto pr-2 custom-scrollbar">
                  {" "}
                  {colTasks.map((task) => (
                    <Card
                      key={task.id}
                      className={cn(
                        " glass-card text-slate-900 dark:text-slate-100 hover:border-blue-500/30 transition-all group cursor-pointer",
                      )}
                      onClick={() => setSelectedViewTask(task)}
                    >
                      {" "}
                      <CardContent className="p-3 md:p-5 space-y-3 md:space-y-4">
                        {" "}
                        <div className="flex items-center justify-between">
                          {" "}
                          <Badge
                            className={cn(
                              "rounded-lg px-2 py-0.5 border-none text-[10px] font-bold uppercase tracking-wider",
                              task.priority === "urgent"
                                ? "bg-red-500/10 text-red-500"
                                : task.priority === "high"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-blue-500/10 text-blue-500",
                            )}
                          >
                            {" "}
                            {task.priority}{" "}
                          </Badge>{" "}
                          <div className="flex items-center gap-2">
                            {" "}
                            {isLead && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenModal(task);
                                  }}
                                  className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                                >
                                  {" "}
                                  <Edit2 className="h-3.5 w-3.5" />{" "}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(task.id);
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                  {" "}
                                  <Trash2 className="h-3.5 w-3.5" />{" "}
                                </button>
                              </div>
                            )}{" "}
                            <div className="flex -space-x-2">
                              {" "}
                              {task.assignees.map((id) => (
                                <Avatar
                                  key={id}
                                  fallback={
                                    users
                                      .find((u) => u.id === id)
                                      ?.name.charAt(0) || "?"
                                  }
                                  size="sm"
                                  className="border-2 border-white dark:border-[#0A0B0D]"
                                />
                              ))}{" "}
                            </div>{" "}
                          </div>{" "}
                        </div>{" "}
                        <div className="space-y-2">
                          {" "}
                          <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white leading-relaxed group-hover:text-blue-500 transition-colors">
                            {" "}
                            {task.title}{" "}
                          </h4>{" "}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="space-y-2">
                              {" "}
                              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                {" "}
                                <span>
                                  {
                                    task.subtasks.filter((s) => s.completed)
                                      .length
                                  }
                                  /{task.subtasks.length} Tasks
                                </span>{" "}
                                <span>{task.progress}%</span>{" "}
                              </div>{" "}
                              <Progress value={task.progress} className="h-1" />{" "}
                              <div className="space-y-1">
                                {" "}
                                {task.subtasks.slice(0, 2).map((sub) => (
                                  <div
                                    key={sub.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSubtask(task.id, sub.id);
                                    }}
                                    className="flex items-center gap-2 group/sub cursor-pointer"
                                  >
                                    {" "}
                                    <div
                                      className={cn(
                                        "h-3 w-3 rounded border flex items-center justify-center transition-colors",
                                        sub.completed
                                          ? "bg-blue-500 border-blue-500"
                                          : "border-slate-300 dark:border-white/10",
                                      )}
                                    >
                                      {" "}
                                      {sub.completed && (
                                        <Check className="h-2 w-2 text-white" />
                                      )}{" "}
                                    </div>{" "}
                                    <span
                                      className={cn(
                                        "text-[10px] transition-all",
                                        sub.completed
                                          ? "text-slate-400 line-through"
                                          : "text-slate-600 dark:text-slate-400",
                                      )}
                                    >
                                      {" "}
                                      {sub.title}{" "}
                                    </span>{" "}
                                  </div>
                                ))}{" "}
                                {task.subtasks.length > 2 && (
                                  <p className="text-[9px] text-slate-400 font-bold pl-5">
                                    +{task.subtasks.length - 2} more tasks
                                  </p>
                                )}{" "}
                              </div>{" "}
                            </div>
                          )}{" "}
                        </div>{" "}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                          {" "}
                          <div className="flex items-center gap-3 text-slate-400">
                            {" "}
                            <div className="flex items-center gap-1 text-[10px] font-bold">
                              {" "}
                              <MessageSquare className="h-3.5 w-3.5" />{" "}
                              {task.comments?.length || 0}{" "}
                            </div>{" "}
                          </div>{" "}
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                            {" "}
                            <Clock className="h-3.5 w-3.5" />{" "}
                            {task.deadline
                              ? new Date(task.deadline).toLocaleDateString()
                              : "No date"}{" "}
                          </div>{" "}
                        </div>{" "}
                      </CardContent>{" "}
                    </Card>
                  ))}{" "}
                  {isLead && (
                    <button
                      onClick={() => handleOpenModal()}
                      className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-blue-500 hover:border-blue-500/30 transition-all group"
                    >
                      {" "}
                      <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />{" "}
                      <span className="text-xs font-bold">Add Task</span>{" "}
                    </button>
                  )}{" "}
                </div>{" "}
              </div>
            );
          })}{" "}
        </div>{" "}
      </div>{" "}
      {/* Task Modal */}{" "}
      <AnimatePresence>
        {" "}
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
              className="relative w-full max-w-2xl glass-card text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl overflow-hidden"
            >
              {" "}
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                {" "}
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {" "}
                  {editingTask ? "Edit Task" : "Create New Task"}{" "}
                </h2>{" "}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                  {" "}
                  <X className="h-5 w-5 text-slate-400" />{" "}
                </button>{" "}
              </div>{" "}
              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar"
              >
                {" "}
                <div className="space-y-4">
                  {" "}
                  <div className="space-y-2">
                    {" "}
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Task Title
                    </label>{" "}
                    <input
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      placeholder="Enter task title..."
                    />{" "}
                  </div>{" "}
                  <div className="space-y-2">
                    {" "}
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Description
                    </label>{" "}
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[100px] resize-none"
                      placeholder="Enter task description..."
                    />{" "}
                  </div>{" "}
                  <div className="grid grid-cols-2 gap-4">
                    {" "}
                    <div className="space-y-2">
                      {" "}
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Priority
                      </label>{" "}
                      <select
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            priority: e.target.value as Priority,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      >
                        {" "}
                        <option value="low">Low</option>{" "}
                        <option value="medium">Medium</option>{" "}
                        <option value="high">High</option>{" "}
                        <option value="urgent">Urgent</option>{" "}
                      </select>{" "}
                    </div>{" "}
                    <div className="space-y-2">
                      {" "}
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Status
                      </label>{" "}
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: e.target.value as Status,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      >
                        {" "}
                        <option value="todo">To Do</option>{" "}
                        <option value="in-progress">In Progress</option>{" "}
                        <option value="review">Review</option>{" "}
                        <option value="done">Done</option>{" "}
                      </select>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="grid grid-cols-2 gap-4">
                    {" "}
                    <div className="space-y-2">
                      {" "}
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Deadline
                      </label>{" "}
                      <input
                        type="date"
                        required
                        value={formData.deadline}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            deadline: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="space-y-3">
                    {" "}
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Things to do
                    </label>{" "}
                    <div className="flex gap-2">
                      {" "}
                      <input
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addSubtask())
                        }
                        className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                        placeholder="Add a subtask..."
                      />{" "}
                      <Button
                        type="button"
                        onClick={addSubtask}
                        size="sm"
                        className="rounded-xl"
                      >
                        Add
                      </Button>{" "}
                    </div>{" "}
                    <div className="space-y-2">
                      {" "}
                      {formData.subtasks.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5"
                        >
                          {" "}
                          <div className="flex items-center gap-3">
                            {" "}
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  subtasks: prev.subtasks.map((s) =>
                                    s.id === sub.id
                                      ? { ...s, completed: !s.completed }
                                      : s,
                                  ),
                                }))
                              }
                              className={cn(
                                "h-5 w-5 rounded-lg border flex items-center justify-center transition-all",
                                sub.completed
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : "border-slate-300 dark:border-white/20",
                              )}
                            >
                              {" "}
                              {sub.completed && (
                                <Check className="h-3 w-3" />
                              )}{" "}
                            </button>{" "}
                            <span
                              className={cn(
                                "text-sm",
                                sub.completed && "text-slate-400 line-through",
                              )}
                            >
                              {sub.title}
                            </span>{" "}
                          </div>{" "}
                          <button
                            type="button"
                            onClick={() => removeSubtask(sub.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            {" "}
                            <Trash2 className="h-4 w-4" />{" "}
                          </button>{" "}
                        </div>
                      ))}{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="space-y-3">
                    {" "}
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Assign Members
                    </label>{" "}
                    <div className="flex flex-wrap gap-2">
                      {" "}
                      {users
                        .filter((u) => u.role !== "Team Lead")
                        .map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => toggleAssignee(user.id)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
                              formData.assignees.includes(user.id)
                                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10",
                            )}
                          >
                            {" "}
                            <Avatar
                              fallback={user.name.charAt(0)}
                              size="sm"
                            />{" "}
                            <span className="text-xs font-bold">
                              {user.name}
                            </span>{" "}
                            {formData.assignees.includes(user.id) && (
                              <Check className="h-3 w-3" />
                            )}{" "}
                          </button>
                        ))}{" "}
                    </div>{" "}
                  </div>{" "}
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
                    {editingTask ? "Save Changes" : "Create Task"}{" "}
                  </Button>{" "}
                </div>{" "}
              </form>{" "}
            </motion.div>{" "}
          </div>
        )}{" "}
      </AnimatePresence>{" "}
      <TaskDetailsModal
        task={selectedViewTask}
        isOpen={!!selectedViewTask}
        onClose={() => setSelectedViewTask(null)}
      />
    </div>
  );
}
