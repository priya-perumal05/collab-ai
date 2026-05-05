import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import {
  Search,
  Star,
  MoreVertical,
  ExternalLink,
  Trash2,
  Folder,
  Plus,
  Loader2,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useData } from "../hooks/useData";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
export default function Favorites() {
  const { favorites, loading } = useData();
  const { currentUser, userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newFav, setNewFav] = useState({
    title: "",
    type: "Project",
    category: "General",
  });
  const filteredFavorites = favorites.filter(
    (f) =>
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const handleAdd = async () => {
    if (!newFav.title || !currentUser || !userProfile?.teamId) return;
    try {
      await addDoc(collection(db, "favorites"), {
        ...newFav,
        userId: currentUser.uid,
        teamId: userProfile.teamId,
        updatedAt: serverTimestamp(),
      });
      setNewFav({ title: "", type: "Project", category: "General" });
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  };
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "favorites", id));
    } catch (error) {
      console.error("Error deleting favorite:", error);
    }
  };
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        {" "}
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />{" "}
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
          Loading Favorites...
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
            Favorites
          </h1>{" "}
          <p className="text-slate-500 dark:text-slate-400">
            Quick access to your most important items
          </p>{" "}
        </div>{" "}
        <div className="relative group">
          {" "}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />{" "}
          <input
            type="text"
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-2xl glass-card text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all w-64"
          />{" "}
        </div>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {" "}
        {filteredFavorites.map((item) => (
          <Card
            key={item.id}
            className=" hover:border-blue-500/30 transition-all group cursor-pointer"
          >
            {" "}
            <CardContent className="p-6 space-y-6">
              {" "}
              <div className="flex items-center justify-between">
                {" "}
                <div className="h-12 w-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  {" "}
                  <Folder className="h-6 w-6" />{" "}
                </div>{" "}
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-400 transition-colors">
                  {" "}
                  <MoreVertical className="h-5 w-5" />{" "}
                </button>{" "}
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                  {" "}
                  {item.title}{" "}
                </h3>{" "}
                <div className="flex items-center gap-2">
                  {" "}
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-none text-[10px] font-bold uppercase tracking-wider"
                  >
                    {" "}
                    {item.type}{" "}
                  </Badge>{" "}
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    •
                  </span>{" "}
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {item.category}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                {" "}
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {" "}
                  {item.updatedAt?.seconds
                    ? `Updated ${new Date(item.updatedAt.seconds * 1000).toLocaleDateString()}`
                    : "Just now"}{" "}
                </span>{" "}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {" "}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                    title="Remove"
                  >
                    {" "}
                    <Trash2 className="h-4 w-4" />{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
            </CardContent>{" "}
          </Card>
        ))}{" "}
        {isAdding ? (
          <Card className="border-2 border-blue-500/30 bg-white/80 dark:bg-white/10">
            {" "}
            <CardContent className="p-6 space-y-4">
              {" "}
              <input
                autoFocus
                type="text"
                placeholder="Title..."
                value={newFav.title}
                onChange={(e) =>
                  setNewFav({ ...newFav, title: e.target.value })
                }
                className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 text-sm font-bold focus:outline-none focus:border-blue-500 py-1"
              />{" "}
              <div className="flex gap-2">
                {" "}
                <select
                  value={newFav.type}
                  onChange={(e) =>
                    setNewFav({ ...newFav, type: e.target.value })
                  }
                  className="bg-slate-100 dark:bg-white/5 rounded-lg p-2 text-[10px] font-bold outline-none flex-1"
                >
                  {" "}
                  <option>Project</option> <option>Document</option>{" "}
                  <option>Board</option> <option>Goal</option>{" "}
                </select>{" "}
                <input
                  type="text"
                  placeholder="Category..."
                  value={newFav.category}
                  onChange={(e) =>
                    setNewFav({ ...newFav, category: e.target.value })
                  }
                  className="bg-slate-100 dark:bg-white/5 rounded-lg p-2 text-[10px] font-bold outline-none flex-1"
                />{" "}
              </div>{" "}
              <div className="flex gap-2">
                {" "}
                <button
                  onClick={handleAdd}
                  disabled={!newFav.title}
                  className="flex-1 bg-blue-600 text-white rounded-xl py-2 text-xs font-bold"
                >
                  {" "}
                  Add{" "}
                </button>{" "}
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl py-2 text-xs font-bold"
                >
                  {" "}
                  Cancel{" "}
                </button>{" "}
              </div>{" "}
            </CardContent>{" "}
          </Card>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="h-full min-h-[240px] border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-blue-500 hover:border-blue-500/30 transition-all group"
          >
            {" "}
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              {" "}
              <Plus className="h-6 w-6" />{" "}
            </div>{" "}
            <span className="text-sm font-bold">Add to Favorites</span>{" "}
          </button>
        )}{" "}
      </div>{" "}
    </div>
  );
}
