import React from 'react';
import { motion } from 'motion/react';

interface CalmLoaderProps {
  label?: string;
  subtitle?: string;
  fullscreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CalmLoader: React.FC<CalmLoaderProps> = ({ 
  label, 
  subtitle,
  fullscreen = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-48 h-48'
  };

  const containerClasses = fullscreen 
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-washi/80 backdrop-blur-sm"
    : "flex flex-col items-center justify-center py-12 space-y-8";

  return (
    <div className={containerClasses}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Organic Wave / Pulsing Glow Layers */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-wood rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute inset-0 bg-water rounded-full blur-3xl"
        />
        
        {/* Central Organic Wave Shape */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full opacity-20">
            <motion.path
              animate={{
                d: [
                  "M50 20 C60 20 80 40 80 50 C80 60 60 80 50 80 C40 80 20 60 20 50 C20 40 40 20 50 20 Z",
                  "M50 25 C65 25 75 35 75 50 C75 65 65 75 50 75 C35 75 25 65 25 50 C25 35 35 25 50 25 Z",
                  "M50 20 C60 20 80 40 80 50 C80 60 60 80 50 80 C40 80 20 60 20 50 C20 40 40 20 50 20 Z"
                ]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              fill="currentColor"
              className="text-ink"
            />
            <motion.path
              animate={{
                d: [
                  "M50 30 C55 30 70 40 70 50 C70 60 55 70 50 70 C45 70 30 60 30 50 C30 40 45 30 50 30 Z",
                  "M50 35 C60 35 65 40 65 50 C65 60 60 65 50 65 C40 65 35 60 35 50 C35 40 40 35 50 35 Z",
                  "M50 30 C55 30 70 40 70 50 C70 60 55 70 50 70 C45 70 30 60 30 50 C30 40 45 30 50 30 Z"
                ]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              fill="currentColor"
              className="text-ink opacity-40"
            />
          </svg>
        </div>

        {/* Spinning Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border border-ink/5 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border border-ink/5 rounded-full border-t-ink/20"
        />
      </div>

      <div className="flex flex-col items-center gap-4">
        {label && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] md:text-sm tracking-[0.4em] text-ink/60 font-serif italic"
          >
            {label}
          </motion.span>
        )}
        {subtitle && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[10px] text-ink/20 tracking-[0.3em] uppercase leading-relaxed font-light text-center max-w-[280px]"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </div>
  );
};
