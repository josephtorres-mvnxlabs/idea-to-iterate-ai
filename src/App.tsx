
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EpicsAndTasks from "./pages/EpicsAndTasks";
import ProductIdeas from "./pages/ProductIdeas";
import Reports from "./pages/Reports";
import Team from "./pages/Team";
import TeamMemberProfile from "./pages/TeamMemberProfile";
import Settings from "./pages/Settings";
import ChangeHistory from "./pages/ChangeHistory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/epics-and-tasks" element={<EpicsAndTasks />} />
          <Route path="/product-ideas" element={<ProductIdeas />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/team" element={<Team />} />
          <Route path="/team/profile/:id" element={<TeamMemberProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/change-history" element={<ChangeHistory />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
