import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { Sparkles, ArrowRight, Maximize2, PenLine, CheckCircle2 } from 'lucide-react';
import { ImageCard, WordCard, CardPair } from '../../core/types';
import { useLanguage } from '../../i18n/LanguageContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: [0.23, 1, 0.32, 1]
    }
  }
};

interface AssociationStageProps {
  pairs: CardPair[];
  onComplete: (associations: { pair_id: string; text: string }[]) => void;
  onZoom: (card: ImageCard | WordCard) => void;
}

export const AssociationStage: React.FC<AssociationStageProps> = ({ pairs, onComplete, onZoom }) => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const [modes, setModes] = useState<{ [key: string]: 'guided' | 'free' }>(
    pairs.reduce((acc, _, i) => ({ ...acc, [i]: 'guided' }), {})
  );
  const [associations, setAssociations] = useState<{ [key: string]: string }>(
    pairs.reduce((acc, _, i) => ({ ...acc, [i]: '' }), {})
  );
  const [guidedValues, setGuidedValues] = useState<{ [key: string]: [string, string, string] }>(
    pairs.reduce((acc, _, i) => ({ ...acc, [i]: ['', '', ''] }), {})
  );

  const isSectionComplete = (i: number) => {
    if (modes[i] === 'free') {
      return associations[i].trim().length >= 2;
    } else {
      return guidedValues[i].every(v => v.trim().length >= 1);
    }
  };

  const handleTextChange = (index: number, text: string) => {
    if (text.length <= 200) {
      setAssociations(prev => ({ ...prev, [index]: text }));
    }
  };

  const handleGuidedChange = (index: number, partIndex: number, value: string) => {
    if (value.length <= 50) {
      setGuidedValues(prev => {
        const newVal = [...prev[index]] as [string, string, string];
        newVal[partIndex] = value;
        return { ...prev, [index]: newVal };
      });
    }
  };

  // Scroll to active section
  useEffect(() => {
    const target = sectionRefs.current[activeIndex];
    if (target) {
      const offset = window.innerWidth < 768 ? 100 : 150;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, [activeIndex]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex < pairs.length - 1) {
      setActiveIndex(prev => prev + 1);
    } else {
      // Scroll to the final button if it's the last one
      const finalBtn = document.getElementById('final-complete-btn');
      if (finalBtn) {
        finalBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const isAllComplete = pairs.every((_, i) => isSectionComplete(i));

  const handleFinish = () => {
    const results = pairs.map((_, i) => {
      let finalPath = associations[i];
      if (modes[i] === 'guided') {
        const v = guidedValues[i];
        finalPath = `${t('test_associating_guided_1')} ${v[0]} ${t('test_associating_guided_2')} ${v[1]} ${t('test_associating_guided_3')} ${v[2]}`;
      }
      return {
        pair_id: i.toString(),
        text: finalPath
      };
    });
    onComplete(results);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl flex flex-col items-center gap-12 md:gap-16 px-4"
    >
      {/* Progress Indicator */}
      <div className="sticky top-24 z-30 bg-paper/80 backdrop-blur-md px-6 py-2 rounded-full border border-ink/5 shadow-sm flex items-center gap-4">
        <span className="text-[10px] tracking-[0.2em] text-ink/60 uppercase font-medium">
          {t('test_associating_progress').replace('{current}', (activeIndex + 1).toString()).replace('{total}', pairs.length.toString())}
        </span>
        <div className="flex gap-1.5">
          {pairs.map((_, i) => (
            <div 
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                i === activeIndex ? 'bg-emerald-500 scale-125' : 
                isSectionComplete(i) ? 'bg-emerald-200' : 'bg-ink/10'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-12 md:space-y-20 w-full">
        {pairs.map((pair, i) => {
          const isActive = i === activeIndex;
          const completed = isSectionComplete(i);
          
          return (
            <motion.div 
              key={i}
              ref={el => sectionRefs.current[i] = el}
              variants={itemVariants}
              onClick={() => !isActive && setActiveIndex(i)}
              className={`grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-8 items-start p-6 md:p-10 rounded-[2.5rem] border transition-all duration-700 ${
                isActive 
                  ? 'bg-white shadow-2xl shadow-ink/5 border-emerald-100/50 scale-100 opacity-100' 
                  : 'bg-white/30 backdrop-blur-sm border-transparent scale-95 opacity-40 grayscale-[0.5] cursor-pointer hover:opacity-60'
              }`}
            >
              <div className="flex gap-2 justify-center md:sticky md:top-40">
                <div 
                  className="w-20 h-32 md:w-24 md:h-36 rounded-xl overflow-hidden shadow-lg cursor-zoom-in relative group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onZoom(pair.image);
                  }}
                >
                  <img src={pair.image.imageUrl} alt="" className="w-full h-full object-cover" draggable="false" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <Maximize2 size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div 
                  className="w-20 h-32 md:w-24 md:h-36 rounded-xl overflow-hidden shadow-lg cursor-zoom-in relative group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onZoom(pair.word);
                  }}
                >
                  <img src={pair.word.imageUrl} alt="" className="w-full h-full object-cover" draggable="false" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <Maximize2 size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-ink-muted font-semibold">Association {i + 1}</span>
                    {completed && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      </motion.div>
                    )}
                    {!isActive && completed && (
                      <span className="text-[9px] text-emerald-600/60 tracking-widest uppercase font-light italic">
                        {t('test_associating_completed_hint')}
                      </span>
                    )}
                  </div>
                  
                  {isActive && (
                    <div className="flex bg-ink/5 rounded-full p-1 self-start md:self-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModes(prev => ({ ...prev, [i]: 'guided' }));
                        }}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] transition-all ${modes[i] === 'guided' ? 'bg-white shadow-sm text-ink' : 'text-ink-muted hover:text-ink'}`}
                      >
                        <Sparkles size={10} /> {t('test_associating_mode_guided')}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModes(prev => ({ ...prev, [i]: 'free' }));
                        }}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] transition-all ${modes[i] === 'free' ? 'bg-white shadow-sm text-ink' : 'text-ink-muted hover:text-ink'}`}
                      >
                        <PenLine size={10} /> {t('test_associating_mode_free')}
                      </button>
                    </div>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {isActive ? (
                    <motion.div
                      key="active-content"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {modes[i] === 'guided' ? (
                        <div className="text-left text-base md:text-lg text-ink/70 font-light leading-relaxed">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-6 md:gap-y-8">
                            <span className="whitespace-nowrap">{t('test_associating_guided_1')}</span>
                            <input
                              type="text"
                              value={guidedValues[i][0]}
                              onChange={(e) => handleGuidedChange(i, 0, e.target.value)}
                              placeholder={t('test_associating_guided_placeholder_1')}
                              className="w-full md:w-auto px-6 py-2.5 bg-emerald-50/50 hover:bg-emerald-50/80 rounded-full border border-emerald-100/20 focus:bg-white focus:border-emerald-400/30 focus:ring-4 focus:ring-emerald-400/5 outline-none transition-all text-ink placeholder:text-ink/20 text-left md:min-w-[180px]"
                            />
                            <span className="whitespace-nowrap">{t('test_associating_guided_2')}</span>
                            <input
                              type="text"
                              value={guidedValues[i][1]}
                              onChange={(e) => handleGuidedChange(i, 1, e.target.value)}
                              placeholder={t('test_associating_guided_placeholder_2')}
                              className="w-full md:w-auto px-6 py-2.5 bg-emerald-50/50 hover:bg-emerald-50/80 rounded-full border border-emerald-100/20 focus:bg-white focus:border-emerald-400/30 focus:ring-4 focus:ring-emerald-400/5 outline-none transition-all text-ink placeholder:text-ink/20 text-left md:min-w-[180px]"
                            />
                            <span className="whitespace-nowrap">{t('test_associating_guided_3')}</span>
                            <input
                              type="text"
                              value={guidedValues[i][2]}
                              onChange={(e) => handleGuidedChange(i, 2, e.target.value)}
                              placeholder={t('test_associating_guided_placeholder_3')}
                              className="w-full md:w-auto px-6 py-2.5 bg-emerald-50/50 hover:bg-emerald-50/80 rounded-full border border-emerald-100/20 focus:bg-white focus:border-emerald-400/30 focus:ring-4 focus:ring-emerald-400/5 outline-none transition-all text-ink placeholder:text-ink/20 text-left md:min-w-[180px]"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <textarea
                            value={associations[i]}
                            onChange={(e) => handleTextChange(i, e.target.value)}
                            placeholder={t('test_associating_placeholder')}
                            className="w-full h-32 md:h-40 bg-white/50 border border-white/30 rounded-2xl p-4 pb-10 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all resize-none"
                          />
                          <div className="absolute bottom-4 right-4">
                            <span className={`text-[10px] ${associations[i].length >= 180 ? 'text-rose-400' : 'text-ink-muted'}`}>
                              {associations[i].length} / 200
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Next Button - Bottom Center */}
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: completed ? 1 : 0, y: completed ? 0 : 10 }}
                        className="flex justify-center pt-4"
                      >
                        <Button
                          onClick={handleNext}
                          variant="outline"
                          className="rounded-full px-8 py-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-all gap-2 group"
                        >
                          {t('test_associating_next')}
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="inactive-content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-ink/40 font-serif italic text-sm md:text-base line-clamp-2"
                    >
                      {completed ? (
                        modes[i] === 'guided' 
                          ? `${t('test_associating_guided_1')} ${guidedValues[i][0]} ${t('test_associating_guided_2')} ${guidedValues[i][1]} ${t('test_associating_guided_3')} ${guidedValues[i][2]}`
                          : associations[i]
                      ) : (
                        "尚未開啟對話..."
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        id="final-complete-btn"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isAllComplete ? 1 : 0.3, y: 0 }}
        className="pt-10 md:pt-20"
      >
        <Button 
          onClick={handleFinish} 
          disabled={!isAllComplete}
          className={`h-20 px-20 gap-4 text-lg shadow-2xl transition-all duration-500 ${
            isAllComplete 
              ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-900/20 scale-110' 
              : 'bg-ink/10 text-ink/30'
          }`}
        >
          {t('test_associating_view_result')} <ArrowRight size={20} />
        </Button>
      </motion.div>
    </motion.div>
  );
};
