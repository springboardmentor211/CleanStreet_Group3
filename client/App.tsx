import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";


import Welcome from "./pages/Welcome";
import IssueDetails from "./pages/IssueDetails";
import Explore from "./pages/Explore";
import Login from "./pages/Login";
import AdminSetup from "./pages/AdminSetup";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CommunityReports from "./pages/CommunityReports";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Report from "./pages/Report";
import NotFound from "./pages/NotFound";
import Maps from "./pages/Maps";
import Admindashboard from "./pages/Admindashboard";



import Complaints from "./pages/Complaints";
import ReportGenerator from "./pages/ReportGenerator";

// import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/issues/:id" element={<IssueDetails />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/report" element={<Report />} />
            <Route path="/complaints" element={<CommunityReports />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/maps" element={<Maps />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/admin/dashboard" element={<Admindashboard/>} />
            <Route path="/admin/complaints" element={<Complaints/>} />
            <Route path="/admin/report" element={<ReportGenerator/>} />
            <Route path="/admin-setup" element={<AdminSetup />} />
            <Route path="/admin-login" element={<AdminLogin />} />

            <Route path="/login" element={<AdminLogin />} />

            
          </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
