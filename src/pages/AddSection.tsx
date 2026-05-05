import React from "react";
import { Card, CardContent } from "../components/ui/Card";
import {
  Plus,
  Layout,
  List,
  Grid,
  ChevronRight,
  Save,
  Eye,
} from "lucide-react";
import { cn } from "../lib/utils";
export default function AddSection() {
  const templates = [
    {
      title: "Dashboard View",
      icon: Layout,
      desc: "A high-level overview with charts and stats",
    },
    {
      title: "List View",
      icon: List,
      desc: "A detailed list of items with filtering",
    },
    {
      title: "Board View",
      icon: Grid,
      desc: "A kanban-style board for workflow",
    },
  ];
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {" "}
      <div className="flex flex-wrap items-center justify-between gap-6">
        {" "}
        <div className="space-y-1">
          {" "}
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Add New Section
          </h1>{" "}
          <p className="text-slate-500 dark:text-slate-400">
            Create custom modules tailored to your team's needs
          </p>{" "}
        </div>{" "}
        <div className="flex items-center gap-3">
          {" "}
          <button className="flex items-center gap-2 px-6 py-3 rounded-2xl glass-card text-slate-900 dark:text-slate-100 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
            {" "}
            <Eye className="h-4 w-4" /> Preview{" "}
          </button>{" "}
          <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20 transition-all">
            {" "}
            <Save className="h-4 w-4" /> Save Section{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {" "}
        <div className="lg:col-span-1 space-y-8">
          {" "}
          <div className="space-y-4">
            {" "}
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Step 1: Choose Template
            </p>{" "}
            <div className="space-y-4">
              {" "}
              {templates.map((tpl, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl glass-card text-slate-900 dark:text-slate-100 hover:border-blue-500/30 transition-all cursor-pointer group"
                >
                  {" "}
                  <div className="flex items-center gap-4">
                    {" "}
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      {" "}
                      <tpl.icon className="h-6 w-6" />{" "}
                    </div>{" "}
                    <div className="flex-1">
                      {" "}
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {tpl.title}
                      </h3>{" "}
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {tpl.desc}
                      </p>{" "}
                    </div>{" "}
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 transition-transform" />{" "}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>{" "}
          <div className="space-y-4">
            {" "}
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Step 2: Section Details
            </p>{" "}
            <div className="space-y-4">
              {" "}
              <div className="space-y-2">
                {" "}
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Section Name
                </label>{" "}
                <input
                  type="text"
                  placeholder="e.g. Marketing Assets"
                  className="w-full px-5 py-3 rounded-2xl glass-card text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />{" "}
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Purpose
                </label>{" "}
                <textarea
                  placeholder="Describe what this section is for..."
                  rows={4}
                  className="w-full px-5 py-3 rounded-2xl glass-card text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                />{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="lg:col-span-2">
          {" "}
          <div className="h-full min-h-[600px] rounded-[40px] border-4 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center p-10 bg-slate-50/50 dark:bg-white/2 backdrop-blur-sm">
            {" "}
            <div className="h-24 w-24 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
              {" "}
              <Plus className="h-10 w-10" />{" "}
            </div>{" "}
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Build Your Custom Section
            </h3>{" "}
            <p className="text-slate-500 max-w-md mx-auto mb-10">
              Drag and drop components here to start building your custom
              module. You can add charts, lists, boards, and more.
            </p>{" "}
            <div className="flex flex-wrap justify-center gap-4">
              {" "}
              {["Chart Block", "Task List", "Team Grid", "Recent Activity"].map(
                (comp, i) => (
                  <div
                    key={i}
                    className="px-6 py-3 rounded-2xl glass-card text-slate-900 dark:text-slate-100 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-move hover:shadow-lg transition-all"
                  >
                    {" "}
                    {comp}{" "}
                  </div>
                ),
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
