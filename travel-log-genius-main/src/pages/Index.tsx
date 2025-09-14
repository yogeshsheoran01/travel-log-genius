import { useState, useEffect } from "react";
import { AuthPage } from "@/components/AuthPage";
import { ConsentPage } from "@/components/ConsentPage";
import { Dashboard } from "@/components/Dashboard";
import { ScientistDashboard } from "@/components/ScientistDashboard";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [currentView, setCurrentView] = useState<'user' | 'scientist'>('user');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (event === 'SIGNED_OUT') {
          setHasConsented(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show auth page
    if (!user) {
      return <AuthPage onAuthSuccess={async () => {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setIsLoading(false);
      }} />;
    }

  // Authenticated but no consent - show consent page
  if (!hasConsented) {
    return <ConsentPage onConsentGiven={() => setHasConsented(true)} />;
  }

  // Authenticated and consented - show main app
  return (
    <>
      {currentView === 'user' ? <Dashboard /> : <ScientistDashboard />}
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
    </>
  );
};

export default Index;
