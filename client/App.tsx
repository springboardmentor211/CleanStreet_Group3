import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";


import Welcome from "./pages/Welcome";
import Explore from "./pages/Explore";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CommunityReports from "./pages/CommunityReports";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Report from "./pages/Report";
import NotFound from "./pages/NotFound";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes: only accessible if NOT authenticated */}
            <Route path="/" element={
              <PublicRoute><Welcome /></PublicRoute>
            } />
            <Route path="/welcome" element={
              <PublicRoute><Welcome /></PublicRoute>
            } />
            <Route path="/login" element={
              <PublicRoute><Login /></PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute><Register /></PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute><ForgotPassword /></PublicRoute>
            } />
            <Route path="/reset-password" element={
              <PublicRoute><ResetPassword /></PublicRoute>
            } />

            {/* Protected routes: only accessible if authenticated */}
            <Route path="/explore" element={
              <ProtectedRoute><Explore /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/report" element={
              <ProtectedRoute><Report /></ProtectedRoute>
            } />
            <Route path="/complaints" element={
              <ProtectedRoute><CommunityReports /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
