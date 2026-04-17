import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Pricing from "./pages/Pricing.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Settings from "./pages/Settings.tsx";
import History from "./pages/History.tsx";
import NewChat from "./pages/NewChat.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";
import { useAppStore } from "./store/useAppStore";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/lib/authService";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

// Sync Supabase Auth session & profile data with Zustand
const AuthStateSync = () => {
  const { login, logout } = useAppStore();

  useEffect(() => {
    // 1. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch up-to-date plan / limits from our tables
        const profile = await getProfile(session.user.id);
        if (profile) {
          useAppStore.setState({
            tokens: profile.tokens_remaining,
            userPlan: profile.plan,
            // Re-sync basic jurisdiction config to Zustand
            profile: { ...useAppStore.getState().profile, businessType: profile.jurisdiction },
          });
        }
        login(); // Sets isAuthenticated = true
      } else {
        logout(); // Disconnects session
      }
    });

    // 2. Initial manual fetch
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await getProfile(session.user.id);
        if (profile) {
          useAppStore.setState({ tokens: profile.tokens_remaining, userPlan: profile.plan, profile: { ...useAppStore.getState().profile, businessType: profile.jurisdiction } });
        }
        login();
      } else {
        logout();
      }
    });

    return () => subscription.unsubscribe();
  }, [login, logout]);

  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthStateSync />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/new" element={<ProtectedRoute><NewChat /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
