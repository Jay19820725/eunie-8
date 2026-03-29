import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Wind, ArrowRight, Activity, Zap, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { LoopStage } from '../core/types';
import { AuthPromptModal } from '../components/AuthPromptModal';

interface HomeProps {
  onStartTest: (type?: 'daily' | 'wish') => void;
  loopStage: LoopStage;
  onNavigate: (page: string) => void;
  streak?: number;
}

const EnergyOrb = ({ color, delay, initialPos, size = "100vw" }: { color: string; delay: number; initialPos: { x: string; y: string }; size?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, left: initialPos.x, top: initialPos.y }}
    animate={{ 
      opacity: [0.35, 0.6, 0.35],
      scale: [1, 1.4, 1],
      x: [0, 80, 0],
      y: [0, -80, 0],
    }}
    transition={{ 
      duration: 35 + delay, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay: delay 
    }}
    className="absolute rounded-full blur-[120px] md:blur-[200px]"
    style={{ 
      width: size,
      height: size,
      backgroundColor: color,
      willChange: 'transform, opacity',
      transform: 'translateZ(0)'
    }}
  />
);

const EnergyField = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#FDFCF8]">
    <EnergyOrb color="#B2DFDB" delay={0} initialPos={{ x: '-20%', y: '10%' }} size="120vw" />
    <EnergyOrb color="#FFF59D" delay={8} initialPos={{ x: '50%', y: '20%' }} size="100vw" />
    <EnergyOrb color="#F8BBD0" delay={16} initialPos={{ x: '80%', y: '10%' }} size="110vw" />
    <EnergyOrb color="#C8E6C9" delay={24} initialPos={{ x: '30%', y: '70%' }} size="130vw" />
    
    {/* Washi Texture Overlay */}
    <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
  </div>
);

