import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Navigation } from './components/layout/Navigation';
import { LuminaBottle } from './components/ui/LuminaBottle';
import { PurchaseModal } from './components/PurchaseModal';
import { KomorebiBackground } from './components/layout/KomorebiBackground';
import { ConnectionStatus } from './components/ui/ConnectionStatus';
import { SEOManager } from './components/SEOManager';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useLanguage } from './i18n/LanguageContext';
import { SoundscapeProvider } from './store/SoundscapeContext';
import { useTest } from './store/TestContext';
import { SoundControl } from './components/layout/SoundControl';
import { AuthPromptModal } from './components/AuthPromptModal';
import { useUserOrchestrator } from './hooks/useUserOrchestrator';
import { LoopStage } from './core/types';

// Lazy load pages
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const EnergyTest = lazy(() => import('./pages/EnergyTest').then(m => ({ default: m.EnergyTest })));
const EnergyReport = lazy(() => import('./pages/EnergyReport').then(m => ({ default: m.EnergyReport })));
const UserProfile = lazy(() => import('./pages/UserProfile').then(m => ({ default: m.UserProfile })));
const EnergyTimeline = lazy(() => import('./pages/EnergyTimeline').then(m => ({ default: m.EnergyTimeline })));
const Ocean = lazy(() => import('./pages/Ocean').then(m => ({ default: m.Ocean })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminLogin = lazy(() => import('./pages/AdminLogin').then(m => ({ default: m.AdminLogin })));
const Subscription = lazy(() => import('./pages/Subscription').then(m => ({ default: m.Subscription })));

// Minimalist Sanctuary Loader
const SanctuaryLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-bg-washi z-50">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1, 0.9] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="w-12 h-12 rounded-full bg-wood/10 blur-xl"
    />
  </div>
);

// Auth Guard Component
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <SanctuaryLoader />;
  if (!profile?.uid) {
    return <Navigate to="/" state={{ from: location, showAuth: true }} replace />;
  }
  return <>{children}</>;
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useLanguage();
  const { isPurchaseModalOpen, setIsPurchaseModalOpen, fetchUserPoints, setReportType } = useTest();
  const { loopStage, setLoopStage, streak, pendingReport, setPendingReport, checkPendingReports } = useUserOrchestrator();
  
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [pendingNavigate, setPendingNavigate] = useState<{ path: string; type?: 'daily' | 'wish' } | null>(null);

  // Sync loopStage based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path === '/test') setLoopStage('calibration');
    else if (path.startsWith('/report')) setLoopStage('resonance');
    else if (path === '/ocean') setLoopStage('reflection');
    else if (path === '/history') setLoopStage('completed');
  }, [location.pathname, setLoopStage]);

  // Check for pending reports
  useEffect(() => {
    const currentPage = location.pathname.replace('/', '') || 'home';
    const cleanup = checkPendingReports(currentPage);
    return cleanup;
  }, [profile?.uid, location.pathname]);

  // Handle Auth Prompt from Navigate
  useEffect(() => {
    if (location.state?.showAuth) {
      setIsAuthPromptOpen(true);
      setPendingNavigate({ path: location.state.from?.pathname || '/' });
      // Clear state to avoid reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleNavigate = (path: string, type?: 'daily' | 'wish') => {
    const basePage = path.split('/')[0];
    if (basePage === 'test' && !profile?.uid) {
      setPendingNavigate({ path: 'test', type });
      setIsAuthPromptOpen(true);
      return;
    }
    if (type) setReportType(type);
    navigate(path === 'home' ? '/' : `/${path}`);
  };

  const handleAuthSuccess = () => {
    if (pendingNavigate) {
      if (pendingNavigate.type) {
        setReportType(pendingNavigate.type);
      }
      navigate(pendingNavigate.path.startsWith('/') ? pendingNavigate.path : `/${pendingNavigate.path}`);
      setPendingNavigate(null);
    }
  };

  const currentPath = location.pathname.replace('/', '') || 'home';

  return (
    <div className="relative min-h-screen selection:bg-wood/10 overflow-x-hidden">
      <SEOManager />
      <KomorebiBackground />
      
      <Suspense fallback={<SanctuaryLoader />}>
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Routes location={location}>
              <Route path="/" element={
                <Home 
                  onStartTest={(type) => {
                    handleNavigate('test', type);
                  }} 
                  onNavigate={handleNavigate} 
                  loopStage={loopStage} 
                  streak={streak} 
                />
              } />
              <Route path="/test" element={
                <AuthGuard>
                  <EnergyTest onComplete={() => navigate('/report')} />
                </AuthGuard>
              } />
              <Route path="/report" element={<EnergyReport onReset={() => navigate('/')} onNavigate={handleNavigate} loopStage={loopStage} />} />
              <Route path="/report/:id" element={<EnergyReport onReset={() => navigate('/')} onNavigate={handleNavigate} loopStage={loopStage} />} />
              <Route path="/profile" element={
                <AuthGuard>
                  <UserProfile onNavigate={handleNavigate} />
                </AuthGuard>
              } />
              <Route path="/history" element={
                <AuthGuard>
                  <EnergyTimeline onNavigate={handleNavigate} />
                </AuthGuard>
              } />
              <Route path="/ocean" element={<Ocean onNavigate={handleNavigate} />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin-login" element={<AdminLogin onSuccess={() => navigate('/')} />} />
              <Route path="/subscription" element={<Subscription onNavigate={handleNavigate} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.main>
        </AnimatePresence>
      </Suspense>

      <Navigation 
        currentPath={currentPath} 
        onNavigate={handleNavigate} 
      />
      
      <PurchaseModal 
        isOpen={isPurchaseModalOpen} 
        onClose={() => setIsPurchaseModalOpen(false)}
        onSuccess={() => fetchUserPoints()}
      />

      <AuthPromptModal 
        isOpen={isAuthPromptOpen} 
        onClose={() => setIsAuthPromptOpen(false)}
        onSuccess={handleAuthSuccess}
      />
      
      <ConnectionStatus />
      <SoundControl />

      {/* Return Prompt */}
      <AnimatePresence>
        {pendingReport && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-28 left-6 right-6 md:left-auto md:right-12 md:w-96 z-[60]"
          >
            <div className="bg-white/80 backdrop-blur-2xl border border-wood/20 rounded-3xl p-6 shadow-2xl shadow-wood/10 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-wood/10 flex items-center justify-center text-wood">
                    <Sparkles size={20} />
                  </div>
                  <h4 className="font-serif text-lg text-ink tracking-wide">{t('report_revealed_ready')}</h4>
                </div>
                <button 
                  onClick={() => {
                    localStorage.setItem('lastSeenReportId', pendingReport.id);
                    setPendingReport(null);
                  }}
                  className="p-1 hover:bg-ink/5 rounded-full transition-colors"
                >
                  <X size={18} className="text-ink-muted" />
                </button>
              </div>
              
              <p className="text-sm text-ink-muted leading-relaxed font-light">
                {t('report_return_prompt')}
              </p>
              
              <button
                onClick={() => {
                  localStorage.setItem('lastSeenReportId', pendingReport.id);
                  setPendingReport(null);
                  navigate(`/report/${pendingReport.id}`);
                }}
                className="flex items-center justify-center gap-2 w-full h-12 bg-wood text-white rounded-2xl text-sm tracking-widest hover:bg-wood/90 transition-all active:scale-[0.98]"
              >
                {t('report_view_now')}
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] -z-20" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SoundscapeProvider>
        <AppContent />
      </SoundscapeProvider>
    </BrowserRouter>
  );
}
