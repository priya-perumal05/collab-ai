import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Avatar } from "./Avatar";
import { Progress } from "./Progress";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../hooks/useData";
import { db } from "../../firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  Clock,
  MessageSquare,
  Send,
  AlertCircle,
  Check,
} from "lucide-react";
import { Task, Comment, Status } from "../../types";
import { cn } from "@/src/lib/utils";
interface TaskDetailsModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}
export function TaskDetailsModal({
  task,
  isOpen,
  onClose,
}: TaskDetailsModalProps) {
  const { currentUser, userProfile } = useAuth();
  const { users } = useData();
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateStatusMode, setUpdateStatusMode] = useState(false);
  const [newStatus, setNewStatus] = useState<Status | "">("");
  const [workDoneDescription, setWorkDoneDescription] = useState("");
  useEffect(() => {
    if (task) {
      setDescription(task.description || "");
      setDeadline(
        task.deadline ? format(parseISO(task.deadline), "yyyy-MM-dd") : "",
      );
      setNewStatus(task.status);
    }
  }, [task]);
  if (!task) return null;
  const handleUpdateTask = async () => {
    if (!task || !currentUser) return;
    setLoading(true);
    try {
      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, {
        description,
        deadline: new Date(deadline).toISOString(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusSubmit = async () => {
    if (!task || !currentUser || !newStatus) return;
    setLoading(true);
    let updatePayload: any = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    if (newStatus === "done") {
      updatePayload.progress = 100;
    }
    
    try {
      const taskRef = doc(db, "tasks", task.id);
      
      const p = [updateDoc(taskRef, updatePayload)];
      
      if (workDoneDescription.trim()) {
        const comment: Comment = {
          id: crypto.randomUUID(),
          taskId: task.id,
          userId: currentUser.uid,
          content: `Status updated to ${newStatus}. ${workDoneDescription.trim()}`,
          createdAt: new Date().toISOString(),
        };
        p.push(updateDoc(taskRef, { comments: arrayUnion(comment) }));
      }
      
      await Promise.all(p);
      setUpdateStatusMode(false);
      setWorkDoneDescription("");
    } catch (error: any) {
      console.error("Error updating status:", error);
      alert("Error updating status: " + (error.message || String(error)));
    } finally {
      setLoading(false);
    }
  };
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !currentUser || !newComment.trim()) return;
    const comment: Comment = {
      id: crypto.randomUUID(),
      taskId: task.id,
      userId: currentUser.uid,
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    };
    try {
      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, { comments: arrayUnion(comment) });
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };
  const getPriorityVariant = (
    priority: string,
  ): "destructive" | "warning" | "default" | "secondary" => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "warning";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
    >
      {" "}
      <div className="space-y-4">
        {" "}
        {/* Header Info */}{" "}
        <div className="flex flex-wrap items-center gap-3">
          {" "}
          <Badge
            variant={getPriorityVariant(task.priority)}
            className="uppercase"
          >
            {" "}
            {task.priority}{" "}
          </Badge>{" "}
          <Badge variant="outline" className="capitalize">
            {" "}
            {task.status.replace("-", " ")}{" "}
          </Badge>{" "}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
            {" "}
            <Calendar className="h-3.5 w-3.5" /> Created{" "}
            {format(parseISO(task.createdAt), "MMM dd, yyyy")}{" "}
          </div>{" "}
        </div>{" "}
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {task.title}
        </h3>{" "}

        <div className="space-y-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Status & Progress
            </h4>
            {!updateStatusMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUpdateStatusMode(true)}
                className="h-8 text-xs"
              >
                Update Status
              </Button>
            )}
          </div>
          {updateStatusMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Task Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Status)}
                  className="w-full glass-card text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Progress Update Description (Required)
                </label>
                <textarea
                  value={workDoneDescription}
                  onChange={(e) => setWorkDoneDescription(e.target.value)}
                  className="w-full glass-card text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[80px]"
                  placeholder="Describe the work you have done..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setUpdateStatusMode(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleStatusSubmit} 
                  disabled={loading || !workDoneDescription.trim()}
                  size="sm"
                >
                  {loading ? "Saving..." : "Save Status"}
                </Button>
              </div>
            </div>
          ) : (
             <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-white/10">
               <div>
                  <p className="text-xs text-slate-500 mb-1">Current Status</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 capitalize">{task.status.replace("-", " ")}</p>
               </div>
               <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">Progress</p>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{task.progress}%</p>
               </div>
             </div>
          )}
        </div>

        {/* Description & Deadline */}{" "}
        <div className="space-y-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl ">
          {" "}
          <div className="flex items-center justify-between">
            {" "}
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {" "}
              Description{" "}
            </h4>{" "}
            {(userProfile?.role === "Team Lead" || userProfile?.role === "Team Member") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="h-8 text-xs"
            >
              {" "}
              {isEditing ? "Cancel" : "Edit"}{" "}
            </Button>
            )}
          </div>{" "}
          {isEditing ? (
            <div className="space-y-4">
              {" "}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full glass-card text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px]"
                placeholder="Add a description..."
              />{" "}
              <div className="flex items-center gap-4">
                {" "}
                <div className="flex-1">
                  {" "}
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Deadline
                  </label>{" "}
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full glass-card text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />{" "}
                </div>{" "}
                <Button
                  onClick={handleUpdateTask}
                  disabled={loading}
                  size="sm"
                  className="mt-5"
                >
                  {" "}
                  {loading ? "Saving..." : "Save Changes"}{" "}
                </Button>{" "}
              </div>{" "}
            </div>
          ) : (
            <div className="space-y-4">
              {" "}
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {" "}
                {task.description || "No description provided."}{" "}
              </p>{" "}
              <div className="flex items-center gap-4 text-xs">
                {" "}
                <div className="flex items-center gap-1.5 text-slate-500">
                  {" "}
                  <Clock className="h-3.5 w-3.5" /> Deadline:{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {" "}
                    {task.deadline ? format(parseISO(task.deadline), "MMM dd, yyyy") : 'No Date'}{" "}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          )}{" "}
        </div>{" "}

        {/* Subtasks */}{" "}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Tasks List ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
            </h4>
            <div className="space-y-2">
              {task.subtasks.map((sub) => (
                <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                  <button
                    onClick={async () => {
                      if (!currentUser) return;
                      const updatedSubtasks = task.subtasks!.map((s) =>
                        s.id === sub.id ? { ...s, completed: !s.completed } : s,
                      );
                      const completed = updatedSubtasks.filter((s) => s.completed).length;
                      const prog = Math.round((completed / updatedSubtasks.length) * 100);
                      try {
                        await updateDoc(doc(db, "tasks", task.id), {
                          subtasks: updatedSubtasks,
                          progress: prog,
                        });
                      } catch (err) { console.error(err); }
                    }}
                    className={cn("h-5 w-5 rounded border flex items-center justify-center transition-colors", sub.completed ? "bg-blue-500 border-blue-500" : "border-slate-300 dark:border-white/10")}
                  >
                    {sub.completed && <Check className="h-3 w-3 text-white" />}
                  </button>
                  <span className={cn("text-sm", sub.completed ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-300")}>
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Assignees & Progress */}{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {" "}
          <div className="space-y-3">
            {" "}
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Assignees
            </h4>{" "}
            <div className="flex flex-wrap gap-2">
              {" "}
              {task.assignees.map((id) => {
                const user = users.find((u) => u.id === id);
                return user ? (
                  <div
                    key={id}
                    className="flex items-center gap-2 glass-card text-slate-900 dark:text-slate-100 px-2 py-1 rounded-full pr-3"
                  >
                    {" "}
                    <Avatar fallback={user.name.charAt(0)} size="sm" />{" "}
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {user.name}
                    </span>{" "}
                  </div>
                ) : null;
              })}{" "}
            </div>{" "}
          </div>{" "}
          <div className="space-y-3">
            {" "}
            <div className="flex justify-between items-center">
              {" "}
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Progress
              </h4>{" "}
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {task.progress}%
              </span>{" "}
            </div>{" "}
            <Progress value={task.progress} className="h-2" />{" "}
          </div>{" "}
        </div>{" "}
        {/* Comments Section */}{" "}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
          {" "}
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {" "}
            <MessageSquare className="h-4 w-4" /> Comments (
            {(task.comments || []).length}){" "}
          </h4>{" "}
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {" "}
            {(task.comments || []).length > 0 ? (
              [...task.comments]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )
                .map((comment) => {
                  const user = users.find((u) => u.id === comment.userId);
                  return (
                    <div key={comment.id} className="flex gap-3">
                      {" "}
                      <Avatar
                        fallback={user?.name?.charAt(0) || "?"}
                        size="sm"
                      />{" "}
                      <div className="flex-1 space-y-1">
                        {" "}
                        <div className="flex items-center justify-between">
                          {" "}
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-200">
                            {user?.name || "Unknown User"}
                          </span>{" "}
                          <span className="text-[10px] text-slate-500">
                            {format(
                              parseISO(comment.createdAt),
                              "MMM dd, HH:mm",
                            )}
                          </span>{" "}
                        </div>{" "}
                        <div className="bg-slate-100 dark:bg-white/5 p-3 rounded-2xl rounded-tl-none ">
                          {" "}
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {" "}
                            {comment.content}{" "}
                          </p>{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-8 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                {" "}
                <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />{" "}
                <p className="text-xs text-slate-500">
                  No comments yet. Start the conversation!
                </p>{" "}
              </div>
            )}{" "}
          </div>{" "}
          {/* Add Comment Input */}{" "}
          <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
            {" "}
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />{" "}
            <Button type="submit" size="icon" disabled={!newComment.trim()}>
              {" "}
              <Send className="h-4 w-4" />{" "}
            </Button>{" "}
          </form>{" "}
        </div>{" "}
      </div>{" "}
    </Modal>
  );
}
