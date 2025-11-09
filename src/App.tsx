import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VolunteerProvider } from "@/context/VolunteerContext";
import { lazy, Suspense } from "react";

// Eager load critical pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";

// Lazy load other pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Upload = lazy(() => import("./pages/Upload"));
const Transcripts = lazy(() => import("./pages/Transcripts"));
const TranscriptDetail = lazy(() => import("./pages/TranscriptDetail"));
const Clients = lazy(() => import("./pages/Clients"));
const Cases = lazy(() => import("./pages/Cases"));
const Analyze = lazy(() => import("./pages/Analyze"));
const CommissionerBreakdown = lazy(() => import("./pages/CommissionerBreakdown"));
const CommissionerProfile = lazy(() => import("./pages/CommissionerProfile"));
const FormGenerator = lazy(() => import("./pages/FormGenerator"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <VolunteerProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/cases/:id" element={<Cases />} />
              <Route path="/analyze" element={<Analyze />} />
              <Route path="/commissioner-breakdown" element={<CommissionerBreakdown />} />
              <Route path="/commissioner/:id" element={<CommissionerProfile />} />
              <Route path="/commissioner/name/:name" element={<CommissionerProfile />} />
              <Route path="/form-generator" element={<FormGenerator />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/transcripts" element={<Transcripts />} />
              <Route path="/transcript/:id" element={<TranscriptDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </VolunteerProvider>
  </QueryClientProvider>
);

export default App;
