
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Customers from "./pages/Customers";
import Bookings from "./pages/Bookings";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                  <Toaster />
                  <Sonner />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <AppLayout>
                    <Customers />
                  </AppLayout>
                  <Toaster />
                  <Sonner />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/rooms" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <AppLayout>
                    <Rooms />
                  </AppLayout>
                  <Toaster />
                  <Sonner />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <AppLayout>
                    <Bookings />
                  </AppLayout>
                  <Toaster />
                  <Sonner />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/payments" element={
              <ProtectedRoute allowedRoles={["staff", "admin"]}>
                <TooltipProvider>
                  <AppLayout>
                    <Payments />
                  </AppLayout>
                  <Toaster />
                  <Sonner />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <AppLayout>
                    <Reports />
                  </AppLayout>
                  <Toaster />
                  <Sonner />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            
            {/* Not found route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
