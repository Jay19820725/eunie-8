import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Play, Loader2, Sparkles, MessageSquare, Activity } from 'lucide-react';
import { AIPrompt, FiveElementValues, ChatMessage } from '../../core/types';
import { useTestPromptMutation } from '../../hooks/useAdminData';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';

interface PromptSandboxProps {
  prompt: Partial<AIPrompt>;
  onClose: () => void;
}

export const PromptSandbox: React.FC<PromptSandboxProps> = ({ prompt, onClose }) => {
  const testPromptMutation = useTestPromptMutation();
  const [lang, setLang] = useState<'zh' | 'ja'>('zh');
  const [userInput, setUserInput] = useState('我今天覺得有點累，提不起勁。');
  const [energy, setEnergy] = useState<FiveElementValues>({
    wood: 20,
    fire: 15,
    earth: 25,
    metal: 20,
    water: 20
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ChatMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const systemInstruction = lang === 'ja' ? prompt.prompt_ja : prompt.prompt_zh;
      if (!systemInstruction) {
        throw new Error('該語言的提示詞內容為空');
      }

      const response = await testPromptMutation.mutateAsync({
        prompt: systemInstruction,
        userData: { name: '測試用戶', gender: 'female', input: userInput },
        energyData: energy,
        lang
      });
      
      const parsedResult = JSON.parse(response.result);
      setResult({
        role: 'model',
        content: parsedResult.content,
        energyUpdate: parsedResult.energyUpdate
      });
    } catch (err: any) {
      console.error('測試失敗:', err);
      setError(err.message || '測試過程中發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-[85vh]"
      >
        <div className="p-6 border-b border-ink/5 flex justify-between items-center bg-ink/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-wood/10 text-wood rounded-lg">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-serif">AI 提示詞測試沙盒</h3>
              <p className="text-[10px] text-ink-muted uppercase tracking-widest">正在測試: {prompt.section_key}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-ink/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left: Inputs */}
          <div className="w-full md:w-1/2 p-8 border-r border-ink/5 overflow-y-auto custom-scrollbar space-y-8">
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold">測試語言</label>
                <div className="flex bg-ink/5 p-1 rounded-xl">
                  <button 
                    onClick={() => setLang('zh')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest transition-all ${lang === 'zh' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted'}`}
                  >
                    中文
                  </button>
                  <button 
                    onClick={() => setLang('ja')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest transition-all ${lang === 'ja' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted'}`}
                  >
                    日文
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold">模擬用戶輸入</label>
              <textarea 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full h-32 px-4 py-3 bg-ink/[0.02] border border-ink/5 rounded-2xl text-sm focus:outline-none focus:border-wood/30 resize-none leading-relaxed"
                placeholder="輸入測試用的對話內容..."
              />
            </section>

            <section className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold">模擬能量狀態 (0-100)</label>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(energy).map(([el, val]) => (
                  <div key={el} className="space-y-2">
                    <div className="text-[10px] uppercase text-center text-ink-muted">{el}</div>
                    <input 
                      type="number"
                      value={val}
                      onChange={(e) => setEnergy({ ...energy, [el]: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-2 bg-ink/[0.02] border border-ink/5 rounded-lg text-xs text-center focus:outline-none focus:border-wood/30"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold">當前提示詞預覽</label>
              <div className="p-4 bg-ink/[0.02] border border-ink/5 rounded-2xl text-[11px] font-mono text-ink-muted max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {lang === 'ja' ? prompt.prompt_ja : prompt.prompt_zh}
              </div>
            </section>

            <Button 
              onClick={handleTest} 
              disabled={isLoading} 
              className="w-full h-14 rounded-2xl gap-3 text-sm font-medium shadow-lg shadow-wood/10"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
              執行測試
            </Button>
          </div>

          {/* Right: Results */}
          <div className="w-full md:w-1/2 p-8 bg-ink/[0.01] overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-8">
              <MessageSquare size={16} className="text-ink-muted" />
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-ink-muted font-semibold">AI 回應結果</h4>
            </div>

            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-ink-muted gap-4">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-xs tracking-widest animate-pulse">AI 正在思考中...</p>
              </div>
            ) : error ? (
              <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs flex items-center gap-3">
                <X size={18} />
                {error}
              </div>
            ) : result ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  <div className="text-[10px] uppercase tracking-widest text-ink-muted">文字內容</div>
                  <div className="p-6 bg-white border border-ink/5 rounded-[24px] shadow-sm text-sm leading-relaxed text-ink font-serif italic">
                    {result.content}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted">能量變動 (Energy Update)</div>
                    <Activity size={14} className="text-ink-muted" />
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    {Object.entries(result.energyUpdate || {}).map(([el, val]) => {
                      const numVal = val as number;
                      return (
                        <div key={el} className="flex flex-col items-center gap-2">
                          <div className="text-[9px] uppercase text-ink-muted">{el}</div>
                          <div className={`text-sm font-medium ${numVal > 0 ? 'text-wood' : numVal < 0 ? 'text-fire' : 'text-ink-muted'}`}>
                            {numVal > 0 ? `+${numVal}` : numVal}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-ink-muted/30 gap-6">
                <Sparkles size={48} strokeWidth={1} />
                <p className="text-xs tracking-widest">點擊「執行測試」查看 AI 回應</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
