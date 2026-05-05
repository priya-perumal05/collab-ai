import React, { Component, ErrorInfo, ReactNode } from "react";
interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}
export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }
  public render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      let details = "";
      try {
        /* Try to parse our special JSON error */ const errInfo = JSON.parse(
          this.state.error?.message || "",
        );
        if (errInfo.error && errInfo.operationType) {
          errorMessage = `Firestore ${errInfo.operationType} failed.`;
          details = errInfo.error;
        }
      } catch (e) {
        /* Not a JSON error */ errorMessage =
          this.state.error?.message || errorMessage;
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1120] p-4">
          {" "}
          <div className="max-w-md w-full glass-card text-slate-900 dark:text-slate-100 rounded-3xl p-8 shadow-xl text-center space-y-6">
            {" "}
            <div className="h-16 w-16 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-600">
              {" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />{" "}
              </svg>{" "}
            </div>{" "}
            <div className="space-y-2">
              {" "}
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Application Error
              </h2>{" "}
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                {errorMessage}
              </p>{" "}
              {details && (
                <p className="text-xs text-red-500 font-mono mt-2 break-all">
                  {details}
                </p>
              )}{" "}
            </div>{" "}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/25"
            >
              {" "}
              Reload Application{" "}
            </button>{" "}
          </div>{" "}
        </div>
      );
    }
    return this.props.children;
  }
}
