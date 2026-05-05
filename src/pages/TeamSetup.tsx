import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import { Button } from "../components/ui/Button";
import {
  Users,
  LogIn,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { JoinRequest } from "../types";
import { cn } from "../lib/utils";
export function TeamSetup() {
  const { userProfile, currentUser, logout } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "joinRequests"),
      where("userId", "==", currentUser.uid),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requests: JoinRequest[] = [];
        snapshot.forEach((doc) => {
          requests.push({ id: doc.id, ...doc.data() } as JoinRequest);
        });
        setPendingRequests(requests);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "joinRequests");
      },
    );
    return () => unsubscribe();
  }, [currentUser, userProfile?.teamId]);
  const handleJoinRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !currentUser || !userProfile) return;
    setLoading(true);
    setError("");
    try {
      const q = query(
        collection(db, "teams"),
        where("joinCode", "==", joinCode.toUpperCase()),
      );
      const querySnapshot = await getDocs(q);
      console.log("querySnapshot size", querySnapshot.size);
      if (querySnapshot.empty) {
        setError("Invalid join code. Please check with your Team Lead.");
        setLoading(false);
        return;
      }
      const teamDoc = querySnapshot.docs[0];
      const teamData = teamDoc.data();
      const joinRequestData = {
        userId: currentUser.uid,
        userName: userProfile.name || "Unknown",
        userEmail: userProfile.email || "unknown@example.com",
        teamId: teamDoc.id,
        teamName: teamData.name || "Unknown Team",
        teamLeadId: teamData.leadId || "",
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      console.log("Sending join request:", joinRequestData);
      await setDoc(doc(db, "joinRequests", `${currentUser.uid}_${teamDoc.id}`), joinRequestData);
    } catch (err: any) {
      console.error("Error querying teams or sending join request:", err);
      setError(err.message || "Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleCancelRequest = async (requestId: string) => {
    setLoading(true);
    try {
      const { deleteDoc } = await import("firebase/firestore");
      const requestRef = doc(db, "joinRequests", requestId);
      await deleteDoc(requestRef);
    } catch (err) {
      console.error("Error cancelling request:", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {" "}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {" "}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[120px] transition-colors duration-300" />{" "}
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-400/20 dark:bg-cyan-600/20 blur-[120px] transition-colors duration-300" />{" "}
      </div>{" "}
      <div className="w-full max-w-md relative z-10">
        {" "}
        <div className="bg-transparent border border-white/40 dark:border-white/10 rounded-[2rem] p-8 glass-card">
          {" "}
          <div className="flex flex-col items-center mb-8">
            {" "}
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
              {" "}
              <Users className="h-8 w-8 text-white" />{" "}
            </div>{" "}
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Join a Team
            </h1>{" "}
            <p className="text-slate-500 dark:text-slate-400 text-center">
              {" "}
              {pendingRequests.length > 0
                ? "Your requests are below."
                : "Enter a join code to request access to a team."}{" "}
            </p>{" "}
          </div>{" "}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 p-4 rounded-xl mb-6 text-sm">
              {" "}
              {error}{" "}
            </div>
          )}{" "}
          
          <form onSubmit={handleJoinRequest} className="space-y-4 mb-8">
            {" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Join Code
              </label>{" "}
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full bg-transparent border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 uppercase placeholder:normal-case placeholder:text-slate-400"
                placeholder="Enter 6-character code"
                maxLength={6}
                required
                disabled={loading}
              />{" "}
            </div>{" "}
            <Button
              type="submit"
              disabled={loading || !joinCode.trim()}
              className="w-full h-12 flex items-center justify-center gap-2"
            >
              {" "}
              <LogIn className="h-5 w-5" /> Send Request{" "}
            </Button>{" "}
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
              {" "}
              Ask your Team Lead for the 6-character join code. They will need
              to approve your request.{" "}
            </p>{" "}
          </form>

          {pendingRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Pending Requests</h3>
              {pendingRequests.map(request => (
                <div
                  key={request.id}
                  className={cn(
                    "p-4 rounded-2xl border flex items-center gap-4",
                    request.status === "pending"
                      ? "bg-amber-500/5 border-amber-500/20"
                      : request.status === "approved"
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-red-500/5 border-red-500/20",
                  )}
                >
                  {request.status === "pending" && (
                    <Clock className="h-8 w-8 text-amber-500 animate-pulse shrink-0" />
                  )}
                  {request.status === "approved" && (
                    <CheckCircle className="h-8 w-8 text-emerald-500 shrink-0" />
                  )}
                  {request.status === "rejected" && (
                    <XCircle className="h-8 w-8 text-red-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center justify-between">
                      <span>
                        {request.status === "pending" && "Request Pending"}
                        {request.status === "approved" && "Request Approved!"}
                        {request.status === "rejected" && "Request Rejected"}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      Team: <span className="font-semibold text-slate-700 dark:text-slate-300">{request.teamName}</span>
                    </p>
                  </div>
                  {request.status === "pending" && (
                    <Button
                      variant="outline"
                      onClick={() => handleCancelRequest(request.id)}
                      disabled={loading}
                      title="Cancel request"
                      className="px-3"
                    >
                      Cancel
                    </Button>
                  )}
                  {request.status === "rejected" && (
                    <Button
                      variant="outline"
                      onClick={() => handleCancelRequest(request.id)}
                      className="px-3"
                    >
                      Dismiss
                    </Button>
                  )}
                  {request.status === "approved" && (
                    <Button
                      variant="default"
                      onClick={() => {
                        window.location.href = "/";
                        handleCancelRequest(request.id);
                      }}
                      className="px-3"
                    >
                      Enter
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => logout()}
            className="w-full text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center gap-2 mt-8"
          >
            {" "}
            <ArrowLeft className="h-4 w-4" /> Switch Account{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
