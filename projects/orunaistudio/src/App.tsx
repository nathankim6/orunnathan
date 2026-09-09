import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EmbeddedApp from "./pages/EmbeddedApp";
import NotFound from "./pages/NotFound";

/* GRAMMAR 는 학생 응시 링크를 location.origin+location.pathname 으로 만든다.
   blob 주소에서는 그 값이 blob 식별자가 되어 학생이 못 쓰는 주소가 나가므로,
   이 페이지의 진짜 주소로 바꿔 준다. */
const GRAMMAR_PATCH: Array<[string, string]> = [
  ['location.origin+location.pathname', '"%PAGE_URL%"'],
];

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/universe"
            element={
              <EmbeddedApp
                src="/orun-universe.html"
                title="ORUN UNIVERSE"
                subtitle="다섯 Galaxy로 보는 옳은영어 커리큘럼 지도"
                poster="/orun-universe-poster.jpg"
              />
            }
          />
          <Route
            path="/grammar"
            element={
              <EmbeddedApp
                src="/orun-grammar.html"
                title="ORUN GRAMMAR"
                subtitle="영문법 개념부터 시험지 출제까지"
                patch={GRAMMAR_PATCH}
              />
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
