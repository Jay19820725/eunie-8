import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Settings, 
  Waves, 
  Sparkles, 
  Terminal, 
  LogOut, 
  Menu, 
  X,
  Search,
  Command,
  Image as ImageIcon,
  Music,
  Users,
  BarChart3,
  Database,
  CreditCard,
  BarChart
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeModule: string;
  onModuleChange: (module: any) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  activeModule, 
  onModuleChange 
}) => {
  const { logout, profile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'cards', label: 'Card Management', icon: ImageIcon },
    { id: 'prompts', label: 'AI Prompt Studio', icon: Sparkles },
    { id: 'music', label: 'Music Library', icon: Music },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'reports', label: 'Report Center', icon: BarChart3 },
    { id: 'ocean', label: 'Ocean Moderation', icon: Waves },
    { id: 'sessions', label: 'Session Logs', icon: Database },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'settings', label: 'Site Settings', icon: Settings },
    { id: 'observatory', label: 'Observatory', icon: Terminal },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex font-sans selection:bg-wood/20">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-full bg-[#0A0A0A] border-r border-white/5 z-50 flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-wood rounded-lg flex items-center justify-center">
              <ShieldAlert size={18} className="text-white" />
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col"
                >
                  <span className="text-xs font-serif italic tracking-wider">Soul Control</span>
                  <span className="text-[8px] uppercase tracking-[0.3em] text-white/40">SCC v1.0.0</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 py-8 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                activeModule === item.id 
                  ? 'bg-white/5 text-wood border border-white/5' 
                  : 'text-white/40 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <item.icon size={18} className={activeModule === item.id ? 'text-wood' : 'group-hover:text-white'} />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-[11px] uppercase tracking-[0.2em] font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-3 text-white/40 hover:text-fire transition-all group"
          >
            <LogOut size={18} className="group-hover:text-fire" />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-[11px] uppercase tracking-[0.2em] font-medium"
                >
                  Terminate Session
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main 
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? 280 : 80 }}
      >
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-12 sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-xl z-40">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-all"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
              <input 
                type="text" 
                placeholder="Search Soul ID, Logs, or Prompts..." 
                className="bg-white/5 border border-white/5 rounded-full pl-12 pr-12 py-2.5 text-[10px] w-80 focus:outline-none focus:border-wood/30 transition-all font-mono"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-white/20">
                <Command size={10} />
                <span className="text-[8px]">K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-white/80">{profile?.displayName || 'Admin'}</span>
              <span className="text-[8px] font-mono text-wood uppercase tracking-widest">Authorized</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
              {profile?.photoURL ? (
                <img src={profile.photoURL} className="w-full h-full object-cover" />
              ) : (
                <ShieldAlert size={18} className="text-white/20" />
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Grid Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] -z-10" />
      <div className="fixed inset-0 pointer-events-none border-[40px] border-[#0A0A0A] -z-10" />
    </div>
  );
};
