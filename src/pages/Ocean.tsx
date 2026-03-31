import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Waves, Send, Sparkles, X, Heart, Eye, Navigation } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../i18n/LanguageContext';
import { aiService } from '../services/aiService';
import { Bottle, BottleTag } from '../core/types';
import { LUMINA_CARDS } from '../core/cards';
import { CastBottleModal } from '../components/ocean/CastBottleModal';
import { BottleDetailModal } from '../components/ocean/BottleDetailModal';
import { OceanBackground } from '../components/ocean/OceanBackground';

interface MyBottle extends Bottle {
  blessing_count: number;
  last_blessing_at: string | null;
  last_checked_at: string;
  view_count: number;
}

export const Ocean: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const { t, language } = useLanguage();
  const [viewMode, setViewMode] = useState<'explore' | 'voyage'>('explore');
  const [voyageSubMode, setVoyageSubMode] = useState<'thrown' | 'saved'>('thrown');
  const [pickedBottle, setPickedBottle] = useState<Bottle | null>(null);
  const [myBottles, setMyBottles] = useState<MyBottle[]>([]);
  const [savedBottles, setSavedBottles] = useState<Bottle[]>([]);
  const [isFetchingMyBottles, setIsFetchingMyBottles] = useState(false);
  const [isFetchingSavedBottles, setIsFetchingSavedBottles] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [tags, setTags] = useState<BottleTag[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isBlessing, setIsBlessing] = useState(false);
  const [isHugging, setIsHugging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);
  const [showResonanceSuccess, setShowResonanceSuccess] = useState(false);
  
  // Ambient Sound State
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [showSoundGuide, setShowSoundGuide] = useState(false);
  const hasInteractedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSoundGuide(true);
      // Auto-hide after 8 seconds
      setTimeout(() => setShowSoundGuide(false), 8000);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteractedRef.current) {
        hasInteractedRef.current = true;
        setIsAmbientPlaying(true);
      }
      window.removeEventListener('click', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction, { once: true });
    return () => window.removeEventListener('click', handleFirstInteraction);
  }, []);

  useEffect(() => {
    // Initialize ambient audio
    const audio = new Audio(`https://firebasestorage.googleapis.com/v0/b/yuni-8f439.firebasestorage.app/o/eunie-assets%2Faudio%2Fwaves.MP3?alt=media&token=9b3dbc7c-6c56-447e-9c45-ac273d4fc4d4`);
    
    // Fallback logic if the primary waves audio fails
    audio.addEventListener('error', () => {
      console.warn("Ambient audio 'waves.MP3' failed to load, trying fallback...");
      // Fallback to the seeded "Water" element track which is guaranteed to exist
      audio.src = "https://firebasestorage.googleapis.com/v0/b/yuni-8f439.firebasestorage.app/o/eunie-assets%2Faudio%2FLittle%20River%20Breeze%20Tea%20Time%EF%BC%88%E6%B0%B4%EF%BC%89%20(1).mp3?alt=media&token=40dfaf97-93fb-4e74-bea2-d95fabd71b0c";
      audio.load();
      if (isAmbientPlaying) {
        audio.play().catch(err => console.error("Fallback ambient play also failed:", err));
      }
    });

    audio.loop = true;
    audio.volume = 0;
    ambientAudioRef.current = audio;

    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!ambientAudioRef.current) return;
    
    if (isAmbientPlaying) {
      ambientAudioRef.current.play().catch(err => console.error("Ambient play failed:", err));
      // Fade in
      let vol = 0;
      const interval = setInterval(() => {
        vol += 0.02;
        if (vol >= 0.3) {
          vol = 0.3;
          clearInterval(interval);
        }
        if (ambientAudioRef.current) ambientAudioRef.current.volume = vol;
      }, 50);
      return () => clearInterval(interval);
    } else {
      // Fade out
      let vol = ambientAudioRef.current.volume;
      const interval = setInterval(() => {
        vol -= 0.02;
        if (vol <= 0) {
          vol = 0;
          ambientAudioRef.current?.pause();
          clearInterval(interval);
        }
        if (ambientAudioRef.current) ambientAudioRef.current.volume = vol;
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAmbientPlaying]);

  useEffect(() => {
    // Check premium status
    if (profile && profile.subscription_status !== 'active' && profile.role !== 'admin') {
      setShowPremiumModal(true);
    }

    // Fetch tags
    fetch('/api/bottles/tags')
      .then(res => res.json())
      .then(setTags)
      .catch(console.error);
  }, [profile]);

  useEffect(() => {
    if (viewMode === 'voyage' && profile) {
      if (voyageSubMode === 'thrown') {
        fetchMyBottles();
      } else {
        fetchSavedBottles();
      }
    }
  }, [viewMode, voyageSubMode, profile]);

  const fetchMyBottles = async () => {
    if (!profile) return;
    setIsFetchingMyBottles(true);
    try {
      const res = await fetch(`/api/bottles/my/${profile.uid}`);
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await res.json();
          setMyBottles(Array.isArray(data) ? data : []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingMyBottles(false);
    }
  };

  const fetchSavedBottles = async () => {
    if (!profile) return;
    setIsFetchingSavedBottles(true);
    try {
      const res = await fetch(`/api/bottles/saved/${profile.uid}`);
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await res.json();
          setSavedBottles(Array.isArray(data) ? data : []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingSavedBottles(false);
    }
  };

  const handleSaveBottle = async (bottleId: string, replyMessage: string) => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/bottles/${bottleId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.uid, replyMessage })
      });
      
      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'REPLY_COOLDOWN') {
          const err = new Error(data.error);
          (err as any).code = 'REPLY_COOLDOWN';
          (err as any).remainingHours = data.remainingHours;
          throw err;
        }
        
        if (data.code === 'LIMIT_EXCEEDED' || data.error?.includes('limit')) {
          alert(t('ocean_save_limit_error'));
        } else {
          throw new Error(data.error || 'Failed to save');
        }
      } else {
        // Refresh saved bottles
        fetchSavedBottles();
        setShowResonanceSuccess(true);
      }
    } catch (err) {
      console.error('Failed to save bottle:', err);
      throw err; // Re-throw to be caught by the modal
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSavedBottle = async (savedId: string) => {
    try {
      const res = await fetch(`/api/bottles/saved/${savedId}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedBottles(prev => prev.filter(b => b.saved_id !== savedId));
      }
    } catch (err) {
      console.error('Failed to delete saved bottle:', err);
    }
  };

  const calculateDrift = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const hours = (now - created) / (1000 * 60 * 60);
    return (hours * 1.2).toFixed(1); // 1.2 nm per hour
  };

  const markAsRead = async (bottleId: string) => {
    try {
      await fetch(`/api/bottles/${bottleId}/mark-read`, { method: 'POST' });
      setMyBottles(prev => prev.map(b => 
        b.id === bottleId ? { ...b, last_checked_at: new Date().toISOString() } : b
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const pickupBottle = async () => {
    if (!profile) return;
    
    try {
      const res = await fetch(`/api/bottles/random?userId=${profile.uid}&targetLang=${language}`);
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const bottle = await res.json();
          setPickedBottle(bottle);
          setTranslatedContent(bottle.translatedContent || null);
        }
      } else {
        // No bottles found or error
        alert(t('ocean_no_bottles'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTranslate = async () => {
    if (!pickedBottle || isTranslating) return;
    
    setIsTranslating(true);
    try {
      const targetLang = language === 'ja' ? 'ja' : 'zh';
      const res = await fetch(`/api/bottles/${pickedBottle.id}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLang })
      });
      
      if (res.ok) {
        const data = await res.json();
        setTranslatedContent(data.translatedContent);
      } else {
        // Fallback to old service if API fails
        const translation = await aiService.translateBottle(pickedBottle.content, targetLang);
        setTranslatedContent(translation);
      }
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  const sendBlessing = async (tagId: string) => {
    if (!pickedBottle || !profile || isBlessing) return;
    
    setIsBlessing(true);
    try {
      const res = await fetch(`/api/bottles/${pickedBottle.id}/bless`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.uid, tagId })
      });
      
      if (res.ok) {
        setPickedBottle(null);
        setShowResonanceSuccess(true);
        // Show success animation or toast
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBlessing(false);
    }
  };

  const handleHug = async (bottleId: string) => {
    if (isHugging) return;
    setIsHugging(true);
    try {
      const res = await fetch(`/api/bottles/${bottleId}/hug`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (pickedBottle && pickedBottle.id === bottleId) {
          setPickedBottle({ ...pickedBottle, hug_count: data.hugCount });
        }
        // Also update in myBottles or savedBottles if present
        setMyBottles(prev => prev.map(b => b.id === bottleId ? { ...b, hug_count: data.hugCount } : b));
        setSavedBottles(prev => prev.map(b => b.id === bottleId ? { ...b, hug_count: data.hugCount } : b));
      }
    } catch (err) {
      console.error('Failed to hug bottle:', err);
    } finally {
      setIsHugging(false);
    }
  };

  if (showPremiumModal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A1128] p-6">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center border border-white/10">
          <div className="w-16 h-16 bg-water/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-water" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-4">
            {language === 'ja' ? '共鳴の海へようこそ' : '歡迎來到共鳴之海'}
          </h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            {language === 'ja' 
              ? 'ここはプレミアム会員専用の空間です。あなたのエネルギーを世界に届け、誰かの心と共鳴しましょう。' 
              : '這裡是 Premium 會員專屬的空間。讓妳的能量在海洋中流動，與遠方的靈魂產生共鳴。'}
          </p>
          <button 
            onClick={() => onNavigate?.('profile')}
            className="w-full py-4 bg-white text-ink rounded-full font-medium hover:bg-white/90 transition-all"
          >
            {language === 'ja' ? 'プランを確認する' : '查看訂閱方案'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0A1128] overflow-hidden flex flex-col items-center">
      <OceanBackground />

      {/* Top Navigation Toggle */}
      <div className="z-20 mt-12 mb-8 flex items-center gap-4">
        <div className="bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/10 flex items-center shadow-lg">
          <button
            onClick={() => setViewMode('explore')}
            className={`px-8 py-2.5 rounded-full text-xs tracking-widest uppercase transition-all ${
              viewMode === 'explore' ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {language === 'zh' ? '探索海洋' : '海を探索'}
          </button>
          <button
            onClick={() => setViewMode('voyage')}
            className={`px-8 py-2.5 rounded-full text-xs tracking-widest uppercase transition-all ${
              viewMode === 'voyage' ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {language === 'zh' ? '我的航程' : '私の航海'}
          </button>
        </div>
      </div>

      <div className="z-10 text-center px-6 w-full max-w-4xl flex-1 flex flex-col justify-center">
        {viewMode === 'explore' ? (
          !pickedBottle ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center mb-[100px] md:mt-0 md:mb-[200px]"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAmbientPlaying(!isAmbientPlaying);
                }}
                className="w-24 h-24 mb-8 relative group outline-none cursor-pointer"
              >
                <motion.div
                  animate={isAmbientPlaying ? { 
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3]
                  } : { 
                    scale: [1, 1.1, 1], 
                    opacity: [0.2, 0.3, 0.2]
                  }}
                  transition={{ duration: isAmbientPlaying ? 3 : 6, repeat: Infinity }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(51,166,184,0.4) 0%, transparent 70%)',
                    willChange: 'transform, opacity',
                    transform: 'translateZ(0)'
                  }}
                />
                {isAmbientPlaying && (
                  <motion.div
                    animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 border-2 border-water/40 rounded-full"
                  />
                )}
                <div className={`relative z-10 w-full h-full flex items-center justify-center bg-white/10 backdrop-blur-sm border rounded-full shadow-lg transition-all ${
                  isAmbientPlaying ? 'border-water/40 bg-water/5' : 'border-white/20'
                }`}>
                  <Waves className={`w-10 h-10 transition-colors ${isAmbientPlaying ? 'text-water' : 'text-white'}`} />
                </div>

                {/* Sound Guidance Tooltip */}
                <AnimatePresence>
                  {showSoundGuide && !isAmbientPlaying && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSoundGuide(false);
                      }}
                      className="absolute -top-16 left-1/2 -translate-x-1/2 w-max px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl cursor-pointer z-50"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-water rounded-full animate-pulse" />
                        <span className="text-[10px] text-white/80 tracking-widest uppercase font-medium">
                          {language === 'zh' ? '點擊開啟海浪聲，沉浸於此' : '波の音を聴きながら、没入しましょう'}
                        </span>
                      </div>
                      {/* Triangle pointer */}
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/10 border-r border-b border-white/20 rotate-45 backdrop-blur-xl" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
              
              <h1 className="text-3xl font-serif font-bold text-white mb-4 tracking-widest">
                {language === 'zh' ? '共鳴之海' : '共鳴の海'}
              </h1>
              <p className="text-white/60 mb-12 max-w-xs mx-auto leading-relaxed italic">
                {language === 'ja' 
                  ? '静かな波の音に耳を澄ませて、漂うメッセージを探してみましょう。' 
                  : '靜下心來，聽聽海浪的聲音，尋找那些漂流在時光中的訊息。'}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={pickupBottle}
                  className="group relative px-10 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 transition-all overflow-hidden shadow-lg"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-water" />
                    {language === 'ja' ? 'ボトルレターを拾う' : '拾取瓶中信'}
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-water/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>

                <button
                  onClick={() => setIsCastModalOpen(true)}
                  className="group relative px-10 py-4 bg-water/20 hover:bg-water/30 text-white rounded-full border border-water/40 transition-all overflow-hidden shadow-lg"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <Send className="w-5 h-5 text-white" />
                    {t('ocean_cast_btn')}
                  </span>
                </button>
              </div>
            </motion.div>
          ) : null
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl mx-auto space-y-8 mb-[100px] md:mt-0 md:mb-[200px]"
          >
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-serif italic text-white">
                  {language === 'zh' ? '海洋航行日誌' : '海洋航行日誌'}
                </h2>
                <p className="text-xs text-white/40 tracking-widest uppercase">
                  {language === 'zh' ? '追蹤妳投擲出的每一份能量' : 'あなたが投げ出したエネルギーを追跡する'}
                </p>
              </div>

              {/* Voyage Tabs */}
              <div className="flex justify-center p-1 bg-white/5 backdrop-blur-md rounded-full border border-white/10 w-fit mx-auto">
                <button
                  onClick={() => setVoyageSubMode('thrown')}
                  className={`px-6 py-2 rounded-full text-[10px] tracking-[0.2em] uppercase transition-all ${
                    voyageSubMode === 'thrown' ? 'bg-white/10 text-white shadow-sm' : 'text-white/30 hover:text-white/50'
                  }`}
                >
                  {t('ocean_my_thrown')}
                </button>
                <button
                  onClick={() => setVoyageSubMode('saved')}
                  className={`px-6 py-2 rounded-full text-[10px] tracking-[0.2em] uppercase transition-all ${
                    voyageSubMode === 'saved' ? 'bg-white/10 text-white shadow-sm' : 'text-white/30 hover:text-white/50'
                  }`}
                >
                  {t('ocean_my_saved')}
                </button>
              </div>
            </div>

            {voyageSubMode === 'thrown' ? (
              isFetchingMyBottles ? (
                <div className="py-20 flex justify-center">
                  <div className="w-8 h-8 border-2 border-white/10 border-t-water rounded-full animate-spin" />
                </div>
              ) : myBottles.length === 0 ? (
                <div className="py-20 text-center space-y-6">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto border border-white/20">
                    <Navigation className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-sm text-white/40 italic">
                    {language === 'zh' ? '妳的航程尚未開始，去投擲第一封瓶中信吧。' : 'あなたの航海はまだ始まっていません。最初の瓶中信を投げに行きましょう。'}
                  </p>
                  <button
                    onClick={() => setViewMode('explore')}
                    className="px-8 py-3 bg-white/10 text-white border border-white/20 rounded-full hover:bg-white/20 transition-all text-sm"
                  >
                    {language === 'zh' ? '前往探索海洋' : '海を探索しに行く'}
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {myBottles.map((bottle, index) => {
                    const hasNewBlessing = bottle.last_blessing_at && new Date(bottle.last_blessing_at) > new Date(bottle.last_checked_at);
                    
                    // Determine the thumbnail URL
                    const thumbnail = bottle.card_image_url || (() => {
                      if (!bottle.card_id) return null;
                      
                      const cardIdStr = String(bottle.card_id);
                      const isWord = cardIdStr.startsWith('word_');
                      const isImg = cardIdStr.startsWith('img_');
                      const numericId = Number(cardIdStr.replace(/^(word_|img_)/, ''));
                      
                      if (isWord || isImg) {
                        const card = LUMINA_CARDS.find(c => Number(c.id) === numericId);
                        if (card) return isWord ? card.wordCardUrl : card.imageCardUrl;
                      }
                      
                      // Legacy fallback: try report_data first
                      if (bottle.report_data?.pairs) {
                        const pair = bottle.report_data.pairs.find((p: any) => Number(p.word?.id) === Number(bottle.card_id));
                        if (pair?.word) return pair.word.imageUrl;
                      }
                      
                      const card = LUMINA_CARDS.find(c => Number(c.id) === Number(bottle.card_id));
                      if (card) return card.wordCardUrl;
                      return null;
                    })() || 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&q=80&w=1000';

                    return (
                      <motion.div
                        key={`my-bottle-${bottle.id || index}-${index}`}
                        layout
                        onClick={() => {
                          markAsRead(bottle.id);
                          setPickedBottle(bottle);
                          setTranslatedContent(bottle.translatedContent || null);
                        }}
                        className={`group relative bg-white/10 backdrop-blur-md border rounded-3xl p-6 transition-all cursor-pointer ${
                          hasNewBlessing ? 'border-water/60 shadow-[0_10px_30px_rgba(51,166,184,0.2)]' : 'border-white/10 hover:border-white/20 shadow-lg'
                        }`}
                      >
                        <div className="flex gap-6">
                          <div className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                            {thumbnail ? (
                              <img src={thumbnail} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Waves className="w-8 h-8 text-white/10" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] tracking-widest text-white/40 uppercase">
                                {new Date(bottle.created_at).toLocaleDateString()}
                              </p>
                              {hasNewBlessing && (
                                <motion.span
                                  animate={{ opacity: [0.6, 1, 0.6] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="text-[10px] text-water font-bold uppercase tracking-tighter"
                                >
                                  {language === 'zh' ? '✨ 收到了一份共鳴' : '✨ 共鳴を受け取りました'}
                                </motion.span>
                              )}
                            </div>

                            <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">
                              {bottle.content}
                            </p>

                            <div className="flex items-center gap-6 pt-2">
                              <div className="flex items-center gap-2 text-white/40">
                                <Waves size={12} className="text-water" />
                                <span className="text-[10px] font-mono">{calculateDrift(bottle.created_at)} nm</span>
                              </div>
                              <div className="flex items-center gap-2 text-white/40">
                                <Eye size={12} />
                                <span className="text-[10px] font-mono">{bottle.view_count}</span>
                              </div>
                              <div className="flex items-center gap-2 text-white/40">
                                <Heart size={12} className={bottle.blessing_count > 0 ? 'text-fire' : ''} />
                                <span className="text-[10px] font-mono">{bottle.blessing_count}</span>
                              </div>
                              <div className="flex items-center gap-2 text-white/40">
                                <Sparkles size={12} className={bottle.hug_count > 0 ? 'text-water' : ''} />
                                <span className="text-[10px] font-mono">{bottle.hug_count || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )
            ) : (
              isFetchingSavedBottles ? (
                <div className="py-20 flex justify-center">
                  <div className="w-8 h-8 border-2 border-white/10 border-t-water rounded-full animate-spin" />
                </div>
              ) : savedBottles.length === 0 ? (
                <div className="py-20 text-center space-y-6">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto border border-white/20">
                    <Heart className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-sm text-white/40 italic">
                    {language === 'zh' ? '妳尚未收藏任何共鳴，去探索海洋吧。' : 'あなたはまだ共鳴をコレクションしていません。海を探索しに行きましょう。'}
                  </p>
                  <button
                    onClick={() => setViewMode('explore')}
                    className="px-8 py-3 bg-white/10 text-white border border-white/20 rounded-full hover:bg-white/20 transition-all text-sm"
                  >
                    {language === 'zh' ? '前往探索海洋' : '海を探索しに行く'}
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {savedBottles.map((bottle, index) => {
                    const thumbnail = bottle.card_image || bottle.card_image_url || (() => {
                      if (!bottle.card_id) return null;
                      const cardIdStr = String(bottle.card_id);
                      const isWord = cardIdStr.startsWith('word_');
                      const isImg = cardIdStr.startsWith('img_');
                      const numericId = Number(cardIdStr.replace(/^(word_|img_)/, ''));
                      if (isWord || isImg) {
                        const card = LUMINA_CARDS.find(c => Number(c.id) === numericId);
                        if (card) return isWord ? card.wordCardUrl : card.imageCardUrl;
                      }
                      const card = LUMINA_CARDS.find(c => Number(c.id) === Number(bottle.card_id));
                      if (card) return card.wordCardUrl;
                      return null;
                    })() || 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&q=80&w=1000';

                    return (
                      <motion.div
                        key={`saved-bottle-${bottle.saved_id || bottle.id}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group relative bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-6 transition-all hover:border-white/20 shadow-lg"
                      >
                        <div className="flex gap-6">
                          <button
                            onClick={() => setPickedBottle(bottle)}
                            className="flex-1 flex gap-6 text-left"
                          >
                            <div className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                              {thumbnail ? (
                                <img src={thumbnail} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Waves className="w-8 h-8 text-white/10" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 space-y-4">
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] tracking-widest text-white/40 uppercase">
                                  {new Date(bottle.saved_at!).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'ja-JP')}
                                </p>
                                <span className="text-[10px] text-water/60 font-bold uppercase tracking-widest">
                                  Saved Resonance
                                </span>
                              </div>

                              <p className="text-sm text-white/80 line-clamp-2 leading-relaxed italic font-serif">
                                「{bottle.content}」
                              </p>

                              {bottle.reply_message && (
                                <div className="pt-2 border-t border-white/5">
                                  <p className="text-[10px] text-white/30 italic line-clamp-1">
                                    Re: {bottle.reply_message}
                                  </p>
                                </div>
                              )}
                            </div>
                          </button>

                          <button
                            onClick={() => handleDeleteSavedBottle(bottle.saved_id!)}
                            className="self-start p-2 text-white/20 hover:text-red-400 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )
            )}
          </motion.div>
        )}
      </div>

      <CastBottleModal 
        isOpen={isCastModalOpen}
        onClose={() => setIsCastModalOpen(false)}
        onNavigate={onNavigate}
        onSuccess={() => setShowResonanceSuccess(true)}
      />

      <AnimatePresence>
        {showResonanceSuccess && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResonanceSuccess(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#FDFCF8] p-8 md:p-12 rounded-[3rem] shadow-2xl max-w-md w-full text-center space-y-8"
            >
              <div className="w-20 h-20 bg-water/10 rounded-full flex items-center justify-center mx-auto text-water">
                <Sparkles size={40} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-serif italic text-ink">
                  {t('ocean_resonance_success_title')}
                </h3>
                <p className="text-sm text-ink/40 leading-relaxed">
                  {t('ocean_resonance_success_desc')}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => onNavigate?.('journal')}
                  className="w-full py-4 bg-ink text-white rounded-full text-xs tracking-[0.2em] font-bold uppercase hover:bg-ink/90 transition-colors"
                >
                  {t('ocean_resonance_go_to_reflection')}
                </button>
                <button
                  onClick={() => setShowResonanceSuccess(false)}
                  className="w-full py-4 bg-ink/5 text-ink/40 rounded-full text-xs tracking-[0.2em] font-bold uppercase hover:bg-ink/10 transition-colors"
                >
                  {t('ocean_resonance_continue_explore')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pickedBottle && (
          <BottleDetailModal
            bottle={pickedBottle}
            onClose={() => {
              setPickedBottle(null);
              setTranslatedContent(null);
            }}
            onTranslate={handleTranslate}
            onBless={sendBlessing}
            onHug={handleHug}
            onSave={handleSaveBottle}
            translatedContent={translatedContent}
            isTranslating={isTranslating}
            isBlessing={isBlessing}
            isHugging={isHugging}
            isSaving={isSaving}
            tags={tags}
            isSaved={!!pickedBottle.saved_id}
            isOwnBottle={profile?.uid === pickedBottle.user_id}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
