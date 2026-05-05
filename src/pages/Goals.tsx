import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Progress } from "../components/ui/Progress";
import {
  Target,
  TrendingUp,
  Award,
  Clock,
  Plus,
  Loader2,
  Trash2,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useData } from "../hooks/useData";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
export default function Goals() {
  const { goals, loading } = useData();
  const { userProfile } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    category: "Product",
    progress: 0,
    deadline: "",
  });
  const handleAddGoal = async () => {
    if (!newGoal.title || !userProfile?.teamId) return;
    try {
      await addDoc(collection(db, "goals"), {
        ...newGoal,
        teamId: userProfile.teamId,
        subgoals: [],
        createdAt: serverTimestamp(),
      });
      setNewGoal({ title: "", category: "Product", progress: 0, deadline: "" });
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };
  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteDoc(doc(db, "goals", id));
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };
  const updateGoalProgress = async (id: string, progress: number) => {
    try {
      await updateDoc(doc(db, "goals", id), {
        progress: Math.min(100, Math.max(0, progress)),
      });
    } catch (error) {
      console.error("Error updating goal progress:", error);
    }
  };
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        {" "}
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />{" "}
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
          Loading Goals...
        </p>{" "}
      </div>
    );
  }
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {" "}
      <div className="flex flex-wrap items-center justify-between gap-6">
        {" "}
        <div className="space-y-1">
          {" "}
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Strategic Goals
          </h1>{" "}
          <p className="text-slate-500 dark:text-slate-400">
            Track and manage your long-term objectives
          </p>{" "}
        </div>{" "}
        <div className="flex items-center gap-4">
          {" "}
          <div className="glass-card text-slate-900 dark:text-slate-100 px-6 py-3 rounded-2xl flex items-center gap-4">
            {" "}
            <div className="text-center">
              {" "}
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Completed
              </p>{" "}
              <p className="text-xl font-bold text-emerald-500">
                {goals.filter((g) => g.progress === 100).length}
              </p>{" "}
            </div>{" "}
            <div className="w-px h-8 bg-slate-200 dark:bg-white/10" />{" "}
            <div className="text-center">
              {" "}
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                In Progress
              </p>{" "}
              <p className="text-xl font-bold text-blue-500">
                {goals.filter((g) => g.progress < 100).length}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <button
            onClick={() => setIsAdding(true)}
            className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20 transition-all"
          >
            {" "}
            Add Goal{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {" "}
        <div className="lg:col-span-2 space-y-8">
          {" "}
          {isAdding && (
            <Card className="border-2 border-blue-500/30 bg-white/80 dark:bg-white/10">
              {" "}
              <CardContent className="p-8 space-y-6">
                {" "}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {" "}
                  <div className="space-y-2">
                    {" "}
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Goal Title
                    </label>{" "}
                    <input
                      type="text"
                      placeholder="e.g. Increase Revenue..."
                      value={newGoal.title}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, title: e.target.value })
                      }
                      className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 outline-none text-sm font-bold"
                    />{" "}
                  </div>{" "}
                  <div className="space-y-2">
                    {" "}
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Category
                    </label>{" "}
                    <select
                      value={newGoal.category}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, category: e.target.value })
                      }
                      className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 outline-none text-sm font-bold"
                    >
                      {" "}
                      <option>Product</option> <option>Financial</option>{" "}
                      <option>HR</option> <option>Marketing</option>{" "}
                    </select>{" "}
                  </div>{" "}
                  <div className="space-y-2">
                    {" "}
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Deadline
                    </label>{" "}
                    <input
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, deadline: e.target.value })
                      }
                      className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-3 outline-none text-sm font-bold"
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex gap-4">
                  {" "}
                  <button
                    onClick={handleAddGoal}
                    className="flex-1 bg-blue-600 text-white rounded-2xl py-3 font-bold"
                  >
                    {" "}
                    Confirm Goal{" "}
                  </button>{" "}
                  <button
                    onClick={() => setIsAdding(false)}
                    className="flex-1 bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-2xl py-3 font-bold"
                  >
                    {" "}
                    Cancel{" "}
                  </button>{" "}
                </div>{" "}
              </CardContent>{" "}
            </Card>
          )}{" "}
          {goals.map((goal) => (
            <Card
              key={goal.id}
              className=" hover:border-blue-500/30 transition-all group"
            >
              {" "}
              <CardContent className="p-8">
                {" "}
                <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
                  {" "}
                  <div className="flex gap-5">
                    {" "}
                    <div className="h-14 w-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      {" "}
                      <Target className="h-7 w-7" />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <div className="flex items-center gap-3">
                        {" "}
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                          {goal.title}
                        </h3>{" "}
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          {" "}
                          <Trash2 className="h-4 w-4" />{" "}
                        </button>{" "}
                      </div>{" "}
                      <div className="flex items-center gap-3">
                        {" "}
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                          {" "}
                          {goal.category}{" "}
                        </span>{" "}
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          {" "}
                          <Clock className="h-3.5 w-3.5" /> Due{" "}
                          {goal.deadline}{" "}
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="text-right flex flex-col items-end gap-2">
                    {" "}
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      {goal.progress}%
                    </div>{" "}
                    <Progress value={goal.progress} className="w-40 h-2.5" />{" "}
                    <div className="flex items-center gap-2 mt-2">
                      {" "}
                      <button
                        onClick={() =>
                          updateGoalProgress(goal.id, goal.progress - 5)
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-[10px] font-bold"
                      >
                        {" "}
                        -5%{" "}
                      </button>{" "}
                      <button
                        onClick={() =>
                          updateGoalProgress(goal.id, goal.progress + 5)
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-[10px] font-bold"
                      >
                        {" "}
                        +5%{" "}
                      </button>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                {goal.subgoals?.length > 0 && (
                  <div className="space-y-4">
                    {" "}
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Sub-goals
                    </p>{" "}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {" "}
                      {goal.subgoals.map((sub: any, j: number) => (
                        <div
                          key={j}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-3"
                        >
                          {" "}
                          <div className="flex items-center justify-between">
                            {" "}
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                              {sub.title}
                            </span>{" "}
                            <span className="text-xs font-bold text-blue-600">
                              {sub.progress}%
                            </span>{" "}
                          </div>{" "}
                          <Progress
                            value={sub.progress}
                            className="h-1.5"
                          />{" "}
                        </div>
                      ))}{" "}
                    </div>{" "}
                  </div>
                )}{" "}
              </CardContent>{" "}
            </Card>
          ))}{" "}
        </div>{" "}
        <div className="space-y-8">
          {" "}
          <Card className=" bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            {" "}
            <CardContent className="p-8 space-y-6">
              {" "}
              <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                {" "}
                <TrendingUp className="h-7 w-7" />{" "}
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <h3 className="text-2xl font-bold">
                  Performance Insights
                </h3>{" "}
                <p className="text-blue-100 text-sm leading-relaxed">
                  Focus on high-impact goals to maintain your team's momentum.
                </p>{" "}
              </div>{" "}
            </CardContent>{" "}
          </Card>{" "}
          <Card className="">
            {" "}
            <CardHeader>
              {" "}
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                {" "}
                <Award className="h-5 w-5 text-amber-500" /> Strategic
                Tracking{" "}
              </CardTitle>{" "}
            </CardHeader>{" "}
            <CardContent>
              {" "}
              <p className="text-sm text-slate-500 leading-relaxed italic">
                {" "}
                Manage your long-term vision. Add goals and track their progress
                in real-time with your team.{" "}
              </p>{" "}
            </CardContent>{" "}
          </Card>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
