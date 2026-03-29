import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Crown, Check, Sparkles, Zap, Shield, Heart, ArrowRight, Star, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { useLanguage } from '../i18n/LanguageContext';

interface SubscriptionProps {
  onNavigate?: (page: string) => void;
}

export const Subscription: React.FC<SubscriptionProps> = ({ onNavigate }) => {
  const { user, profile, setProfile, isPremium, isSubscribed } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const handleStartTrial = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const updated = await userService.startTrial(user.uid);
      setProfile(updated);
      alert(t('trial_started' as any) || "7日間の無料トライアルを開始しました！");
      onNavigate?.('profile');
    } catch (error) {
      console.error("Trial start failed:", error);
      alert(t('trial_failed' as any) || "トライアルの開始に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const updated = await userService.upgradeSubscription(
        user.uid, 
        'premium', 
        selectedPlan,
        selectedPlan === 'monthly' ? 1 : 12
      );
      setProfile(updated);
      alert(t('upgrade_success' as any) || "プレミアムプランへのアップグレードが完了しました！");
      onNavigate?.('profile');
    } catch (error) {
      console.error("Upgrade failed:", error);
      alert(t('upgrade_failed' as any) || "アップグレードに失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Sparkles className="text-amber-400" />, text: t('feature_ai_deep' as any) || "AI 深度能量分析報告" },
    { icon: <Zap className="text-blue-400" />, text: t('feature_ocean_cast' as any) || "無限次投擲共鳴瓶" },
    { icon: <Shield className="text-emerald-400" />, text: t('feature_history_full' as any) || "完整能量歷史追蹤" },
    { icon: <Heart className="text-rose-400" />, text: t('feature_exclusive_cards' as any) || "解鎖專屬隱藏牌組" },
    { icon: <Star className="text-purple-400" />, text: t('feature_priority_ai' as any) || "優先 AI 運算權限" },
    { icon: <Clock className="text-indigo-400" />, text: t('feature_future_vision' as any) || "未來能量趨勢預測" },
  ];

  return (
    <div className="ma-container pt-12 md:pt-20 pb-48 md:pb-64 min-h-screen px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center space-y-6 mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-[10px] tracking-[0.3em] uppercase"
          >
            <Crown size={14} />
            {t('premium_experience' as any) || "PREMIUM EXPERIENCE"}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-serif tracking-widest text-ink"
          >
            {t('upgrade_title')}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-lg text-ink-muted font-light tracking-widest max-w-2xl mx-auto leading-relaxed"
          >
            {t('upgrade_desc')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Features List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-4 p-6 rounded-3xl bg-white/40 border border-white/60 backdrop-blur-xl shadow-sm"
                >
                  <div className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center shadow-inner">
                    {feature.icon}
                  </div>
                  <span className="text-sm tracking-widest text-ink-muted font-light">{feature.text}</span>
                </motion.div>
              ))}
            </div>
            
            <GlassCard delay={0.8} className="p-8 md:p-12 bg-wood/5 border-wood/10">
              <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="font-serif text-xl tracking-widest text-wood">{t('trial_banner_title' as any) || "還在猶豫嗎？"}</h3>
                  <p className="text-sm text-ink-muted tracking-widest font-light">{t('trial_banner_desc' as any) || "現在加入，即可享有 7 天完整功能免費體驗。"}</p>
                </div>
                <Button 
                  onClick={handleStartTrial}
                  disabled={loading || isSubscribed}
                  variant="outline"
                  className="h-12 px-8 border-wood text-wood hover:bg-wood hover:text-white tracking-widest"
                >
                  {isSubscribed ? t('already_member' as any) : t('start_free_trial' as any) || "開始免費試用"}
                </Button>
              </div>
            </GlassCard>
          </div>

          {/* Pricing Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="sticky top-24"
          >
            <div className="bg-white/80 backdrop-blur-3xl border border-amber-200 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-amber-900/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <Crown size={48} className="text-amber-100 -rotate-12" />
              </div>
              
              <div className="space-y-8 relative z-10">
                <div className="space-y-4">
                  <div className="flex p-1 bg-ink/5 rounded-2xl">
                    <button
                      onClick={() => setSelectedPlan('monthly')}
                      className={`flex-1 py-3 text-[10px] tracking-[0.2em] rounded-xl transition-all ${selectedPlan === 'monthly' ? 'bg-white shadow-sm text-ink' : 'text-ink-muted hover:text-ink'}`}
                    >
                      {t('monthly' as any) || "按月訂閱"}
                    </button>
                    <button
                      onClick={() => setSelectedPlan('yearly')}
                      className={`flex-1 py-3 text-[10px] tracking-[0.2em] rounded-xl transition-all ${selectedPlan === 'yearly' ? 'bg-white shadow-sm text-ink' : 'text-ink-muted hover:text-ink'}`}
                    >
                      {t('yearly' as any) || "按年訂閱"}
                    </button>
                  </div>
                  
                  <div className="text-center py-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-sm font-light text-ink-muted">NT$</span>
                      <span className="text-5xl font-serif text-ink tracking-tighter">
                        {selectedPlan === 'monthly' ? '150' : '1,200'}
                      </span>
                      <span className="text-sm font-light text-ink-muted">/{selectedPlan === 'monthly' ? t('month' as any) : t('year' as any)}</span>
                    </div>
                    {selectedPlan === 'yearly' && (
                      <div className="mt-2 text-[10px] text-emerald-600 tracking-widest font-medium">
                        {t('save_33' as any) || "節省 33% 的費用"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-ink-muted font-light">
                    <Check size={16} className="text-emerald-500" />
                    <span>{t('cancel_anytime' as any) || "隨時可以取消"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-ink-muted font-light">
                    <Check size={16} className="text-emerald-500" />
                    <span>{t('no_hidden_fees' as any) || "無任何隱藏費用"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-ink-muted font-light">
                    <Check size={16} className="text-emerald-500" />
                    <span>{t('secure_payment' as any) || "安全加密支付系統"}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleUpgrade}
                  disabled={loading || isPremium}
                  className="w-full h-16 bg-wood text-white rounded-2xl text-sm tracking-[0.4em] shadow-xl shadow-wood/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {loading ? t('processing' as any) : isPremium ? t('current_plan' as any) : t('subscribe_now' as any) || "立即訂閱"}
                </Button>
                
                <p className="text-[10px] text-center text-ink-muted/60 leading-relaxed px-4">
                  {t('subscription_terms' as any) || "點擊訂閱即表示您同意我們的服務條款與隱私權政策。"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
