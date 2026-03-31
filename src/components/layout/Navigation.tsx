import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { Sparkles, User, History, Home, ShieldAlert, Waves, Menu, X } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { getStoredAtmosphere, Atmosphere } from '../../core/atmospheres';

interface NavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPath, onNavigate }) => {
  const { t } = useLanguage();
  const { isAdmin, user, isPremium } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded for 3s
  const { scrollY } = useScroll();
  const collapseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastManualToggleRef = useRef<number>(0);
  const [atmosphere, setAtmosphere] = useState<Atmosphere>(getStoredAtmosphere());

  useEffect(() => {
    const handleAtmosphereChange = () => {
      setAtmosphere(getStoredAtmosphere());
    };
    window.addEventListener('atmosphere-changed', handleAtmosphereChange);
    return () => window.removeEventListener('atmosphere-changed', handleAtmosphereChange);
  }, []);

  const glowColor = atmosphere.colors[0];

  // Auto-collapse after 5s of inactivity
  const resetCollapseTimer = () => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 5000);
  };

  // Initial 3s expansion
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Smart Auto-Hide/Show Logic
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    const now = Date.now();
    
    // Ignore scroll events for 1.5s after manual toggle to prevent immediate re-expansion
    if (now - lastManualToggleRef.current < 1500) return;

    if (latest > previous && latest > 100) {
      // Scrolling down - Collapse
      if (isExpanded) setIsExpanded(false);
    } else if (latest < previous - 10) { // Add 10px threshold for scroll-up expansion
      // Scrolling up - Expand
      if (!isExpanded) {
        setIsExpanded(true);
        resetCollapseTimer();
      }
    }
  });

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    };
  }, []);
  
  // 方案 A：漸進式路徑方案 (The Journey)
  // 1. 未登入用戶 (Newbie): [首頁] [開始測驗 (核心高亮)] [個人]
  // 2. 免費用戶 (Free): [首頁] [測驗] [海洋] [歷史] [個人]
  // 3. 訂閱用戶 (Pro): 完整功能 + 視覺強化
  
  const allItems = [
    { path: 'home', label: t('nav_home'), icon: Home },
    { path: 'ocean', label: t('nav_ocean'), icon: Waves },
    { path: 'history', label: t('nav_history'), icon: History },
    { path: 'profile', label: t('nav_profile'), icon: User },
  ];

  let navItems = allItems;

  if (!user) {
    // 未登入用戶：隱藏海洋與歷史
    navItems = allItems.filter(item => ['home', 'profile'].includes(item.path));
  }

  if (isAdmin) {
    navItems = [...navItems, { path: 'admin', label: t('admin_panel'), icon: ShieldAlert }];
  }

  return (
    <nav className="fixed bottom-6 right-6 md:right-12 z-50 flex items-center justify-end pointer-events-none">
      <div className="relative flex items-center justify-end pointer-events-auto">
        <AnimatePresence>
          {isExpanded ? (
            <motion.div 
              key="expanded-nav"
              initial={{ x: 30, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 30, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`relative bg-white/80 backdrop-blur-xl border px-3 md:px-6 py-2 md:py-3 flex items-center gap-1 md:gap-4 rounded-full shadow-lg ${
                isPremium 
                  ? 'border-emerald-500/20' 
                  : 'border-white/40'
              }`}
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      onNavigate(item.path);
                      resetCollapseTimer();
                    }}
                    className={`relative flex items-center gap-2 transition-all duration-300 px-3 md:px-4 py-2 rounded-full ${
                      isActive 
                        ? 'text-ink' 
                        : 'text-ink/30 hover:text-ink/60'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-bg"
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{ backgroundColor: `${glowColor}15` }}
                      />
                    )}
                    
                    <Icon size={isActive ? 18 : 16} strokeWidth={isActive ? 1.8 : 1.2} className="relative z-10" />
                    
                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.span
                          initial={{ width: 0, opacity: 0, x: -5 }}
                          animate={{ width: 'auto', opacity: 1, x: 0 }}
                          exit={{ width: 0, opacity: 0, x: -5 }}
                          transition={{ duration: 0.3 }}
                          className="text-[10px] whitespace-nowrap tracking-[0.1em] font-sans font-medium overflow-hidden relative z-10"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}

              {/* Collapse Toggle */}
              <button 
                onClick={() => {
                  lastManualToggleRef.current = Date.now();
                  setIsExpanded(false);
                }}
                className="ml-2 p-2 text-ink/20 hover:text-ink/40 transition-colors border-l border-ink/5"
              >
                <X size={14} />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="collapsed-sphere"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                lastManualToggleRef.current = Date.now();
                setIsExpanded(true);
              }}
              className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                isPremium 
                  ? 'bg-emerald-50 border border-emerald-500/20' 
                  : 'bg-white/90 border border-white/40 backdrop-blur-md'
              }`}
            >
              <Menu size={18} className="text-ink/40 relative z-10" strokeWidth={1.5} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
