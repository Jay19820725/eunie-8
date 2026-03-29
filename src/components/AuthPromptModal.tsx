import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, LogIn } from 'lucide-react';
import { Button } from './ui/Button';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../hooks/useAuth';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const { login, profile } = useAuth();

  // Watch for profile availability to auto-close and trigger success
  React.useEffect(() => {
    if (isOpen && profile?.uid) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, profile?.uid, onClose, onSuccess]);

  const handleLogin = async () => {
    try {
      await login();
      // The useEffect above will handle closing and success callback 
      // once the profile state is updated by the AuthProvider
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 md:p-12 shadow-2xl overflow-hidden"
          >
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-wood/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-fire/5 rounded-full blur-3xl" />

            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-2 text-ink/20 hover:text-ink/40 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 flex flex-col items-center text-center space-y-10">
              <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center text-ink/40">
                <Sparkles size={32} strokeWidth={1.5} />
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-serif text-ink/80 tracking-wide">
                  {t('auth_prompt_title')}
                </h2>
                <p className="text-sm text-ink/40 leading-relaxed font-light tracking-wide">
                  {t('auth_prompt_desc')}
                </p>
              </div>

              <div className="w-full pt-4">
                <Button 
                  onClick={handleLogin}
                  className="w-full h-16 rounded-2xl bg-ink text-white hover:bg-ink/90 flex items-center justify-center gap-4 shadow-xl shadow-ink/10 group"
                >
                  <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                  <span className="tracking-[0.2em]">{t('auth_prompt_login_btn')}</span>
                </Button>
              </div>

              <p className="text-[10px] text-ink/20 uppercase tracking-[0.3em] font-light">
                {t('sync_notice')}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
