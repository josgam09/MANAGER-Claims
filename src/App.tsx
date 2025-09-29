import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClaimProvider } from "@/contexts/ClaimContext";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import ClaimsList from "@/pages/ClaimsList";
import ClaimDetail from "@/pages/ClaimDetail";
import ClaimForm from "@/pages/ClaimForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ClaimProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/claims" element={<ClaimsList />} />
              <Route path="/claims/new" element={<ClaimForm />} />
              <Route path="/claims/:id" element={<ClaimDetail />} />
              <Route path="/claims/:id/edit" element={<ClaimForm />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ClaimProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
