import "../client/global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "../client/pages/Index";
import MainPage from "../client/pages/MainPage";
import WorkTracker from "../client/pages/WorkTracker";
import AnimalTracker from "../client/pages/AnimalTracker";
import NotFound from "../client/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/builder-aura-haven">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/expense-tracker" element={<Index />} />
          <Route path="/work-tracker" element={<WorkTracker />} />
          <Route path="/animal-tracker" element={<AnimalTracker />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);