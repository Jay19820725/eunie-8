import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import { Wind, ArrowRight, Target, Heart, Briefcase, Coins, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface WishInputStageProps {
  onSubmit: (context: { category: string; target: string; content: string }) => void;
}

const categories = [
  { id: 'career', icon: Briefcase, labelKey: 'wish_category_career' },
  { id: 'love', icon: Heart, labelKey: 'wish_category_love' },
  { id: 'health', icon: Target, labelKey: 'wish_category_health' },
  { id: 'wealth', icon: Coins, labelKey: 'wish_category_wealth' },
  { id: 'other', icon: HelpCircle, labelKey: 'wish_category_other' },
];

export const WishInputStage: React.FC<WishInputStageProps> = ({ onSubmit }) => {
  const { t } = useLanguage();
  const [category, setCategory] = useState('career');
  const [target, setTarget] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim() || !content.trim()) return;
    onSubmit({ category, target, content });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto space-y-12 px-6"
    >
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-purple-50 rounded-full text-purple-400">
            <Wind size={24} />
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-serif font-light text-ink/80 tracking-wide">
          {t('wish_input_title')}
        </h2>
        <p className="text-sm text-ink/40 font-light leading-relaxed max-w-md mx-auto">
          {t('wish_input_desc')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Category Selection */}
        <div className="space-y-4">
          <label className="text-[10px] tracking-[0.3em] uppercase text-ink/30 font-medium px-2">
            {t('wish_input_category_label')}
          </label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-500 ${
                  category === cat.id
                    ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-100'
                    : 'bg-white/40 border-white/60 text-ink/40 hover:border-ink/20'
                }`}
              >
                <cat.icon size={18} />
                <span className="text-[9px] tracking-wider font-medium">{t(cat.labelKey as any)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Target Input */}
        <div className="space-y-4">
          <label className="text-[10px] tracking-[0.3em] uppercase text-ink/30 font-medium px-2">
            {t('wish_input_target_label')}
          </label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={t('wish_input_target_placeholder')}
            className="w-full bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl px-6 py-4 text-sm text-ink/70 placeholder:text-ink/20 focus:outline-none focus:border-ink/20 transition-all"
            required
          />
        </div>

        {/* Content Input */}
        <div className="space-y-4">
          <label className="text-[10px] tracking-[0.3em] uppercase text-ink/30 font-medium px-2">
            {t('wish_input_content_label')}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('wish_input_content_placeholder')}
            className="w-full bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl px-6 py-4 text-sm text-ink/70 placeholder:text-ink/20 focus:outline-none focus:border-ink/20 transition-all min-h-[120px] resize-none"
            required
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={!target.trim() || !content.trim()}
            className="w-full h-16 rounded-full bg-purple-500 text-white tracking-[0.4em] text-xs hover:bg-purple-600 shadow-xl shadow-purple-100 group"
          >
            <span className="flex items-center justify-center gap-3">
              {t('wish_input_submit')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