const StatusCard = ({ title, value, icon: Icon, delay = 0, onClick }: { title: string; value: string; icon: any; delay?: number; onClick?: () => void }) => {
  const isLongText = value.length > 45;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        opacity: { duration: 1.5, delay },
        y: { duration: 1.5, delay }
      }}
      onClick={onClick}
      className={`bg-white/30 backdrop-blur-2xl border border-white/50 p-6 md:p-8 rounded-[2.5rem] flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-700 ${onClick ? 'cursor-pointer group' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[9px] tracking-[0.3em] uppercase text-ink/40 font-medium">{title}</span>
        <div className="p-2 bg-ink/5 rounded-full text-ink/30 group-hover:bg-ink/10 transition-colors">
          <Icon size={14} />
        </div>
      </div>
      <div className={`text-xl md:text-2xl font-serif text-ink/80 tracking-wide font-light transition-all duration-500 ${onClick && isLongText ? 'line-clamp-3' : ''}`}>
        {value}
      </div>
      {onClick && isLongText && (
        <div className="text-[8px] tracking-[0.2em] text-ink/20 uppercase font-medium mt-[-4px] group-hover:text-ink/40 transition-colors">
          {/* Subtle hint */}
          ••••
        </div>
      )}
    </motion.div>
  );
};

const SoulQuoteModal = ({ isOpen, onClose, quote }: { isOpen: boolean; onClose: () => void; quote: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: isOpen ? 1 : 0 }}
    className={`fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/10 backdrop-blur-sm transition-all duration-500 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none opacity-0'}`}
    onClick={onClose}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.9, y: isOpen ? 0 : 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="bg-white/80 backdrop-blur-3xl border border-white/50 p-10 md:p-16 rounded-[3rem] max-w-2xl w-full shadow-2xl relative overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-ink/5 to-transparent" />
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-ink/[0.02] rounded-full blur-3xl" />
      
      <div className="flex flex-col items-center text-center gap-10">
        <div className="p-4 bg-ink/5 rounded-full text-ink/20">
          <Activity size={24} strokeWidth={1} />
        </div>
        
        <div className="space-y-4">
          <span className="text-[10px] tracking-[0.5em] uppercase text-ink/30 font-medium">Soul Whisper</span>
          <div className="h-px w-8 bg-ink/10 mx-auto" />
        </div>

        <p className="text-2xl md:text-3xl font-serif text-ink/80 leading-relaxed font-light italic">
          "{quote}"
        </p>

        <button 
          onClick={onClose}
          className="mt-4 text-[10px] tracking-[0.4em] uppercase text-ink/40 hover:text-ink transition-colors font-medium py-2 px-6 border border-ink/5 rounded-full hover:bg-ink/5"
        >
          Close
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export const Home: React.FC<HomeProps> = ({ onStartTest, loopStage, onNavigate, streak = 0 }) => {
  const { profile, login } = useAuth();
  const { t, language } = useLanguage();
  const [lastEnergy, setLastEnergy] = useState<string | null>(null);
  const [weeklyWishes, setWeeklyWishes] = useState<number>(0);
  const [latestReport, setLatestReport] = useState<any>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const handleStartTest = (type: 'daily' | 'wish' = 'daily') => {
    onStartTest(type);
  };

  useEffect(() => {
    if (profile?.uid) {
      // Fetch reports history
      fetch(`/api/reports/history/${profile.uid}?limit=10`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const latest = data[0];
            setLatestReport(latest);
            setLastEnergy(latest.dominant_element || null);
          }
        })
        .catch(err => console.error("Error fetching history:", err));

      // Fetch weekly wishes count
      fetch(`/api/reports/weekly-wishes/${profile.uid}`)
        .then(res => res.json())
        .then(data => {
          setWeeklyWishes(data.count || 0);
        })
        .catch(err => console.error("Error fetching weekly wishes:", err));
    }
  }, [profile?.uid]);

  const getOracleAdvice = () => {
    if (!latestReport) return t('home_yesterday_none');
    
    const { dominant_element, weak_element } = latestReport;
    
    // Logic for advice based on elements
    if (dominant_element === 'wood') return t('home_oracle_wood_excess');
    if (dominant_element === 'fire' && weak_element === 'fire') return t('home_oracle_fire_deficiency');
    if (dominant_element === 'earth') return t('home_oracle_earth_excess');
    if (dominant_element === 'metal') return t('home_oracle_metal_deficiency');
    if (dominant_element === 'water') return t('home_oracle_water_excess');
    
    return t('home_oracle_balanced');
  };

  const getSoulQuote = (truncate = false) => {
    if (!latestReport || !latestReport.psychological_insight) return t('home_yesterday_none');
    const quote = latestReport.psychological_insight;
    if (truncate && quote.length > 20) {
      return quote.substring(0, 20) + '...';
    }
    return quote;
  };

  const getStatusText = () => {
    if (loopStage === 'calibration') return t('home_status_pending');
    if (loopStage === 'completed') return t('home_status_calibrated');
    return t('home_continue_loop');
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <EnergyField />

      {/* Vertical Side Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1 }}
        className="hidden lg:block fixed right-16 top-1/2 -translate-y-1/2 z-20"
        style={{ writingMode: 'vertical-rl' }}
      >
        <span className="text-[9px] tracking-[0.8em] text-ink/20 uppercase font-light">
          {t('home_subtitle')}
        </span>
      </motion.div>

      <div className="ma-container relative z-10 w-full max-w-4xl space-y-24 md:space-y-36">
        {/* Header Section */}
        <div className="text-center space-y-12 mb-24 -mt-[50px] md:mt-0 w-[264px] md:w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2 }}
            className="text-[10px] tracking-[0.6em] text-ink/30 uppercase font-light"
          >
            {t('home_top_slogan')}
          </motion.div>
          
          <div className="space-y-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.8, delay: 0.3 }}
              className="text-[38px] md:text-6xl font-serif font-extralight text-ink/80 leading-[1.3] tracking-tight"
            >
              {t('home_hero_title')}
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, delay: 0.8 }}
              className="h-px w-10 bg-ink/10 mx-auto -mt-5"
            />

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.8, delay: 1.2 }}
              className="text-xs md:text-base text-ink/40 font-light tracking-[0.3em] -mt-5"
            >
              {t('home_hero_desc')}
            </motion.p>
          </div>
        </div>

        {/* Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, delay: 1.5 }}
          className="flex flex-col items-center gap-16 md:gap-24"
        >
          {/* Energy Dashboard (New) */}
          {profile?.uid ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl -mt-10 md:-mt-[80px]">
              <StatusCard 
                title={t('home_dashboard_weekly_wishes')} 
                value={`${weeklyWishes} ${t('home_streak_unit' as any)}`} 
                icon={Wind} 
                delay={1.5}
              />
              <StatusCard 
                title={t('home_dashboard_oracle_advice')} 
                value={getOracleAdvice()} 
                icon={Zap} 
                delay={1.7}
              />
              <StatusCard 
                title={t('home_dashboard_soul_quote')} 
                value={getSoulQuote(true)} 
                icon={Activity} 
                delay={1.9}
                onClick={() => setIsQuoteModalOpen(true)}
              />
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="w-full max-w-4xl -mt-10 md:-mt-[80px] p-8 rounded-[2rem] bg-white/20 backdrop-blur-md border border-white/30 flex flex-col items-center justify-center text-center gap-4 group hover:bg-white/30 transition-all duration-700"
            >
              <p className="text-sm text-ink/60 tracking-widest font-serif italic">
                {t('home_guest_prompt')}
              </p>
              <button 
                onClick={() => onNavigate('profile')}
                className="text-[10px] uppercase tracking-[0.2em] text-wood font-semibold hover:opacity-70 transition-opacity flex items-center gap-2"
              >
                <Sparkles size={12} />
                {t('signin_google')}
              </button>
            </motion.div>
          )}

          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-center w-full max-w-4xl md:mt-[-40px]">
            {/* Trouble Solving Button - Elegant Glass Style */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group w-full md:w-1/2"
            >
              <div className="absolute -inset-1 bg-purple-200/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <button 
                onClick={() => handleStartTest('wish')}
                className="relative w-full bg-white/40 backdrop-blur-xl border border-white/60 p-8 md:p-10 rounded-[2rem] flex flex-col items-start gap-4 shadow-sm hover:shadow-md transition-all duration-700 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Wind size={48} className="text-purple-400" />
                </div>
                <div className="flex items-center gap-3 text-ink/30">
                  <Wind size={16} className="text-purple-400/50" />
                  <span className="text-[9px] tracking-[0.3em] uppercase font-medium">{t('home_wish_desc')}</span>
                </div>
                <div className="text-xl md:text-2xl font-serif font-light tracking-wide text-ink/70 text-left">
                  {t('home_wish_title')}
                </div>
                <div className="text-[10px] text-ink/30 font-light tracking-wider text-left max-w-[80%] leading-relaxed">
                  {t('home_wish_subtitle')}
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] tracking-[0.2em] text-ink/20 group-hover:text-ink/40 transition-colors">
                  <span>{t('home_wish_action')}</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </motion.div>

            {/* Daily Energy Button - Elegant Glass Style */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group w-full md:w-1/2"
            >
              <div className="absolute -inset-1 bg-blue-200/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <button 
                onClick={() => handleStartTest('daily')}
                className="relative w-full bg-white/40 backdrop-blur-xl border border-white/60 p-8 md:p-10 rounded-[2rem] flex flex-col items-start gap-4 shadow-sm hover:shadow-md transition-all duration-700"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Activity size={48} className="text-blue-400" />
                </div>
                <div className="flex items-center gap-3 text-ink/30">
                  <Activity size={16} className="text-blue-400/50" />
                  <span className="text-[9px] tracking-[0.3em] uppercase font-medium">{t('home_energy_desc')}</span>
                </div>
                <div className="text-xl md:text-2xl font-serif font-light tracking-wide text-ink/70 text-left">
                  {t('home_energy_title')}
                </div>
                <div className="text-[10px] text-ink/30 font-light tracking-wider text-left max-w-[80%] leading-relaxed">
                  {t('home_energy_subtitle')}
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] tracking-[0.2em] text-ink/20 group-hover:text-ink/40 transition-colors">
                  <span>{t('home_energy_action')}</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </motion.div>
          </div>

          {/* Five Elements Visualizer */}
          <div className="flex gap-10 md:gap-16 pt-8">
            {[
              { id: 'wood', color: 'bg-wood' },
              { id: 'fire', color: 'bg-fire' },
              { id: 'earth', color: 'bg-earth' },
              { id: 'metal', color: 'bg-metal' },
              { id: 'water', color: 'bg-water' }
            ].map((el, i) => (
              <motion.div
                key={el.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: lastEnergy === el.id ? 1 : 0.1, scale: lastEnergy === el.id ? 1.2 : 1 }}
                whileHover={{ opacity: 0.5, scale: 1.1 }}
                transition={{ delay: 2.2 + (i * 0.1) }}
                className="flex flex-col items-center gap-6 group cursor-default"
              >
                <div className={`w-1 h-1 rounded-full ${el.color} shadow-[0_0_10px_currentColor] transition-all duration-700`} />
                <span className="text-[7px] tracking-[0.4em] text-ink/20 uppercase font-serif group-hover:text-ink/40 transition-colors duration-500">{t(`home_element_${el.id}`)}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <SoulQuoteModal 
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        quote={getSoulQuote()}
      />

      {/* Background Breathing Hint */}
      <motion.div
        animate={{ opacity: [0.03, 0.1, 0.03] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="fixed bottom-12 left-1/2 -translate-x-1/2 text-[7px] tracking-[1em] text-ink/10 uppercase pointer-events-none font-light"
      >
        {t('home_breath')}
      </motion.div>
    </div>
  );
};
