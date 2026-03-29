import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Zap, Sparkles, MessageSquare } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTest } from '../store/TestContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'energy' | 'ritual' | 'insight';
  icon: any;
}

export const NotificationManager: React.FC = () => {
  const { t } = useLanguage();
  const { userPoints, totalReportsCount } = useTest();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: Notification['type'], title: string, message: string, icon: any) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, title, message, type, icon }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Simulated "Energy Full" notification
  useEffect(() => {
    if (userPoints >= 15) {
      const timer = setTimeout(() => {
        addNotification(
          'energy',
          t('push_energy_full_title'),
          t('push_energy_full_body'),
          Zap
        );
      }, 10000); // Show after 10s of being full as a "reminder"
      return () => clearTimeout(timer);
    }
  }, [userPoints]);

  // Simulated "Daily Ritual" notification (once per session for demo)
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification(
        'ritual',
        t('push_daily_ritual_title'),
        t('push_daily_ritual_body'),
        Sparkles
      );
    }, 30000); // Show after 30s
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed top-20 right-4 md:right-8 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="pointer-events-auto w-72 md:w-80 bg-white/80 backdrop-blur-2xl border border-white/50 rounded-2xl shadow-2xl p-4 flex gap-4 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-wood/5 to-transparent opacity-50" />
            
            <div className="relative flex-shrink-0 w-10 h-10 rounded-xl bg-wood/10 flex items-center justify-center text-wood">
              <notification.icon size={20} />
            </div>
            
            <div className="relative flex-1 min-w-0">
              <h4 className="text-xs font-serif text-ink font-medium truncate mb-0.5">
                {notification.title}
              </h4>
              <p className="text-[10px] text-ink-muted leading-relaxed line-clamp-2">
                {notification.message}
              </p>
            </div>

            <button 
              onClick={() => removeNotification(notification.id)}
              className="relative flex-shrink-0 text-ink/20 hover:text-ink/40 transition-colors"
            >
              <X size={14} />
            </button>

            {/* Progress bar for auto-remove */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="absolute bottom-0 left-0 h-0.5 bg-wood/20"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
