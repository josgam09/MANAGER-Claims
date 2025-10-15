import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClaimProvider } from "@/contexts/ClaimContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ClaimsList from "@/pages/ClaimsList";
import ClaimDetail from "@/pages/ClaimDetail";
import ClaimForm from "@/pages/ClaimForm";
import ClaimManagement from "@/pages/ClaimManagement";
import Admin from "@/pages/Admin";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ClaimProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Rutas protegidas */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/claims" element={
                <ProtectedRoute>
                  <Layout>
                    <ClaimsList />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/claims/new" element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <Layout>
                    <ClaimForm />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/claims/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <ClaimDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/claims/:id/edit" element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <Layout>
                    <ClaimForm />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/claims/:id/manage" element={
                <ProtectedRoute>
                  <Layout>
                    <ClaimManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Admin />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ClaimProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
