import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VolunteerProvider } from "@/context/VolunteerContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Transcripts from "./pages/Transcripts";
import TranscriptDetail from "./pages/TranscriptDetail";
import Clients from "./pages/Clients";
import Cases from "./pages/Cases";
import Analyze from "./pages/Analyze";
import CommissionerBreakdown from "./pages/CommissionerBreakdown";
import FormGenerator from "./pages/FormGenerator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <VolunteerProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/cases/:id" element={<Cases />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/commissioner-breakdown" element={<CommissionerBreakdown />} />
            <Route path="/form-generator" element={<FormGenerator />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/transcripts" element={<Transcripts />} />
            <Route path="/transcript/:id" element={<TranscriptDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </VolunteerProvider>
  </QueryClientProvider>
);

export default App;
