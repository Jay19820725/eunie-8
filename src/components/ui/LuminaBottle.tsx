import React from 'react';
import { motion } from 'motion/react';
import { Zap, Plus } from 'lucide-react';
import { useTest } from '../../store/TestContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const LuminaBottle: React.FC = () => {
  const { userPoints, setIsPurchaseModalOpen } = useTest();
  const { language } = useLanguage();

  const fillPercentage = Math.min(100, (userPoints / 15) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed top-4 right-4 md:top-8 md:right-8 z-[40] flex items-center gap-3"
    >
      <div 
        onClick={() => setIsPurchaseModalOpen(true)}
        className="group relative flex items-center gap-3 px-4 py-2 bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg cursor-pointer hover:bg-white/60 transition-all"
      >
        {/* Bottle Icon / Energy Ball */}
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-wood/10 rounded-full blur-md group-hover:bg-wood/20 transition-colors" />
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.6, 0.9, 0.6]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-4 h-4 bg-wood rounded-full shadow-[0_0_12px_rgba(139,115,85,0.5)]"
          />
          
          {/* Fill Level Indicator */}
          <svg className="absolute inset-0 -rotate-90 w-8 h-8">
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-ink/5"
            />
            <motion.circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="88"
              initial={{ strokeDashoffset: 88 }}
              animate={{ strokeDashoffset: 88 - (88 * fillPercentage) / 100 }}
              className="text-wood"
            />
          </svg>
        </div>

        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-[0.2em] text-ink-muted leading-none mb-0.5">
            {language === 'ja' ? '霊光エネルギー' : '靈光能量'}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-serif text-ink leading-none">{userPoints}</span>
            <Zap size={10} className="text-wood fill-wood" />
          </div>
        </div>

        <div className="ml-1 p-1 bg-wood/10 rounded-lg group-hover:bg-wood/20 transition-colors">
          <Plus size={12} className="text-wood" />
        </div>
      </div>
    </motion.div>
  );
};
