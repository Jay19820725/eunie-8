import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface ZoomHintProps {
  show?: boolean;
}

export const ZoomHint: React.FC<ZoomHintProps> = ({ show = true }) => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [show]);

  return (
    <AnimatePresence>
      {visible && show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.7, 1, 0.7],
            scale: 1,
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ 
            opacity: { repeat: Infinity, duration: 2, ease: "easeInOut" },
            duration: 0.5 
          }}
          className="absolute bottom-2 right-2 z-20 pointer-events-none"
        >
          <div className="relative flex items-center justify-center">
            {/* Pulsing Ring */}
            <motion.div
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2, 
                ease: "easeInOut" 
              }}
              className="absolute w-8 h-8 rounded-full bg-white/40 border border-white/60"
            />
            
            {/* Hint Label */}
            <div className="absolute right-full mr-2 bg-black/60 backdrop-blur-md border border-white/20 px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
              <Maximize2 size={10} className="text-white" />
              <span className="text-[9px] text-white font-medium tracking-wider whitespace-nowrap">
                {t('test_hint_zoom')}
              </span>
            </div>

            {/* Icon Placeholder (matches the actual button position) */}
            <div className="w-6 h-6 rounded-full bg-white/20 border border-white/40 flex items-center justify-center">
              <Maximize2 size={12} className="text-white/80" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
