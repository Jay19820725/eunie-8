import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, CreditCard, Check, ShieldCheck, Zap } from 'lucide-react';
import { Button } from './ui/Button';
import { useLanguage } from '../i18n/LanguageContext';
import { auth } from '../lib/firebase';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t, language } = useLanguage();
  const [step, setStep] = useState<'selection' | 'payment'>('selection');
  const [selectedPlan, setSelectedPlan] = useState<'subscription' | 'points_pack' | 'trial_point' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFirstPurchase, setIsFirstPurchase] = useState(true);

  useEffect(() => {
    if (isOpen && auth.currentUser) {
      fetch(`/api/users/${auth.currentUser.uid}/points`)
        .then(res => res.json())
        .then(data => {
          setIsFirstPurchase(data.is_first_purchase);
        })
        .catch(err => console.error("Error fetching user status:", err));
    }
  }, [isOpen]);

  const plans = [
    {
      id: 'trial_point',
      name: language === 'ja' ? '体験プラン' : '體驗方案',
      points: 1,
      price: language === 'ja' ? 150 : 30,
      currency: language === 'ja' ? 'JPY' : 'TWD',
      description: language === 'ja' ? '初回限定、1回分の分析' : '首次限定，單次深度分析',
      tag: language === 'ja' ? '初回限定' : '首次限定',
      show: isFirstPurchase
    },
    {
      id: 'subscription',
      name: language === 'ja' ? '月間サブスクリプション' : '每月訂閱方案',
      points: 15,
      price: language === 'ja' ? 1500 : 299,
      currency: language === 'ja' ? 'JPY' : 'TWD',
      description: language === 'ja' ? '毎月15ポイント、優先アクセス' : '每月 15 點靈光，優先體驗權',
      tag: language === 'ja' ? '人気' : '最受歡迎',
      show: true
    },
    {
      id: 'points_pack',
      name: language === 'ja' ? 'ポイントパック' : '靈光點數包',
      points: 15,
      price: language === 'ja' ? 2000 : 399,
      currency: language === 'ja' ? 'JPY' : 'TWD',
      description: language === 'ja' ? '15ポイント、有効期限なし' : '15 點靈光，無使用期限',
      tag: null,
      show: true
    }
  ];

  const handleSelectPlan = (planId: any) => {
    setSelectedPlan(planId);
    setStep('payment');
  };

  const handleSimulatePayment = async () => {
    if (!auth.currentUser || !selectedPlan) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/payments/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          type: selectedPlan,
          amount: plans.find(p => p.id === selectedPlan)?.price,
          currency: plans.find(p => p.id === selectedPlan)?.currency
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Payment simulation failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50"
        >
          {/* Header */}
          <div className="p-8 pb-0 flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-2xl font-serif text-ink">
                {step === 'selection' ? (language === 'ja' ? '霊光を採集する' : '採集靈光') : (language === 'ja' ? 'お支払い' : '確認支付')}
              </h2>
              <p className="text-sm text-ink-muted">
                {step === 'selection' ? (language === 'ja' ? 'AI深度分析のためにエネルギーを補充しましょう' : '為您的 AI 深度分析補充能量') : (language === 'ja' ? '安全な決済シミュレーション' : '安全且加密的支付模擬')}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-ink/5 rounded-full transition-colors">
              <X size={20} className="text-ink-muted" />
            </button>
          </div>

          <div className="p-8">
            {step === 'selection' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.filter(p => p.show).map((plan) => (
                  <motion.div
                    key={plan.id}
                    whileHover={{ y: -4 }}
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`relative p-6 rounded-3xl border cursor-pointer transition-all ${
                      plan.id === 'subscription' 
                        ? 'bg-wood/5 border-wood/30 shadow-lg shadow-wood/5' 
                        : 'bg-white/50 border-white/50 hover:border-wood/30'
                    }`}
                  >
                    {plan.tag && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-wood text-white text-[10px] tracking-widest uppercase rounded-full shadow-lg">
                        {plan.tag}
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="p-2 bg-white/80 rounded-xl shadow-sm">
                          {plan.id === 'subscription' ? <Sparkles size={20} className="text-wood" /> : <Zap size={20} className="text-wood" />}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-serif text-lg text-ink">{plan.name}</h3>
                        <p className="text-[10px] text-ink-muted uppercase tracking-wider">{plan.description}</p>
                      </div>
                      
                      <div className="pt-4 border-t border-ink/5">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-serif text-ink">
                            {plan.currency === 'JPY' ? '¥' : 'NT$'}
                            {plan.price}
                          </span>
                          <span className="text-xs text-ink-muted">
                            {plan.id === 'subscription' ? (language === 'ja' ? '/月' : '/月') : ''}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-wood font-medium">
                          <Check size={12} />
                          {plan.points} {language === 'ja' ? 'ポイント' : '點靈光'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-ink/5 rounded-3xl p-6 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <CreditCard className="text-wood" />
                    </div>
                    <div>
                      <h4 className="font-serif text-ink">{plans.find(p => p.id === selectedPlan)?.name}</h4>
                      <p className="text-xs text-ink-muted">{plans.find(p => p.id === selectedPlan)?.points} {language === 'ja' ? 'ポイント' : '點靈光'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-serif text-ink">
                      {plans.find(p => p.id === selectedPlan)?.currency === 'JPY' ? '¥' : 'NT$'}
                      {plans.find(p => p.id === selectedPlan)?.price}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-ink-muted ml-1">{language === 'ja' ? 'カード番号' : '卡號'}</label>
                      <div className="h-12 bg-white border border-ink/10 rounded-xl flex items-center px-4 text-ink-muted text-sm italic">
                        •••• •••• •••• 4242
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-ink-muted ml-1">{language === 'ja' ? '有効期限' : '有效期'}</label>
                      <div className="h-12 bg-white border border-ink/10 rounded-xl flex items-center px-4 text-ink-muted text-sm italic">
                        12 / 26
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <Button
                    onClick={handleSimulatePayment}
                    isLoading={isProcessing}
                    className="h-14 rounded-2xl shadow-xl shadow-wood/10"
                  >
                    {language === 'ja' ? '支払いを完了する' : '確認並支付'}
                  </Button>
                  <button
                    onClick={() => setStep('selection')}
                    className="text-xs text-ink-muted hover:text-ink transition-colors"
                  >
                    {language === 'ja' ? 'プランを変更する' : '返回修改方案'}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] text-ink-muted uppercase tracking-widest">
                  <ShieldCheck size={14} />
                  {language === 'ja' ? '安全な決済環境' : '安全加密支付環境'}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
