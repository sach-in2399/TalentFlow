import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import {Jobs}  from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Candidates from "./pages/Candidates";
import CandidateProfile from "./pages/CandidateProfile"; //  add this import
import Assessments from "./pages/Assessments";
import NotFound from "./pages/NotFound";
import AssessmentDetail from "./pages/AssessmentDetail";


const queryClient = new QueryClient();
const HelloPage = () => <div>hello</div>;
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:jobId" element={<JobDetail />} />
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/candidates/:id" element={<CandidateProfile />} /> {/* 👈 profile route */}
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/assessments/:jobId" element={<AssessmentDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} /> 
            </Routes>
          </MainLayout>
        </BrowserRouter>  
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
