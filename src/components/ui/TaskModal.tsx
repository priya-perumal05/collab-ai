import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../hooks/useData";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function TaskModal({ isOpen, onClose }: TaskModalProps) {
  const { currentUser, userProfile } = useAuth();
  const { users } = useData();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const [assignees, setAssignees] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile?.teamId || !title.trim() || !deadline)
      return;
    setLoading(true);
    try {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const docRef = await addDoc(collection(db, "tasks"), {
        title,
        description,
        priority,
        status: "todo",
        assignees,
        creatorId: currentUser.uid,
        teamId: userProfile.teamId,
        createdAt: now.toISOString(),
        deadline: deadlineDate.toISOString(),
        progress: 0,
        riskLevel: "low",
      });
      onClose();
      /* Reset form */ setTitle("");
      setDescription("");
      setPriority("medium");
      setDeadline("");
      setAssignees([]);
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setLoading(false);
    }
  };
  const toggleAssignee = (userId: string) => {
    setAssignees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      {" "}
      <form onSubmit={handleSubmit} className="space-y-4">
        {" "}
        <div>
          {" "}
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Task Title
          </label>{" "}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            required
          />{" "}
        </div>{" "}
        <div>
          {" "}
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>{" "}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px]"
          />{" "}
        </div>{" "}
        <div className="grid grid-cols-2 gap-4">
          {" "}
          <div>
            {" "}
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Priority
            </label>{" "}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {" "}
              <option value="low">Low</option>{" "}
              <option value="medium">Medium</option>{" "}
              <option value="high">High</option>{" "}
              <option value="urgent">Urgent</option>{" "}
            </select>{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Deadline
            </label>{" "}
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
            />{" "}
          </div>{" "}
        </div>{" "}
        <div>
          {" "}
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Assign To
          </label>{" "}
          <div className="space-y-2 pr-2">
            {" "}
            {users
              .filter((u) => u.role !== "Team Lead")
              .map((user) => (
                <label
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors"
                >
                  {" "}
                  <input
                    type="checkbox"
                    checked={assignees.includes(user.id)}
                    onChange={() => toggleAssignee(user.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />{" "}
                  <div className="flex-1">
                    {" "}
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                      {user.name}
                    </p>{" "}
                    <p className="text-xs text-slate-500">{user.role}</p>{" "}
                  </div>{" "}
                </label>
              ))}{" "}
          </div>{" "}
        </div>{" "}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          {" "}
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>{" "}
          <Button type="submit" disabled={loading}>
            {" "}
            {loading ? "Creating..." : "Create Task"}{" "}
          </Button>{" "}
        </div>{" "}
      </form>{" "}
    </Modal>
  );
}
