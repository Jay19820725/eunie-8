import React from 'react';
import { motion } from 'motion/react';

interface PoeticLoadingProps {
  label: string;
  className?: string;
}

export const PoeticLoading: React.FC<PoeticLoadingProps> = ({ label, className = "" }) => {
  return (
    <div className="flex flex-col items-start gap-2">
      <motion.div
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`font-serif italic font-extralight tracking-widest ${className}`}
      >
        {label}
      </motion.div>
      <motion.div 
        animate={{ 
          scaleX: [0, 1, 0],
          opacity: [0, 0.2, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="h-px w-full bg-ink/20 origin-left"
      />
    </div>
  );
};
