import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useData } from "../hooks/useData";
export default function Reports() {
  const { tasks, users } = useData();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeMembers = users.length;
  /* Real data for productivity trends (tasks created per day of week) */ const days =
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const taskCountsByDay = days.map((day) => ({ name: day, tasks: 0 }));
  tasks.forEach((task) => {
    if (task.createdAt) {
      const date = new Date(task.createdAt);
      if (!isNaN(date.getTime())) {
        const dayIndex = date.getDay();
        taskCountsByDay[dayIndex].tasks += 1;
      }
    }
  });
  /* Reorder to start from Mon for the chart */ const productivityData = [
    taskCountsByDay[1],
    /* Mon */ taskCountsByDay[2],
    /* Tue */ taskCountsByDay[3],
    /* Wed */ taskCountsByDay[4],
    /* Thu */ taskCountsByDay[5],
    /* Fri */ taskCountsByDay[6],
    /* Sat */ taskCountsByDay[0] /* Sun */,
  ];
  /* Real data for team distribution (members by department) */ const deptCounts: Record<
    string,
    number
  > = {};
  users.forEach((u) => {
    const dept = u.department || "Other";
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });
  const teamPerformance = Object.entries(deptCounts).map(([name, value]) => ({
    name,
    value,
  }));
  /* Fallback if no users/departments yet */ if (teamPerformance.length === 0) {
    teamPerformance.push({ name: "No Data", value: 1 });
  }
  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#06b6d4",
  ];
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {" "}
      <div className="flex flex-wrap items-center justify-between gap-6">
        {" "}
        <div className="space-y-1">
          {" "}
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Analytics & Reports
          </h1>{" "}
          <p className="text-slate-500 dark:text-slate-400">
            Deep dive into team performance and project metrics
          </p>{" "}
        </div>{" "}
        <div className="flex items-center gap-2 md:gap-3">
          {" "}
          <button className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl glass-card text-xs md:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
            {" "}
            <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" /> <span className="hidden sm:inline">Last 30 Days</span>
          </button>{" "}
          <button className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl glass-card text-xs md:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
            {" "}
            <Filter className="h-3.5 w-3.5 md:h-4 md:w-4" /> <span className="hidden sm:inline">Filters</span>
          </button>{" "}
          <button className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm font-bold shadow-lg shadow-blue-600/20 transition-all">
            {" "}
            <Download className="h-3.5 w-3.5 md:h-4 md:w-4" /> <span className="hidden sm:inline">Export</span>
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {" "}
        {[
          {
            label: "Completion Rate",
            value: `${completionRate}%`,
            icon: CheckCircle2,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Total Tasks",
            value: totalTasks,
            icon: TrendingUp,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Active Members",
            value: activeMembers,
            icon: Users,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
          },
          {
            label: "Tasks Done",
            value: completedTasks,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
        ].map((stat, i) => (
          <Card key={i} className="">
            {" "}
            <CardContent className="p-6 flex items-center gap-5">
              {" "}
              <div
                className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center",
                  stat.bg,
                )}
              >
                {" "}
                <stat.icon className={cn("h-7 w-7", stat.color)} />{" "}
              </div>{" "}
              <div>
                {" "}
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {stat.label}
                </p>{" "}
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {stat.value}
                </p>{" "}
              </div>{" "}
            </CardContent>{" "}
          </Card>
        ))}{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {" "}
        <Card className="">
          {" "}
          <CardHeader>
            {" "}
            <CardTitle className="text-xl font-bold">
              Productivity Trends
            </CardTitle>{" "}
          </CardHeader>{" "}
          <CardContent>
            {" "}
            <div className="h-[250px] md:h-[350px] w-full">
              {" "}
              <ResponsiveContainer width="100%" height="100%">
                {" "}
                <BarChart data={productivityData}>
                  {" "}
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                    vertical={false}
                    opacity={0.2}
                  />{" "}
                  <XAxis
                    dataKey="name"
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
                  <Bar
                    dataKey="tasks"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                  />{" "}
                </BarChart>{" "}
              </ResponsiveContainer>{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
        <Card className="">
          {" "}
          <CardHeader>
            {" "}
            <CardTitle className="text-xl font-bold">
              Team Distribution
            </CardTitle>{" "}
          </CardHeader>{" "}
          <CardContent className="flex items-center justify-center">
            {" "}
            <div className="h-[250px] md:h-[350px] w-full">
              {" "}
              <ResponsiveContainer width="100%" height="100%">
                {" "}
                <PieChart>
                  {" "}
                  <Pie
                    data={teamPerformance}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {" "}
                    {teamPerformance.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}{" "}
                  </Pie>{" "}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1D23",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      color: "#f8fafc",
                    }}
                  />{" "}
                </PieChart>{" "}
              </ResponsiveContainer>{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
      </div>{" "}
    </div>
  );
}
