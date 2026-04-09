import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, LogIn, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../hooks/useAuth';

const isInAppBrowser = () =>
  /Line\/|FBAN|FBAV|Instagram|MicroMessenger|LIFF|wv\b|Version\/[\d.]+ Chrome\/[\d.]+ Mobile/i.test(navigator.userAgent || '');

const openInExternalBrowser = () => {
  const url = window.location.href.split('?')[0];
  const cleanUrl = url + (window.location.hash || '');
  window.location.replace(`${cleanUrl}?openExternalBrowser=1`);
};

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

  const lineWebView = isInAppBrowser();

  const handleLogin = async () => {
    if (lineWebView) {
      openInExternalBrowser();
      return;
    }
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

              {lineWebView ? (
                <div className="w-full space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left">
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Google 登入需在外部瀏覽器中進行。點下方按鈕，將以 Safari 或 Chrome 開啟本頁面後即可登入。
                    </p>
                  </div>
                  <Button
                    onClick={handleLogin}
                    className="w-full h-16 rounded-2xl bg-ink text-white hover:bg-ink/90 flex items-center justify-center gap-4 shadow-xl shadow-ink/10 group"
                  >
                    <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                    <span className="tracking-[0.2em]">在瀏覽器中開啟登入</span>
                  </Button>
                </div>
              ) : (
                <div className="w-full pt-4 space-y-3">
                  <Button
                    onClick={handleLogin}
                    className="w-full h-16 rounded-2xl bg-ink text-white hover:bg-ink/90 flex items-center justify-center gap-4 shadow-xl shadow-ink/10 group"
                  >
                    {/* Google G logo */}
                    <svg width="18" height="18" viewBox="0 0 18 18" className="flex-shrink-0">
                      <path fill="#fff" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                      <path fill="#fff" fillOpacity=".7" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                      <path fill="#fff" fillOpacity=".5" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                      <path fill="#fff" fillOpacity=".3" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                    </svg>
                    <span className="tracking-[0.2em]">{t('auth_prompt_login_btn')}</span>
                  </Button>
                </div>
              )}

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
