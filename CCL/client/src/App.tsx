import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";

import AuthPage from "@/pages/auth-page";
import EventsList from "@/pages/events-list";
import EventDetail from "@/pages/event-detail";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading...</div>;

  if (!user || (!user.isApproved && user.role !== "super-admin")) {
    return <AuthPage />;
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

// Public wrapper for auth page (redirects if logged in)
function AuthWrapper() {
  const { user } = useAuth();
  if (user && (user as any)._isUnapprovedSession) {
    return <AuthPage forcePendingMessage />;
  }
  return <AuthPage />;
}

function Router() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user && (user as any)._isUnapprovedSession) {
      setLocation("/auth");
    }
  }, [user, setLocation]);

  return (
    <Switch>
      <Route path="/auth" component={AuthWrapper} />

      {/* Publicly visible events list, but layout handles auth state */}
      <Route path="/">
        <Layout>
          <EventsList />
        </Layout>
      </Route>

      {/* Event details page */}
      <Route path="/events/:id">
        <Layout>
          <EventDetail />
        </Layout>
      </Route>

      {/* Admin dashboard */}
      <Route path="/admin">
        <Layout>
          <AdminDashboard />
        </Layout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
