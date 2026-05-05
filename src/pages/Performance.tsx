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
import { Activity, Target, Clock, Zap, Award } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
export function Performance() {
  const { userProfile } = useAuth();
  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
        Loading performance data...
      </div>
    );
  }
  const radarData = [
    {
      subject: "Completion",
      A: userProfile.tasksCompleted || 0,
      fullMark: 100,
    },
    { subject: "Punctuality", A: userProfile.punctuality || 0, fullMark: 100 },
    { subject: "Engagement", A: userProfile.engagement || 0, fullMark: 100 },
    { subject: "Health", A: userProfile.healthScore || 0, fullMark: 100 },
    {
      subject: "Productivity",
      A: userProfile.productivityScore || 0,
      fullMark: 100,
    },
  ];
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {" "}
      {/* Profile Header */}{" "}
      <Card className=" bg-blue-600/5 overflow-hidden relative">
        {" "}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />{" "}
        <CardContent className="p-10 flex flex-col md:flex-row items-center gap-10 relative z-10">
          {" "}
          <div className="relative">
            {" "}
            <Avatar
              fallback={userProfile.name?.charAt(0) || "?"}
              size="lg"
              className="h-32 w-32 border-4 border-white dark:border-[#1A1D23] shadow-2xl shadow-blue-500/20"
            />{" "}
            <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-emerald-500 border-4 border-white dark:border-[#1A1D23] rounded-full flex items-center justify-center">
              {" "}
              <Zap className="h-5 w-5 text-white" />{" "}
            </div>{" "}
          </div>{" "}
          <div className="flex-1 text-center md:text-left space-y-2">
            {" "}
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {userProfile.name}
            </h2>{" "}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {" "}
              <Badge className="bg-blue-600 text-white border-none px-4 py-1 rounded-xl font-bold text-xs uppercase tracking-widest">
                {" "}
                {userProfile.role}{" "}
              </Badge>{" "}
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {" "}
                {userProfile.department} Department{" "}
              </span>{" "}
            </div>{" "}
          </div>{" "}
          <div className="flex gap-10 bg-white/50 dark:bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white dark:border-white/5">
            {" "}
            <div className="text-center">
              {" "}
              <div className="text-2xl md:text-2xl md:text-4xl font-bold text-emerald-500">
                {userProfile.healthScore || 0}
              </div>{" "}
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                Health Score
              </div>{" "}
            </div>{" "}
            <div className="w-px bg-slate-200 dark:bg-white/10" />{" "}
            <div className="text-center">
              {" "}
              <div className="text-4xl font-bold text-blue-500">
                {userProfile.productivityScore || 0}
              </div>{" "}
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                Productivity
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </CardContent>{" "}
      </Card>{" "}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {" "}
        {/* Metrics */}{" "}
        <div className="space-y-8 md:col-span-2">
          {" "}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {" "}
            {[
              {
                label: "Tasks Completed",
                value: userProfile.tasksCompleted || 0,
                icon: Target,
                color: "text-purple-500",
                bg: "bg-purple-500/10",
              },
              {
                label: "Punctuality Rate",
                value: `${userProfile.punctuality || 0}%`,
                icon: Clock,
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
              },
              {
                label: "Engagement Score",
                value: `${userProfile.engagement || 0}%`,
                icon: Zap,
                color: "text-amber-500",
                bg: "bg-amber-500/10",
              },
              {
                label: "Current Streak",
                value: "14 Days",
                icon: Award,
                color: "text-blue-500",
                bg: "bg-blue-500/10",
              },
            ].map((stat, i) => (
              <Card
                key={i}
                className=" hover:border-blue-500/30 transition-all group"
              >
                {" "}
                <CardContent className="p-6 flex items-center gap-5">
                  {" "}
                  <div
                    className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
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
          <Card className="">
            {" "}
            <CardHeader>
              {" "}
              <CardTitle className="text-xl font-bold">
                Recent Achievements
              </CardTitle>{" "}
            </CardHeader>{" "}
            <CardContent className="space-y-4">
              {" "}
              {userProfile.tasksCompleted && userProfile.tasksCompleted > 10 ? (
                <div className="flex items-center gap-5 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-blue-500/30 transition-all group">
                  {" "}
                  <div className="h-14 w-14 rounded-full bg-amber-100 dark:bg-amber-500/20 shadow-lg shadow-amber-500/10 flex items-center justify-center text-2xl transition-transform group-hover:scale-110">
                    {" "}
                    🏆{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      Task Master
                    </p>{" "}
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Completed over 10 tasks successfully.
                    </p>{" "}
                  </div>{" "}
                </div>
              ) : (
                <div className="py-10 text-center text-slate-400">
                  {" "}
                  <Award className="h-10 w-10 mx-auto mb-3 opacity-20" />{" "}
                  <p className="text-sm">
                    Complete tasks to earn achievements!
                  </p>{" "}
                </div>
              )}{" "}
            </CardContent>{" "}
          </Card>{" "}
        </div>{" "}
        {/* Radar Chart */}{" "}
        <Card className="">
          {" "}
          <CardHeader>
            {" "}
            <CardTitle className="text-xl font-bold">
              Skill Analysis
            </CardTitle>{" "}
          </CardHeader>{" "}
          <CardContent className="flex items-center justify-center h-[400px]">
            {" "}
            <ResponsiveContainer width="100%" height="100%">
              {" "}
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                {" "}
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />{" "}
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                />{" "}
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />{" "}
                <Radar
                  name="Skills"
                  dataKey="A"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />{" "}
              </RadarChart>{" "}
            </ResponsiveContainer>{" "}
          </CardContent>{" "}
        </Card>{" "}
      </div>{" "}
    </div>
  );
}
