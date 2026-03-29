import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button';
import { useLanguage } from '../i18n/LanguageContext';
import { useTest } from '../store/TestContext';

interface ConsumptionRitualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userPoints: number;
}

export const ConsumptionRitualModal: React.FC<ConsumptionRitualModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  userPoints
}) => {
  const { t } = useLanguage();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    // Add a small artificial delay for ritual feel
    await new Promise(resolve => setTimeout(resolve, 800));
    onConfirm();
    setIsConfirming(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50 p-8"
        >
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 hover:bg-ink/5 rounded-full transition-colors"
          >
            <X size={20} className="text-ink-muted" />
          </button>

          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-wood/20 rounded-full blur-2xl"
              />
              <div className="relative w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-wood/10 border border-wood/10">
                <Sparkles size={32} className="text-wood" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-serif text-ink tracking-wide">
                {t('ritual_confirm_title')}
              </h2>
              <p className="text-sm text-ink-muted leading-relaxed font-light px-4">
                {t('ritual_confirm_desc')}
              </p>
            </div>

            <div className="w-full bg-ink/5 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Zap size={18} className="text-wood fill-wood" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-widest text-ink-muted leading-none mb-1">
                    當前能量
                  </div>
                  <div className="text-sm font-serif text-ink leading-none">
                    {userPoints} 點靈光
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-wood">
                <span className="text-xs font-medium">-1</span>
                <Zap size={14} className="fill-wood" />
              </div>
            </div>

            <div className="w-full space-y-4">
              <Button
                onClick={handleConfirm}
                isLoading={isConfirming}
                className="w-full h-14 rounded-2xl shadow-xl shadow-wood/10 group"
              >
                <span className="flex items-center gap-2">
                  {t('ritual_confirm_btn')}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              
              <div className="flex items-center justify-center gap-2 text-[10px] text-ink-muted uppercase tracking-widest">
                <ShieldCheck size={14} />
                能量校準保護中
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
