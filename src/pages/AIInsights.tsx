import React, { useState, useRef } from "react";
import { useData } from "../hooks/useData";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  Sparkles,
  Users,
  BarChart3,
  FileText,
  Loader2,
  ChevronRight,
  BrainCircuit,
  AlertCircle,
  Check,
  Download,
  Copy,
} from "lucide-react";
import { geminiService } from "../lib/gemini";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
/* @ts-ignore */ import html2pdf from "html2pdf.js";
type InsightType = "team-builder" | "workload" | "docs";
export default function AIInsights() {
  const { users, tasks } = useData();
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<InsightType>("team-builder");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [projectDesc, setProjectDesc] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const isLead = userProfile?.role === "Team Lead";
  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      let response = "";
      if (activeTab === "team-builder") {
        response = await geminiService.suggestTeams(
          projectDesc || "General project management and execution",
          users,
        );
      } else if (activeTab === "workload") {
        response = await geminiService.monitorWorkload(users, tasks);
      } else if (activeTab === "docs") {
        response = await geminiService.generateDocumentation(
          tasks,
          projectDesc || "Project ongoing status",
        );
      }
      setResult(response);
    } catch (error: any) {
      console.error("AI Generation error:", error);
      const isRate = error?.status === 429 || error?.message?.includes("429") || error?.message?.toLowerCase().includes("rate") || error?.message?.toLowerCase().includes("quota");
      if (isRate) {
        setResult("### Rate limit exceeded\nThe Google AI API limit has been reached. Please wait a moment before trying again.");
      } else {
        setResult(
          "### Error\nFailed to generate AI insights. Please check your API key and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };
  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  const handleDownloadPDF = async () => {
    if (!reportRef.current || !result) return;
    setDownloading(true);
    setError(null);
    try {
      const element = reportRef.current;
      const opt = {
        margin: 15,
        filename: `CollabAI-Insight-${activeTab}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: "#ffffff",
          /* Force white background for the PDF */ onclone: (
            clonedDoc: Document,
          ) => {
            /* THE RIGID FIX: */ /* 1. Inject a pure, standard HEX stylesheet for the report to avoid oklch() */ const head =
              clonedDoc.head;
            const style = clonedDoc.createElement("style");
            style.innerHTML = ` body { background-color: white !important; color: #1f2937 !important; } .prose { max-width: none !important; color: #1f2937 !important; background-color: white !important; } .prose h3 { color: #2563eb !important; font-weight: bold !important; font-size: 20px !important; margin-top: 24px !important; margin-bottom: 12px !important; display: block !important; } .prose p { color: #374151 !important; line-height: 1.6 !important; margin-bottom: 16px !important; } .prose li { color: #374151 !important; margin-bottom: 4px !important; } .prose strong { color: #111827 !important; font-weight: 700 !important; } .prose ul { padding-left: 20px !important; list-style-type: disc !important; } * { color-scheme: light !important; border-color: #e5e7eb !important; /* Aggressively try to override any oklch usage */ outline-color: transparent !important; } `;
            head.appendChild(style);
            /* Map dark mode specific container to white for report */ const reportBody =
              clonedDoc.querySelector(".prose");
            if (reportBody) {
              (reportBody as HTMLElement).style.backgroundColor = "white";
              (reportBody as HTMLElement).style.color = "#1f2937";
            }
          },
        },
        jsPDF: {
          unit: "mm" as const,
          format: "a4" as const,
          orientation: "portrait" as const,
        },
      };
      /* Rigid execution */ await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF Export error:", err);
      setError(
        "Critical error generating PDF. Please use the 'Copy' button as a workaround.",
      );
    } finally {
      setDownloading(false);
    }
  };
  const tabs = [
    {
      id: "team-builder",
      label: "Team Builder",
      icon: Users,
      desc: "Optimal team suggestions",
    },
    {
      id: "workload",
      label: "Workload Balance",
      icon: BarChart3,
      desc: "Efficiency & balance analysis",
    },
    {
      id: "docs",
      label: "Auto-Docs",
      icon: FileText,
      desc: "Documentation & reports",
    },
  ];
  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      {" "}
      <div className="flex flex-wrap items-center justify-between gap-6">
        {" "}
        <div className="space-y-1">
          {" "}
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {" "}
            Collab AI Insights{" "}
            <Sparkles className="h-6 w-6 text-blue-500 fill-blue-500/20" />{" "}
          </h1>{" "}
          <p className="text-slate-500 dark:text-slate-400">
            Leverage AI to optimize your team, balance workload, and generate
            reports
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {" "}
        <div className="lg:col-span-1 space-y-4">
          {" "}
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as InsightType);
                  setResult(null);
                }}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left group",
                  activeTab === tab.id
                    ? "bg-blue-600 border-blue-600 shadow-xl shadow-blue-600/20 text-white"
                    : "glass-card text-slate-900 dark:text-slate-100 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-blue-500/50",
                )}
              >
                {" "}
                <div
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    activeTab === tab.id
                      ? "bg-white/20"
                      : "bg-slate-100 dark:bg-white/5 group-hover:bg-blue-500/10 group-hover:text-blue-500",
                  )}
                >
                  {" "}
                  <Icon className="h-5 w-5" />{" "}
                </div>{" "}
                <div className="flex-1">
                  {" "}
                  <p className="text-sm font-bold">{tab.label}</p>{" "}
                  <p
                    className={cn(
                      "text-[10px]",
                      activeTab === tab.id ? "text-blue-100" : "text-slate-400",
                    )}
                  >
                    {tab.desc}
                  </p>{" "}
                </div>{" "}
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    activeTab === tab.id
                      ? "translate-x-1"
                      : "opacity-0 group-hover:opacity-100",
                  )}
                />{" "}
              </button>
            );
          })}{" "}
        </div>{" "}
        <div className="lg:col-span-3 space-y-6">
          {" "}
          <Card className="min-h-[600px] flex flex-col relative overflow-hidden group">
            {" "}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />{" "}
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-white/5">
              {" "}
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                {" "}
                {activeTab === "team-builder" && (
                  <Users className="h-5 w-5 text-blue-500" />
                )}{" "}
                {activeTab === "workload" && (
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                )}{" "}
                {activeTab === "docs" && (
                  <FileText className="h-5 w-5 text-blue-500" />
                )}{" "}
                {tabs.find((t) => t.id === activeTab)?.label} Analysis{" "}
              </CardTitle>{" "}
              <div className="flex items-center gap-3">
                {" "}
                {result && !loading && (
                  <>
                    {" "}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      {" "}
                      {copied ? (
                        <>
                          {" "}
                          <Check className="h-4 w-4 mr-2 text-emerald-500" />{" "}
                          Copied!{" "}
                        </>
                      ) : (
                        <>
                          {" "}
                          <Copy className="h-4 w-4 mr-2" /> Copy{" "}
                        </>
                      )}{" "}
                    </Button>{" "}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadPDF}
                      disabled={downloading}
                      className="rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      {" "}
                      {downloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {" "}
                          <Download className="h-4 w-4 mr-2" /> PDF{" "}
                        </>
                      )}{" "}
                    </Button>{" "}
                  </>
                )}{" "}
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="rounded-xl shadow-lg shadow-blue-600/20 px-6 py-2.5"
                >
                  {" "}
                  {loading ? (
                    <>
                      {" "}
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                      Analyzing...{" "}
                    </>
                  ) : (
                    <>
                      {" "}
                      <Sparkles className="h-4 w-4 mr-2" /> Generate
                      Insights{" "}
                    </>
                  )}{" "}
                </Button>{" "}
              </div>{" "}
            </CardHeader>{" "}
            <CardContent className="flex-1 p-0 overflow-y-auto">
              {" "}
              {error && (
                <div className="mx-8 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center justify-between">
                  {" "}
                  <span className="flex items-center gap-2">
                    {" "}
                    <AlertCircle className="h-4 w-4" /> {error}{" "}
                  </span>{" "}
                  <button
                    onClick={() => setError(null)}
                    className="hover:text-red-600 font-bold uppercase tracking-widest text-[10px]"
                  >
                    Dismiss
                  </button>{" "}
                </div>
              )}{" "}
              <div className="p-8">
                {" "}
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 py-20 text-center">
                    {" "}
                    <div className="relative">
                      {" "}
                      <div className="h-16 w-16 rounded-full border-4 border-blue-500/20 animate-ping absolute inset-0" />{" "}
                      <div className="h-16 w-16 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin relative" />{" "}
                    </div>{" "}
                    <div className="space-y-2">
                      {" "}
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Collab AI is thinking...
                      </h3>{" "}
                      <p className="text-sm text-slate-500 max-w-xs">
                        Analyzing team performance, skills, and documentation
                        markers.
                      </p>{" "}
                    </div>{" "}
                  </div>
                ) : result ? (
                  <motion.div
                    ref={reportRef}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-white prose-h3:text-blue-600 dark:prose-h3:text-blue-400 prose-h3:font-bold prose-h3:tracking-tight prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-xl prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-li:text-slate-600 dark:prose-li:text-slate-400 prose-li:my-1 prose-ul:my-4 p-8 pt-0"
                  >
                    {" "}
                    <Markdown>{result}</Markdown>{" "}
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-6 py-20 text-center text-slate-400">
                    {" "}
                    <div className="h-20 w-20 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                      {" "}
                      <BrainCircuit className="h-10 w-10 opacity-20" />{" "}
                    </div>{" "}
                    <div className="space-y-2">
                      {" "}
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Ready to deep-dive?
                      </h3>{" "}
                      <p className="text-sm max-w-md">
                        Click "Generate Insights" to start the AI analysis based
                        on your current team data and specific context.
                      </p>{" "}
                    </div>{" "}
                    {(!users.length || !tasks.length) && (
                      <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-bold">
                        {" "}
                        <AlertCircle className="h-4 w-4" /> Warning: Low data
                        detected. Insights may be limited.{" "}
                      </div>
                    )}{" "}
                  </div>
                )}{" "}
              </div>{" "}
            </CardContent>{" "}
          </Card>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
