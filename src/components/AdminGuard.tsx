import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { profile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] text-white/40 font-mono">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-wood" />
        <span className="text-[10px] tracking-[0.3em] uppercase">Authenticating...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md space-y-8"
        >
          <div className="w-20 h-20 bg-fire/10 rounded-full flex items-center justify-center mx-auto border border-fire/20">
            <ShieldAlert className="w-10 h-10 text-fire" />
          </div>
          <div className="space-y-4">
            <h1 className="text-2xl font-serif italic text-white tracking-wider">Access Denied</h1>
            <p className="text-sm text-white/40 leading-relaxed font-mono">
              Insufficient permissions to access the Soul Control Center. 
              Unauthorized access attempts are logged.
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/60 uppercase tracking-[0.2em] hover:bg-white/10 transition-all font-mono"
          >
            Return to Sanctuary
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};
