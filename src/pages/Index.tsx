import { useEffect, useState } from "react";
import { QuestionGenerator } from "@/components/QuestionGenerator";
import { AppHeader } from "@/components/header/AppHeader";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { PageBackground } from "@/components/layout/PageBackground";
import { PageFooter } from "@/components/layout/PageFooter";

const Index = () => {
  const [userName, setUserName] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");

  useEffect(() => {
    const storedExpiry = localStorage.getItem("subscriptionExpiry");
    if (storedExpiry) {
      const formattedDate = new Date(storedExpiry).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      setExpiryDate(formattedDate);
    }

    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative font-inter">
      <PageBackground />

      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="flex flex-col space-y-6">
          {/* Header with premium styling */}
          <AppHeader />
          
          {/* Auth container */}
          <AuthContainer />
          
          {/* Main content area with glassmorphism */}
          <div className="relative group">
            {/* Outer glow on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-indigo-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* Main container */}
            <div className="relative bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.8)_inset] overflow-hidden">
              {/* Inner highlight */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent pointer-events-none" />
              
              {/* Subtle pattern */}
              <div 
                className="absolute inset-0 opacity-[0.02]"
                style={{
                  backgroundImage: `radial-gradient(circle at center, hsl(226 30% 50%) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}
              />
              
              {/* Content */}
              <div className="relative z-10 p-8">
                <QuestionGenerator />
              </div>
            </div>
          </div>
        </div>
      </div>

      <PageFooter />
    </div>
  );
};

export default Index;
