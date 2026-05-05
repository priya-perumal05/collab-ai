import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Edit2, Save, X } from "lucide-react";
export function Profile() {
  const { userProfile, currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userProfile?.name || "");
  const [department, setDepartment] = useState(userProfile?.department || "");
  const [loading, setLoading] = useState(false);
  const handleSave = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", currentUser.uid), { name, department });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      {" "}
      <div className="bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl transition-colors duration-300">
        {" "}
        <div className="flex flex-col md:flex-row items-start md:justify-between gap-4 md:gap-0">
          {" "}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full md:w-auto">
            {" "}
            <Avatar
              fallback={userProfile?.name?.charAt(0) || "?"}
              size="lg"
              className="h-24 w-24 text-2xl"
            />{" "}
            <div>
              {" "}
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-2xl md:text-3xl font-bold bg-transparent border-b border-slate-300 dark:border-slate-600 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                />
              ) : (
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {userProfile?.name || "User Profile"}
                </h1>
              )}{" "}
              <p className="text-slate-500 dark:text-slate-400 text-lg mt-1">
                {userProfile?.role || "Team Member"}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <div className="w-full sm:w-auto self-center sm:self-start">
            {" "}
            {isEditing ? (
              <div className="flex gap-2">
                {" "}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  {" "}
                  <X className="h-4 w-4 mr-2" /> Cancel{" "}
                </Button>{" "}
                <Button size="sm" onClick={handleSave} disabled={loading}>
                  {" "}
                  <Save className="h-4 w-4 mr-2" /> Save{" "}
                </Button>{" "}
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                {" "}
                <Edit2 className="h-4 w-4 mr-2" /> Edit Profile{" "}
              </Button>
            )}{" "}
          </div>{" "}
        </div>{" "}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {" "}
          <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 ">
            {" "}
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">
              Contact Information
            </h3>{" "}
            <div className="space-y-4">
              {" "}
              <div>
                {" "}
                <label className="text-xs text-slate-500">Email</label>{" "}
                <div className="text-slate-900 dark:text-slate-200">
                  {userProfile?.email || "Not provided"}
                </div>{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="text-xs text-slate-500">
                  Department
                </label>{" "}
                {isEditing ? (
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full mt-1 bg-transparent border-b border-slate-300 dark:border-slate-600 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  />
                ) : (
                  <div className="text-slate-900 dark:text-slate-200">
                    {userProfile?.department || "General"}
                  </div>
                )}{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 ">
            {" "}
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">
              Performance Stats
            </h3>{" "}
            <div className="space-y-4">
              {" "}
              <div>
                {" "}
                <label className="text-xs text-slate-500">
                  Health Score
                </label>{" "}
                <div className="text-slate-900 dark:text-slate-200">
                  {userProfile?.healthScore || 0}%
                </div>{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="text-xs text-slate-500">
                  Tasks Completed
                </label>{" "}
                <div className="text-slate-900 dark:text-slate-200">
                  {userProfile?.tasksCompleted || 0}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
