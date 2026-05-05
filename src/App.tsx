/** * @license * SPDX-License-Identifier: Apache-2.0 */ import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Login } from "./pages/Login";
import { TeamSetup } from "./pages/TeamSetup";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, userProfile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1120] text-slate-500 dark:text-slate-400">
        Loading...
      </div>
    );
  }
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  if (
    userProfile &&
    !userProfile.teamId &&
    userProfile.role === "Team Member"
  ) {
    return <TeamSetup />;
  }
  return <>{children}</>;
}
export default function App() {
  return (
    <ErrorBoundary>
      {" "}
      <ThemeProvider>
        {" "}
        <AuthProvider>
          {" "}
          <Router>
            {" "}
            <Routes>
              {" "}
              <Route path="/login" element={<Login />} />{" "}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    {" "}
                    <Layout />{" "}
                  </ProtectedRoute>
                }
              />{" "}
            </Routes>{" "}
          </Router>{" "}
        </AuthProvider>{" "}
      </ThemeProvider>{" "}
    </ErrorBoundary>
  );
}
