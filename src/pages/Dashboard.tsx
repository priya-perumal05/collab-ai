import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Megaphone,
} from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { cn } from "../lib/utils";
import { useData } from "../hooks/useData";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { useAuth } from "../contexts/AuthContext";
import {
  Copy,
  Check,
  Plus,
  LogIn,
  UserPlus,
  X,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
export function Dashboard() {
  const { tasks, users, joinRequests, securityLogs, loading, managedTeams } = useData();
  const { userProfile, teamData } = useAuth();
  const [copied, setCopied] = React.useState(false);
  const [teamName, setTeamName] = React.useState("");
  const [creatingTeam, setCreatingTeam] = React.useState(false);
  const [processingRequest, setProcessingRequest] = React.useState<
    string | null
  >(null);
  const [showTeamDropdown, setShowTeamDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTeamDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSwitchTeam = async (teamId: string) => {
    if (!userProfile?.uid) return;
    try {
      await updateDoc(doc(db, "users", userProfile.uid), { teamId: teamId });
      setShowTeamDropdown(false);
    } catch (err) {
      console.error("Error switching team:", err);
    }
  };
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !userProfile?.uid) return;
    setCreatingTeam(true);
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const teamRef = await addDoc(collection(db, "teams"), {
        name: teamName,
        leadId: userProfile.uid,
        joinCode: code,
        createdAt: new Date().toISOString(),
      });
      const { arrayUnion } = await import("firebase/firestore");
      await updateDoc(doc(db, "users", userProfile.uid), {
        teamId: teamRef.id,
        teamIds: arrayUnion(teamRef.id),
        role: "Team Lead",
      });
      setTeamName("");
    } catch (err) {
      console.error("Error creating team:", err);
    } finally {
      setCreatingTeam(false);
    }
  };
  const handleApproveRequest = async (request: any) => {
    setProcessingRequest(request.id);
    try {
      await updateDoc(doc(db, "joinRequests", request.id), {
        status: "approved",
      });
      const { arrayUnion } = await import("firebase/firestore");
      await updateDoc(doc(db, "users", request.userId), {
        teamId: request.teamId,
        teamIds: arrayUnion(request.teamId),
        role: "Team Member",
      });
    } catch (err) {
      console.error("Error approving request:", err);
    } finally {
      setProcessingRequest(null);
    }
  };
  const handleRejectRequest = async (requestId: string) => {
    setProcessingRequest(requestId);
    try {
      await updateDoc(doc(db, "joinRequests", requestId), {
        status: "rejected",
      });
    } catch (err) {
      console.error("Error rejecting request:", err);
    } finally {
      setProcessingRequest(null);
    }
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
        Loading dashboard...
      </div>
    );
  }
  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    )
    .slice(0, 4);
  const teamMembers = [...users].sort((a, b) => {
    if (a.role === "Team Lead") return -1;
    if (b.role === "Team Lead") return 1;
    return 0;
  });
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in-progress",
  ).length;
  const overdueTasks = tasks.filter(
    (t) => isPast(parseISO(t.deadline)) && t.status !== "done",
  ).length;
  const totalTasks = tasks.length;
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {" "}
      {/* Welcome Section */}{" "}
      <div className="flex flex-wrap items-center justify-between gap-4 md:gap-6">
        {" "}
        <div className="space-y-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <h1 className="text-2xl md:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {userProfile?.name?.split(" ")[0] || "User"}! 👋
            </h1>
            {(managedTeams.length > 0 || teamData) && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => managedTeams.length > 0 && setShowTeamDropdown(!showTeamDropdown)}
                  className={`flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 ${managedTeams.length > 0 ? "hover:bg-white/80 dark:hover:bg-slate-800/80" : "cursor-default opacity-80"}`}
                >
                  <span className="truncate max-w-[120px]">
                    {teamData?.name || "Select Team"}
                  </span>
                  {managedTeams.length > 0 && (
                    <ChevronDown className={`h-4 w-4 transition-transform ${showTeamDropdown ? "rotate-180" : ""}`} />
                  )}
                </button>
                {showTeamDropdown && managedTeams.length > 0 && (
                  <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                    {managedTeams.map((team) => (
                      <button
                        key={team.id}
                        onClick={() => handleSwitchTeam(team.id)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                          team.id === userProfile?.teamId
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        <span className="truncate">{team.name}</span>
                        {team.id === userProfile?.teamId && <CheckCircle className="h-4 w-4 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
            Here's what's happening.
          </p>
        </div>{" "}
        {userProfile?.role === "Team Lead" && teamData?.joinCode && (
          <div className="glass-card flex items-center gap-3 p-2 shadow-sm shrink-0">
            {" "}
            <div className="px-4 py-2 rounded-xl bg-slate-900/5 dark:bg-white/10">
              {" "}
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Join Code
              </span>{" "}
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
                {teamData.joinCode}
              </span>{" "}
            </div>{" "}
            <button
              onClick={() => copyToClipboard(teamData.joinCode)}
              className="p-3 hover:bg-slate-900/5 dark:hover:bg-white/10 rounded-xl transition-colors text-slate-500 hover:text-blue-600"
            >
              {" "}
              {copied ? (
                <Check className="h-5 w-5 text-emerald-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}{" "}
            </button>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {userProfile?.role === "Team Lead" && !userProfile?.teamId && (
        <Card className="border-blue-500/30 bg-blue-500/5 backdrop-blur-xl">
          {" "}
          <CardContent className="p-10">
            {" "}
            <div className="max-w-md mx-auto text-center space-y-8">
              {" "}
              <div className="h-20 w-20 rounded-3xl bg-blue-500/20 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/10">
                {" "}
                <Plus className="h-10 w-10 text-blue-400" />{" "}
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Create Your Team
                </h2>{" "}
                <p className="text-slate-500 dark:text-slate-400">
                  Start managing your team and tasks by creating a workspace.
                </p>{" "}
              </div>{" "}
              <form onSubmit={handleCreateTeam} className="space-y-4">
                {" "}
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter Team Name"
                  className="w-full bg-white/40 dark:bg-black/20 border border-white/20 rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  required
                />{" "}
                <button
                  type="submit"
                  disabled={creatingTeam || !teamName.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50"
                >
                  {" "}
                  {creatingTeam ? "Creating..." : "Create Team"}{" "}
                </button>{" "}
              </form>{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>
      )}
      {userProfile?.role !== "Team Lead" && !userProfile?.teamId && (
        <Card className="border-blue-500/30 bg-blue-500/5 backdrop-blur-xl">
          <CardContent className="p-10">
            <div className="max-w-md mx-auto text-center space-y-8">
              <div className="h-20 w-20 rounded-3xl bg-blue-500/20 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/10">
                <Users className="h-10 w-10 text-blue-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Join a Team
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Connect with your team workspace to view tasks, goals, and more.
                </p>
              </div>
              <button
                onClick={() => {
                  window.location.href = "/teams";
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50"
              >
                Go to Teams Page
              </button>
            </div>
          </CardContent>
        </Card>
      )}{" "}
      {/* MODERN MINIMALISTIC DASHBOARD */}{" "}
      <div className="flex flex-col gap-6 mt-8">
        {" "}
        {/* ROW 1: Minimalistic Stats Row */}{" "}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {" "}
          {[
            { label: "Total Tasks", value: totalTasks, color: "text-blue-500" },
            {
              label: "Completed",
              value: completedTasks,
              color: "text-emerald-500",
              progress:
                totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
            },
            {
              label: "In Progress",
              value: inProgressTasks,
              color: "text-amber-500",
            },
            {
              label: "Action Needed",
              value: overdueTasks,
              color: "text-red-500",
              urgent: true,
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className={cn(
                "aspect-square max-h-48 flex flex-col justify-center items-center text-center relative overflow-hidden group ",
                stat.urgent && "bg-red-500/5 border-red-500/10",
              )}
            >
              {" "}
              {stat.urgent && (
                <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse" />
              )}{" "}
              <div className="space-y-1 z-10 w-full px-2">
                {" "}
                <div
                  className={cn(
                    "text-2xl md:text-4xl md:text-6xl lg:text-7xl font-black font-display leading-[0.8] tracking-tighter drop-shadow-sm transition-transform group-hover:scale-105 duration-500",
                    stat.color,
                  )}
                >
                  {stat.value}
                </div>{" "}
                <h3 className="text-[10px] md:text-sm lg:text-base font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mt-2 md:mt-3">
                  {stat.label}
                </h3>{" "}
              </div>{" "}
              {stat.progress !== undefined && (
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-white/5">
                  {" "}
                  <div
                    className="h-full bg-emerald-500 transition-all duration-1000"
                    style={{ width: `${stat.progress}%` }}
                  />{" "}
                </div>
              )}{" "}
            </Card>
          ))}{" "}
        </div>{" "}
        {/* ROW 2: Main Layout */}{" "}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {" "}
          {/* Main Column: Active Tasks & Activity */}{" "}
          <div className="xl:col-span-2 flex flex-col gap-6">
            {" "}
            <Card className="p-4 md:p-6 flex-1 flex flex-col min-h-[300px]">
              {" "}
              <div className="flex items-center justify-between mb-4">
                {" "}
                <h3 className="text-lg md:text-2xl font-black font-display text-slate-800 dark:text-slate-200">
                  Assigned Tasks
                </h3>{" "}
                <button className="text-[10px] md:text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:opacity-80">
                  View All
                </button>{" "}
              </div>{" "}
              <div className="w-full flex-1 flex flex-col overflow-x-auto">
                <div className="min-w-[400px] flex-1 flex flex-col">
                  <div className="grid grid-cols-4 pb-3 border-b border-slate-200 dark:border-white/10 mb-3 text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-2">Task Name</div> <div>Status</div>
                    <div>Progress</div>
                  </div>
                  <div className="space-y-2 flex-1 overflow-y-auto scrollbar-hide pr-2">
                    {recentTasks.length > 0 ? (
                      recentTasks.map((task) => {
                      const isOverdue =
                        isPast(parseISO(task.deadline)) &&
                        task.status !== "done";
                      return (
                        <div
                          key={task.id}
                          className="grid grid-cols-4 items-center text-sm relative group cursor-pointer p-2 md:p-3 hover:bg-slate-900/5 dark:hover:bg-white/5 rounded-xl transition-all"
                        >
                          {" "}
                          {isOverdue && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-500 rounded-r-full" />
                          )}{" "}
                          <div className="col-span-2 pr-4 min-w-0 pl-2">
                            {" "}
                            <div className="font-bold text-sm md:text-lg text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-500 transition-colors">
                              {task.title}
                            </div>{" "}
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] md:text-sm text-slate-500 dark:text-slate-400">
                              {" "}
                              <Clock
                                className={cn(
                                  "h-3 w-3 md:h-4 md:w-4",
                                  isOverdue && "text-red-500",
                                )}
                              />{" "}
                              <span
                                className={cn(
                                  isOverdue && "text-red-500 font-bold",
                                )}
                              >
                                {format(parseISO(task.deadline), "MMM dd")}
                              </span>{" "}
                            </div>{" "}
                          </div>{" "}
                          <div>
                            {" "}
                            <span
                              className={cn(
                                "px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap",
                                task.status === "done"
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : task.status === "in-progress"
                                    ? "bg-blue-500/10 text-blue-600"
                                    : "bg-amber-500/10 text-amber-600",
                              )}
                            >
                              {" "}
                              {task.status.replace("-", " ")}{" "}
                            </span>{" "}
                          </div>{" "}
                          <div className="flex flex-col items-end gap-1.5 justify-center mt-1">
                            {" "}
                            <Progress
                              value={task.progress}
                              className="h-1 md:h-1.5 w-full"
                              indicatorClassName={
                                task.status === "done"
                                  ? "bg-emerald-500"
                                  : "bg-blue-500"
                              }
                            />{" "}
                          </div>{" "}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-center text-slate-500 py-8 col-span-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/10 mt-4">
                      No active tasks found. Enjoy your day!
                    </div>
                  )}
                </div>
                </div>
              </div>
            </Card>{" "}
            <Card className="p-4 md:p-6">
              {" "}
              <div className="flex items-center justify-between mb-4">
                {" "}
                <div className="flex items-center gap-2">
                  {" "}
                  <Megaphone className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />{" "}
                  <h3 className="text-lg md:text-2xl font-black font-display text-slate-800 dark:text-slate-200">
                    System Activity
                  </h3>{" "}
                </div>{" "}
              </div>{" "}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {" "}
                {securityLogs.length === 0 ? (
                  <div className="text-center text-slate-400 text-xs sm:col-span-3 py-4">
                    No recent activity.
                  </div>
                ) : (
                  securityLogs.slice(0, 3).map((log) => (
                    <div
                      key={log.id}
                      className={cn(
                        "p-3.5 rounded-xl border transition-all relative overflow-hidden",
                        log.type === "warning"
                          ? "bg-red-500/5 border-red-500/20"
                          : "bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10",
                      )}
                    >
                      {" "}
                      {log.type === "warning" && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                      )}{" "}
                      <h4
                        className={cn(
                          "text-xs md:text-sm font-bold mb-1.5 uppercase tracking-wider",
                          log.type === "warning"
                            ? "text-red-500 pl-1.5"
                            : "text-blue-500",
                        )}
                      >
                        {" "}
                        {log.type}{" "}
                      </h4>{" "}
                      <p
                        className={cn(
                          "text-sm md:text-base font-bold text-slate-800 dark:text-slate-200 leading-snug",
                          log.type === "warning" && "pl-1.5",
                        )}
                      >
                        {log.userName} {log.action}
                      </p>{" "}
                      <p
                        className={cn(
                          "text-xs text-slate-500 mt-1.5",
                          log.type === "warning" && "pl-1.5",
                        )}
                      >
                        {log.createdAt?.toDate().toLocaleDateString()}
                      </p>{" "}
                    </div>
                  ))
                )}{" "}
              </div>{" "}
            </Card>{" "}
          </div>{" "}
          {/* Side Column: Team & Join Requests */}{" "}
          <div className="flex flex-col gap-6">
            {" "}
            <Card className="p-6">
              {" "}
              <div className="flex items-center justify-between mb-6">
                {" "}
                <h3 className="text-xl md:text-2xl font-black font-display text-slate-800 dark:text-slate-200">
                  Team Members ({teamMembers.length})
                </h3>{" "}
                <Users className="h-5 w-5 text-blue-500" />{" "}
              </div>{" "}
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto scrollbar-hide">
                {" "}
                {teamMembers.length > 0 ? (
                  teamMembers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between group p-2.5 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                    >
                      {" "}
                      <div className="flex items-center gap-3 min-w-0">
                        {" "}
                        <Avatar
                          fallback={user.name?.charAt(0) || "?"}
                          size="sm"
                          className="ring-2 ring-transparent group-hover:ring-blue-500/30 transition-all shrink-0"
                        />{" "}
                        <div className="min-w-0">
                          {" "}
                          <p className="text-base md:text-lg font-bold text-slate-900 dark:text-white truncate">
                            {user.name}
                          </p>{" "}
                          <p className="text-xs md:text-sm text-slate-500 truncate">
                            {user.department || "General"} Dept
                          </p>{" "}
                        </div>{" "}
                      </div>{" "}
                      {user.role === "Team Lead" && (
                        <Badge className="ml-2 shrink-0 rounded-xl px-2.5 py-0.5 border-none font-bold text-[10px] md:text-xs uppercase bg-blue-600 text-white shadow-sm">
                          Lead
                        </Badge>
                      )}{" "}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-center text-slate-500 py-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                    No team members yet.
                  </div>
                )}{" "}
              </div>{" "}
            </Card>{" "}
            {userProfile?.role === "Team Lead" && joinRequests.length > 0 && (
              <Card className="border-blue-500/30 bg-blue-500/5 p-4 relative overflow-hidden">
                {" "}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />{" "}
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  {" "}
                  <UserPlus className="h-5 w-5 text-blue-500" />{" "}
                  <h3 className="text-xl md:text-2xl font-black font-display text-blue-600 dark:text-blue-400">
                    Pending Approvals
                  </h3>{" "}
                </div>{" "}
                <div className="space-y-3 relative z-10">
                  {" "}
                  {joinRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-3 rounded-xl bg-white/60 dark:bg-black/20 backdrop-blur-md border border-slate-200/50 dark:border-white/5 flex flex-col gap-3"
                    >
                      {" "}
                      <div className="min-w-0">
                        {" "}
                        <p className="text-base md:text-lg font-bold text-slate-900 dark:text-white truncate">
                          {request.userName}
                        </p>{" "}
                        <p className="text-xs text-slate-500 truncate">
                          {request.userEmail}
                        </p>{" "}
                      </div>{" "}
                      <div className="flex items-center gap-2 grid grid-cols-2">
                        {" "}
                        <button
                          onClick={() => handleApproveRequest(request)}
                          disabled={!!processingRequest}
                          className="py-2 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-xs md:text-sm font-bold hover:bg-emerald-500 hover:text-white transition-all"
                        >
                          {" "}
                          <CheckCircle className="h-4 w-4" /> Approve{" "}
                        </button>{" "}
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={!!processingRequest}
                          className="py-2 flex items-center justify-center gap-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-500 text-xs md:text-sm font-bold hover:bg-red-500 hover:text-white transition-all"
                        >
                          {" "}
                          <X className="h-4 w-4" /> Reject{" "}
                        </button>{" "}
                      </div>{" "}
                    </div>
                  ))}{" "}
                </div>{" "}
              </Card>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
