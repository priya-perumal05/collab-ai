import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Activity } from "lucide-react";
export function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"Team Lead" | "Team Member">("Team Member");
  const navigate = useNavigate();
  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setLoading(true);
      sessionStorage.setItem("selectedRole", role);
      const userCredential = await signInWithPopup(auth, googleProvider);
      
      const { getDoc, doc } = await import("firebase/firestore");
      const userRef = doc(db, "users", userCredential.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const profile = userSnap.data();
        if (profile.role && profile.role !== role) {
           const { updateDoc } = await import("firebase/firestore");
           await updateDoc(userRef, { role: role });
        }
      }
      
      navigate("/");
    } catch (err: any) {
      if (err.code === "auth/network-request-failed" || err.code === "auth/popup-closed-by-user" || err.code === "auth/web-storage-unsupported") {
        setError(
          `Sign in failed (${err.code}). If you are viewing this inside the preview, third-party cookies might be blocked or the popup was prevented. Please open the app in a new tab (click the icon in the top right) to sign in successfully.`
        );
      } else {
        setError("Failed to sign in with Google. " + err.message);
      }
    } finally {
      if(!error) setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {" "}
      {/* Background ambient gradients */}{" "}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {" "}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[120px] transition-colors duration-300" />{" "}
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-400/20 dark:bg-cyan-600/20 blur-[120px] transition-colors duration-300" />{" "}
      </div>{" "}
      <div className="w-full max-w-md relative z-10">
        {" "}
        <div className="bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl transition-colors duration-300">
          {" "}
          <div className="flex flex-col items-center mb-8">
            {" "}
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
              {" "}
              <Activity className="h-8 w-8 text-white" />{" "}
            </div>{" "}
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 text-center whitespace-nowrap">
              Welcome to Collab AI
            </h1>{" "}
            <p className="text-slate-500 dark:text-slate-400 text-center">
              Sign in or create an account to manage your team tasks and
              performance.
            </p>{" "}
          </div>{" "}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
              {" "}
              {error}{" "}
            </div>
          )}{" "}
          <div className="space-y-6">
            {" "}
            <div className="space-y-3">
              {" "}
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Select your role
              </label>{" "}
              <div className="grid grid-cols-2 gap-3">
                {" "}
                <button
                  onClick={() => setRole("Team Lead")}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${role === "Team Lead" ? "bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-500/25" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"}`}
                >
                  {" "}
                  Team Lead{" "}
                </button>{" "}
                <button
                  onClick={() => setRole("Team Member")}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${role === "Team Member" ? "bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-500/25" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"}`}
                >
                  {" "}
                  Team Member{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 text-base flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-100"
            >
              {" "}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                {" "}
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />{" "}
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />{" "}
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />{" "}
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />{" "}
              </svg>{" "}
              Continue with Google{" "}
            </Button>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
