import { useState } from "react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AccessCodeManager } from "@/components/admin/AccessCodeManager";
import { BackgroundManager } from "@/components/admin/BackgroundManager";
import { Helmet } from "react-helmet-async";
import { LayoutGrid, Settings, ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("isAdmin") === "true");
  const [tab, setTab] = useState<"access-codes" | "backgrounds">("access-codes");
  const navigate = useNavigate();

  if (!isAdmin) {
    return <AdminLogin onLoginSuccess={() => setIsAdmin(true)} />;
  }

  return (
    <div className="min-h-screen w-full bg-[#0d0d0d] text-gray-300" style={{ fontFamily: "'Figtree', sans-serif" }}>
      <Helmet>
        <title>관리자 대시보드 | 엑세스 코드 관리</title>
        <meta name="description" content="관리자 페이지에서 엑세스 코드와 배경을 관리하세요." />
        <link rel="canonical" href={`${window.location.origin}/admin`} />
      </Helmet>

      <div className="w-full min-h-screen flex">
        {/* Sidebar */}
        <aside className="w-16 md:w-20 bg-[#1a1a1a] border-r border-[#c9a84c]/10 flex flex-col items-center py-8 space-y-8 sticky top-0 h-screen">
          <div className="w-10 h-10 rounded bg-[#c9a84c] flex items-center justify-center shadow-[0_0_20px_-4px_rgba(201,168,76,0.6)]">
            <div className="w-5 h-5 border-2 border-[#0d0d0d]" />
          </div>
          <nav className="flex flex-col space-y-6">
            <button
              onClick={() => setTab("access-codes")}
              className={`${tab === "access-codes" ? "text-[#c9a84c]" : "text-gray-600 hover:text-[#c9a84c]"} transition-colors`}
              title="엑세스 코드"
            >
              <LayoutGrid className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setTab("backgrounds")}
              className={`${tab === "backgrounds" ? "text-[#c9a84c]" : "text-gray-600 hover:text-[#c9a84c]"} transition-colors`}
              title="배경 관리"
            >
              <Settings className="w-6 h-6" strokeWidth={1.5} />
            </button>
          </nav>
          <button
            onClick={() => navigate("/")}
            className="mt-auto text-gray-600 hover:text-[#c9a84c] transition-colors"
            title="나가기"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="px-6 md:px-10 py-6 flex items-center justify-between border-b border-[#c9a84c]/10 bg-[#0d0d0d] sticky top-0 z-20 backdrop-blur">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase text-gray-500 hover:text-[#c9a84c] border border-[#1a1a1a] hover:border-[#c9a84c]/30 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                Back
              </button>
              <h1
                className="text-xl md:text-2xl font-bold tracking-tight text-white"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                관리자 대시보드
              </h1>
            </div>
            <div className="hidden md:flex space-x-2">
              <span className="px-4 py-1.5 text-[10px] bg-[#c9a84c] text-[#0d0d0d] font-bold uppercase tracking-[0.2em]">
                Access · Active
              </span>
              <span className="px-4 py-1.5 text-[10px] border border-[#c9a84c]/40 text-[#c9a84c] font-bold uppercase tracking-[0.2em]">
                Theme · Noir
              </span>
            </div>
          </header>

          {/* Tabs */}
          <div className="px-6 md:px-10 pt-6">
            <div className="flex border-b border-[#1a1a1a]">
              <button
                onClick={() => setTab("access-codes")}
                className={`px-6 py-3 text-sm transition-colors ${
                  tab === "access-codes"
                    ? "border-b-2 border-[#c9a84c] text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                엑세스 코드 관리
              </button>
              <button
                onClick={() => setTab("backgrounds")}
                className={`px-6 py-3 text-sm transition-colors ${
                  tab === "backgrounds"
                    ? "border-b-2 border-[#c9a84c] text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                배경 관리
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 md:p-10">
            {tab === "access-codes" ? <AccessCodeManager /> : <BackgroundManager />}
          </div>

          {/* Footer */}
          <footer className="bg-[#1a1a1a] px-6 md:px-10 py-2 text-[10px] text-gray-600 flex justify-between border-t border-[#c9a84c]/10">
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              admin.console / v2.4.0_noir
            </span>
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse" />
              Encrypted Connection Active
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Admin;
