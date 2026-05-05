import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Progress } from "../components/ui/Progress";
import { Badge } from "../components/ui/Badge";
import { cn } from "../lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useData } from "../hooks/useData";
import { TrendingUp, Zap, Target, Users } from "lucide-react";
export function TeamInsights() {
  const { users, tasks, loading } = useData();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
        Loading team insights...
      </div>
    );
  }
  const sortedUsers = [...users].sort(
    (a, b) => (b.healthScore || 0) - (a.healthScore || 0),
  );
  /* Real data for throughput (tasks completed per day for last 7 days) */ const last7Days =
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });
  const throughputCounts = last7Days.map((date) => ({
    day: date.split("-").slice(1).join("/"),
    points: 0,
  }));
  tasks.forEach((task) => {
    if (task.status === "done" && task.updatedAt) {
      const completionDate = task.updatedAt.split("T")[0];
      const index = last7Days.indexOf(completionDate);
      if (index !== -1) {
        throughputCounts[index].points += 1;
      }
    }
  });
  const throughputData = throughputCounts;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const avgHealth =
    users.length > 0
      ? Math.round(
          users.reduce((acc, u) => acc + (u.healthScore || 0), 0) /
            users.length,
        )
      : 0;
  const avgProductivity =
    users.length > 0
      ? Math.round(
          users.reduce((acc, u) => acc + (u.productivityScore || 0), 0) /
            users.length,
        )
      : 0;
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {" "}
      {/* Impact Overview Cards */}{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {" "}
        <Card className=" bg-blue-600 text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden">
          {" "}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />{" "}
          <CardContent className="p-6 relative z-10">
            {" "}
            <div className="flex items-center justify-between">
              {" "}
              <div>
                {" "}
                <p className="text-blue-100 font-bold text-[10px] uppercase tracking-widest">
                  Completed Tasks
                </p>{" "}
                <p className="text-2xl md:text-2xl md:text-4xl font-bold mt-1">{completedTasks}</p>{" "}
              </div>{" "}
              <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                {" "}
                <TrendingUp className="h-7 w-7 text-white" />{" "}
              </div>{" "}
            </div>{" "}
            <div className="mt-6 text-xs text-blue-100 flex items-center gap-1 font-bold">
              {" "}
              Out of {totalTasks} total tasks{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
        <Card className="">
          {" "}
          <CardContent className="p-6">
            {" "}
            <div className="flex items-center justify-between">
              {" "}
              <div>
                {" "}
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Completion Rate
                </p>{" "}
                <p className="text-4xl font-bold text-slate-900 dark:text-white mt-1">
                  {completionRate}%
                </p>{" "}
              </div>{" "}
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                {" "}
                <Target className="h-7 w-7 text-emerald-500" />{" "}
              </div>{" "}
            </div>{" "}
            <div className="mt-6">
              {" "}
              <Progress
                value={completionRate}
                className="h-1.5"
                indicatorClassName="bg-emerald-500"
              />{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
        <Card className="">
          {" "}
          <CardContent className="p-6">
            {" "}
            <div className="flex items-center justify-between">
              {" "}
              <div>
                {" "}
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Active Members
                </p>{" "}
                <p className="text-4xl font-bold text-slate-900 dark:text-white mt-1">
                  {users.length}
                </p>{" "}
              </div>{" "}
              <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                {" "}
                <Users className="h-7 w-7 text-purple-500" />{" "}
              </div>{" "}
            </div>{" "}
            <div className="mt-6 flex -space-x-3">
              {" "}
              {users.slice(0, 5).map((u) => (
                <Avatar
                  key={u.id}
                  fallback={u.name?.charAt(0) || "?"}
                  size="sm"
                  className="border-2 border-white dark:border-[#1A1D23]"
                />
              ))}{" "}
              {users.length > 5 && (
                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/5 border-2 border-white dark:border-[#1A1D23] flex items-center justify-center text-[10px] font-bold text-slate-500">
                  {" "}
                  +{users.length - 5}{" "}
                </div>
              )}{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
        <Card className="">
          {" "}
          <CardContent className="p-6">
            {" "}
            <div className="flex items-center justify-between">
              {" "}
              <div>
                {" "}
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Average Health
                </p>{" "}
                <p className="text-4xl font-bold text-slate-900 dark:text-white mt-1">
                  {avgHealth}
                </p>{" "}
              </div>{" "}
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                {" "}
                <Zap className="h-7 w-7 text-amber-500" />{" "}
              </div>{" "}
            </div>{" "}
            <div className="mt-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {" "}
              Team average health across all members{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {" "}
        {/* Velocity Chart */}{" "}
        <Card className="lg:col-span-2 ">
          {" "}
          <CardHeader>
            {" "}
            <CardTitle className="text-xl font-bold">
              Sprint Velocity Trend
            </CardTitle>{" "}
          </CardHeader>{" "}
          <CardContent>
            {" "}
            <div className="h-[350px] w-full">
              {" "}
              <ResponsiveContainer width="100%" height="100%">
                {" "}
                <AreaChart
                  data={throughputData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  {" "}
                  <defs>
                    {" "}
                    <linearGradient
                      id="colorThroughput"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      {" "}
                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={0.3}
                      />{" "}
                      <stop
                        offset="95%"
                        stopColor="#3b82f6"
                        stopOpacity={0}
                      />{" "}
                    </linearGradient>{" "}
                  </defs>{" "}
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                    vertical={false}
                    opacity={0.2}
                  />{" "}
                  <XAxis
                    dataKey="day"
                    stroke="#94a3b8"
                    fontSize={11}
                    fontWeight={700}
                    tickLine={false}
                    axisLine={false}
                  />{" "}
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    fontWeight={700}
                    tickLine={false}
                    axisLine={false}
                  />{" "}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1D23",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      color: "#f8fafc",
                    }}
                    itemStyle={{ color: "#3b82f6", fontWeight: 700 }}
                  />{" "}
                  <Area
                    type="monotone"
                    dataKey="points"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorThroughput)"
                  />{" "}
                </AreaChart>{" "}
              </ResponsiveContainer>{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
        {/* Team Health Overview */}{" "}
        <Card className="">
          {" "}
          <CardHeader>
            {" "}
            <CardTitle className="text-xl font-bold">
              Team Health Leaderboard
            </CardTitle>{" "}
          </CardHeader>{" "}
          <CardContent>
            {" "}
            <div className="space-y-6">
              {" "}
              {sortedUsers.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                >
                  {" "}
                  <div className="w-8 text-center text-xs font-bold text-slate-400 group-hover:text-blue-500 transition-colors">
                    {" "}
                    #{index + 1}{" "}
                  </div>{" "}
                  <Avatar
                    fallback={user.name?.charAt(0) || "?"}
                    className="ring-2 ring-transparent group-hover:ring-blue-500/30 transition-all"
                  />{" "}
                  <div className="flex-1">
                    {" "}
                    <div className="flex justify-between items-center mb-1.5">
                      {" "}
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {user.name}
                      </span>{" "}
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {user.healthScore || 0}
                      </span>{" "}
                    </div>{" "}
                    <Progress
                      value={user.healthScore || 0}
                      className="h-1.5"
                      indicatorClassName={
                        (user.healthScore || 0) >= 90
                          ? "bg-emerald-500"
                          : (user.healthScore || 0) >= 80
                            ? "bg-blue-500"
                            : "bg-amber-500"
                      }
                    />{" "}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
      </div>{" "}
    </div>
  );
}
