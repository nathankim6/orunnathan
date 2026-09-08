
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import WorkbookPreviewPage from "./pages/WorkbookPreviewPage";
import QuizBookGenerator from "./pages/QuizBookGenerator";
import { AccessCodeCheck } from "./components/AccessCodeCheck";

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const handleFocus = () => {
      const lastLoginTime = localStorage.getItem("lastLoginTime");
      const hasStoredAccess = localStorage.getItem("hasAccess");

      if (!hasStoredAccess || !lastLoginTime) {
        setHasAccess(false);
        return;
      }

      // Super admin code - always grant access
      const currentCode = localStorage.getItem("accessCode");
      if (currentCode === "891127") {
        setHasAccess(true);
        return;
      }

      const timeDiff = Date.now() - parseInt(lastLoginTime);
      if (timeDiff >= SESSION_TIMEOUT) {
        localStorage.removeItem("hasAccess");
        localStorage.removeItem("lastLoginTime");
        localStorage.removeItem("subscriptionExpiry");
        localStorage.removeItem("userName");
        localStorage.removeItem("isAdmin");
        setHasAccess(false);
      } else {
        setHasAccess(true);
      }
    };

    handleFocus();

    // Re-check on focus, cross-tab storage changes, and explicit auth-changed events
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleFocus);
    window.addEventListener('auth-changed', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleFocus);
      window.removeEventListener('auth-changed', handleFocus);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={hasAccess ? <Index /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={
              hasAccess ? (
                <Navigate to="/" />
              ) : (
                <AccessCodeCheck onAccessGranted={() => setHasAccess(true)} />
              )
            }
          />
          <Route path="/admin" element={<Admin />} />
          <Route path="/workbook-preview" element={<WorkbookPreviewPage />} />
          <Route path="/quiz-book-generator" element={<QuizBookGenerator />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
