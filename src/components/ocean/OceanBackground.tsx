import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'motion/react';

const Ripple: React.FC<{ 
  delay?: number; 
  color?: string; 
  size?: number; 
  x?: string; 
  y?: string; 
  duration?: number;
  borderWidth?: number;
}> = ({ 
  delay = 0, 
  color = "rgba(255, 255, 255, 0.2)", 
  size = 400, 
  x = "50%", 
  y = "50%", 
  duration = 10,
  borderWidth = 1
}) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{
      scale: [0, 1.5],
      opacity: [0, 0.5, 0],
    }}
    transition={{
      duration: duration,
      repeat: Infinity,
      delay: delay,
      ease: [0.25, 0.1, 0.25, 1],
    }}
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
      marginLeft: -size / 2,
      marginTop: -size / 2,
      border: `${borderWidth}px solid ${color}`,
      willChange: 'transform, opacity',
    }}
  />
);

export const OceanBackground: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate random flickering light spots (Stardust)
  const lightSpots = useMemo(() => {
    const count = isMobile ? 15 : 30;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.3 + 0.1,
    }));
  }, [isMobile]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#0A1128]">
      {/* 1. Breathing Background Base */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #0D1B3E 0%, #0A1128 100%)',
        }}
      />

      {/* 2. Watercolor Ink Diffusion (Moegi & Asagi) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Moegi (萌黃) - #A8C97F */}
        <motion.div
          animate={{
            x: isMobile ? [-50, 50, -50] : [-100, 100, -100],
            y: isMobile ? [-25, 25, -25] : [-50, 50, -50],
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -left-1/4 -top-1/4 w-full h-full rounded-full ${isMobile ? 'blur-[60px]' : 'blur-[120px]'}`}
          style={{ 
            background: 'radial-gradient(circle, #A8C97F 0%, transparent 70%)',
            willChange: 'transform, opacity'
          }}
        />
        
        {/* Asagi (淺蔥) - #33A6B8 */}
        <motion.div
          animate={{
            x: isMobile ? [50, -50, 50] : [100, -100, 100],
            y: isMobile ? [25, -25, 25] : [50, -50, 50],
            scale: [1.05, 0.95, 1.05],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -right-1/4 -bottom-1/4 w-full h-full rounded-full ${isMobile ? 'blur-[80px]' : 'blur-[150px]'}`}
          style={{ 
            background: 'radial-gradient(circle, #33A6B8 0%, transparent 70%)',
            willChange: 'transform, opacity'
          }}
        />
      </div>

      {/* 3. Resonance Ripples (Energy Ripples) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Center Concentric Ripples (White) */}
        <Ripple delay={0} size={isMobile ? 300 : 500} duration={12} color="rgba(255, 255, 255, 0.15)" />
        <Ripple delay={4} size={isMobile ? 300 : 500} duration={12} color="rgba(255, 255, 255, 0.1)" />
        {!isMobile && <Ripple delay={8} size={500} duration={12} color="rgba(255, 255, 255, 0.05)" />}

        {/* Multi-point Secondary Ripples (Water - #4FC3F7) */}
        {!isMobile ? (
          <>
            {/* Top Left */}
            <Ripple x="15%" y="20%" size={300} delay={2} duration={15} color="rgba(79, 195, 247, 0.12)" />
            {/* Bottom Right */}
            <Ripple x="85%" y="75%" size={350} delay={5} duration={18} color="rgba(79, 195, 247, 0.1)" />
            {/* Bottom Center */}
            <Ripple x="50%" y="90%" size={400} delay={1} duration={20} color="rgba(79, 195, 247, 0.08)" />
          </>
        ) : (
          /* Single Mobile Secondary Ripple */
          <Ripple x="80%" y="80%" size={250} delay={3} duration={15} color="rgba(79, 195, 247, 0.08)" />
        )}
      </div>

      {/* 4. Stardust (Light Spots) */}
      <div className="absolute inset-0 pointer-events-none">
        {lightSpots.map((spot) => (
          <motion.div
            key={spot.id}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, spot.opacity, 0],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: spot.duration,
              repeat: Infinity,
              delay: spot.delay,
              ease: "easeInOut",
            }}
            style={{
              position: 'absolute',
              left: `${spot.left}%`,
              top: `${spot.top}%`,
              width: `${spot.size}px`,
              height: `${spot.size}px`,
              backgroundColor: 'white',
              borderRadius: '50%',
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
              filter: 'blur(0.5px)',
              willChange: 'transform, opacity'
            }}
          />
        ))}
      </div>

      {/* 5. Washi Grain Texture Overlay - Simplified for Mobile */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 6. Subtle Surface Shimmer */}
      <motion.div
        animate={{
          opacity: [0.02, 0.06, 0.02],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 via-transparent to-white/5"
        style={{ willChange: 'opacity' }}
      />
    </div>
  );
};
