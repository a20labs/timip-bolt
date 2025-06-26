import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { AuthPage } from './components/auth/AuthPage';
import { PhoneDialer } from './components/dialer/PhoneDialer';
import { PWAComponents } from './components/PWAComponents';
import { MobileOptimizer } from './components/MobileOptimizer';
import { DebugPanel } from './components/DebugPanel';
// import { PWAInstallPrompt } from './components/PWAInstallPrompt'; // DISABLED
import { VocabularyProvider } from './contexts/VocabularyContext';
import { PlayerProvider } from './components/player/PlayerContext';
import { useAuthStore } from './stores/authStore';
import { useDialerStore } from './stores/dialerStore';
import { offlineStore } from './utils/offlineStore';
import { backgroundSync } from './services/backgroundSync';

// Add new pages for policies
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(module => ({ default: module.TermsOfService })));
const DataDeletion = lazy(() => import('./pages/DataDeletion').then(module => ({ default: module.DataDeletion })));
const DeletionStatus = lazy(() => import('./pages/DeletionStatus').then(module => ({ default: module.DeletionStatus })));

// Conditionally import React Query DevTools only in development
const ReactQueryDevtools = import.meta.env.DEV 
  ? lazy(() => import('@tanstack/react-query-devtools').then(module => ({ default: module.ReactQueryDevtools })))
  : null;

// Lazy load pages for better code splitting
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Catalog = lazy(() => import('./pages/Catalog').then(module => ({ default: module.Catalog })));
const Releases = lazy(() => import('./pages/Releases').then(module => ({ default: module.Releases })));
const Compliance = lazy(() => import('./pages/Compliance').then(module => ({ default: module.Compliance })));
const Analytics = lazy(() => import('./pages/Analytics').then(module => ({ default: module.Analytics })));
const Commerce = lazy(() => import('./pages/Commerce').then(module => ({ default: module.Commerce })));
const Community = lazy(() => import('./pages/Community').then(module => ({ default: module.Community })));
const Finances = lazy(() => import('./pages/Finances').then(module => ({ default: module.Finances })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const ProfilePage = lazy(() => import('./components/profile/ProfilePage').then(module => ({ default: module.ProfilePage })));
const AiTeamPage = lazy(() => import('./pages/ai-team/AiTeamPage').then(module => ({ default: module.AiTeamPage })));
const Store = lazy(() => import('./pages/Store').then(module => ({ default: module.Store })));
const Library = lazy(() => import('./pages/Library').then(module => ({ default: module.Library })));
const PlayerDemo = lazy(() => import('./pages/PlayerDemo').then(module => ({ default: module.PlayerDemo })));

// Add subscription page
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage').then(module => ({ default: module.SubscriptionPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuthStore();
  const { isDialerOpen, closeDialer, selectedAgent, agentAvatar } = useDialerStore();

  // Debug logging for authentication state with more detail
  useEffect(() => {
    console.log('🚀 App - Authentication state changed:', {
      hasUser: !!user,
      email: user?.email,
      role: user?.role,
      loading: loading,
      timestamp: Date.now(),
      userObject: user
    });
    
    // Also log the entire user object in production for debugging
    if (user) {
      console.log('🚀 App - Full user object:', JSON.stringify(user, null, 2));
    }
  }, [user, loading]);

  useEffect(() => {
    // Initialize offline store on app load
    offlineStore.init();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const handleCall = (phoneNumber: string) => {
    // Handle the actual call logic here
    console.log('Calling:', phoneNumber);
  };

  return (
    <VocabularyProvider>
      <PlayerProvider>
        <DebugPanel />
        <Suspense fallback={<LoadingSpinner />}>
          {user ? (
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={user.role === 'superadmin' ? <AdminDashboard /> : <Dashboard />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/catalog/*" element={<Catalog />} />
                  <Route path="/releases" element={<Releases />} />
                  <Route path="/releases/*" element={<Releases />} />
                  <Route path="/compliance" element={<Compliance />} />
                  <Route path="/commerce" element={<Commerce />} />
                  <Route path="/commerce/*" element={<Commerce />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/community/*" element={<Community />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/analytics/*" element={<Analytics />} />
                  <Route path="/finances" element={<Finances />} />
                  <Route path="/finances/*" element={<Finances />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/ai-team" element={<AiTeamPage />} />
                  <Route path="/ai-team/*" element={<AiTeamPage />} />
                  <Route path="/store" element={<Store />} />
                  <Route path="/store/*" element={<Store />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/library/*" element={<Library />} />
                  <Route path="/subscription" element={<SubscriptionPage />} />
                  <Route path="/player" element={<PlayerDemo />} />
                  
                  {/* Profile Routes */}
                  <Route path="/u/:handle" element={<ProfilePage />} />
                  <Route path="/@:handle" element={<ProfilePage />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminDashboard />} />
                  <Route path="/admin/workspaces" element={<AdminDashboard />} />
                  <Route path="/admin/lexicon" element={<AdminDashboard />} />
                  <Route path="/admin/settings" element={<AdminDashboard />} />
                  <Route path="/admin/features" element={<AdminDashboard />} />
                  <Route path="/admin/notifications" element={<AdminDashboard />} />
                  <Route path="/admin/audit" element={<AdminDashboard />} />
                  <Route path="/admin/analytics" element={<AdminDashboard />} />
                  
                  {/* Catch-all route for unmatched paths */}
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </Suspense>
            </Layout>
          ) : (
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy/data-deletion" element={<DataDeletion />} />
              <Route path="/privacy/deletion-status" element={<DeletionStatus />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<LandingPage />} />
            </Routes>
          )}
        </Suspense>
        
        {/* Global Phone Dialer */}
        <PhoneDialer
          isOpen={isDialerOpen}
          onClose={closeDialer}
          onCall={handleCall}
          agentName={selectedAgent}
          agentAvatar={agentAvatar}
        />
      </PlayerProvider>
    </VocabularyProvider>
  );
}

function App() {
  useEffect(() => {
    // Initialize offline store on app start
    offlineStore.init().catch(console.error);
    
    // Add debug functions to window for console access
    (window as unknown as Record<string, unknown>).enableDebugMode = () => {
      localStorage.setItem('debug-mode', 'true');
      window.location.reload();
    };
    
    (window as unknown as Record<string, unknown>).debugAuthState = () => {
      const authState = useAuthStore.getState();
      console.log('🔍 Current Auth State:', authState);
      return authState;
    };
    
    // Cleanup background sync on unmount
    return () => {
      backgroundSync.destroy();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AppContent />
        <PWAComponents />
        <MobileOptimizer />
        {/* PWAInstallPrompt - DISABLED */}
        {/* <PWAInstallPrompt 
          onInstall={() => console.log('PWA installed successfully')}
          onDismiss={() => console.log('PWA install prompt dismissed')}
        /> */}
      </BrowserRouter>
      {ReactQueryDevtools && import.meta.env.DEV && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}

export default App;