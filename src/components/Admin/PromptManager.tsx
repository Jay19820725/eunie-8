import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Save, 
  Trash2, 
  Play, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Globe,
  Settings,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { AIPrompt } from '../../core/types';
import { 
  useAdminPrompts, 
  useSavePromptMutation, 
  useDeletePromptMutation,
  useSyncPromptsMutation
} from '../../hooks/useAdminData';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { PromptSandbox } from './PromptSandbox';

export const PromptManager: React.FC = () => {
  const [reportType, setReportType] = useState<'daily' | 'wish'>('daily');
  const { data: prompts, isLoading } = useAdminPrompts(reportType);
  const savePromptMutation = useSavePromptMutation();
  const deletePromptMutation = useDeletePromptMutation();
  const syncPromptsMutation = useSyncPromptsMutation();

  const [editingPrompt, setEditingPrompt] = useState<Partial<AIPrompt> | null>(null);
  const [testingPrompt, setTestingPrompt] = useState<Partial<AIPrompt> | null>(null);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);

  const handleSave = async () => {
    if (!editingPrompt) return;
    try {
      await savePromptMutation.mutateAsync(editingPrompt);
      setEditingPrompt(null);
    } catch (error) {
      console.error("Save failed:", error);
      alert("儲存失敗");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此 Prompt 區塊嗎？")) return;
    try {
      await deletePromptMutation.mutateAsync(id);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("刪除失敗");
    }
  };

  const handleSync = async (mode: 'sync' | 'reset') => {
    try {
      await syncPromptsMutation.mutateAsync({ mode, report_type: reportType });
      setShowSyncConfirm(false);
      alert(mode === 'sync' ? "已補足缺失內容" : "已重置為預設值");
    } catch (error) {
      console.error("Sync failed:", error);
      alert("同步失敗");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex bg-ink/5 p-1 rounded-2xl w-full md:w-auto">
          <button 
            onClick={() => setReportType('daily')}
            className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all ${
              reportType === 'daily' ? 'bg-white text-wood shadow-sm font-medium' : 'text-ink-muted hover:text-ink'
            }`}
          >
            內在校準 (Daily)
          </button>
          <button 
            onClick={() => setReportType('wish')}
            className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all ${
              reportType === 'wish' ? 'bg-white text-fire shadow-sm font-medium' : 'text-ink-muted hover:text-ink'
            }`}
          >
            內在解憂 (Wish)
          </button>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            variant="outline"
            onClick={() => setShowSyncConfirm(true)}
            className="flex-1 md:flex-none gap-2 h-11 px-6 text-[10px] uppercase tracking-widest border-wood/20 text-wood hover:bg-wood/5"
          >
            <RefreshCw size={14} className={syncPromptsMutation.isPending ? 'animate-spin' : ''} /> 同步預設值
          </Button>
          <Button 
            onClick={() => setEditingPrompt({ 
              report_type: reportType,
              section_key: '',
              prompt_zh: '',
              prompt_ja: '',
              is_enabled: true
            })}
            className="flex-1 md:flex-none gap-2 h-11 px-6 text-[10px] uppercase tracking-widest"
          >
            <Plus size={14} /> 新增 Prompt 區塊
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-ink-muted" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {prompts?.length === 0 ? (
            <GlassCard className="p-20 flex flex-col items-center justify-center text-center space-y-6">
              <div className="p-6 bg-ink/5 rounded-full text-ink-muted">
                <AlertCircle size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-serif">目前尚無 Prompt 內容</h3>
                <p className="text-sm text-ink-muted max-w-md">
                  您可以手動新增區塊，或是一鍵匯入系統預設的提示詞內容。
                </p>
              </div>
              <div className="flex gap-4">
                <Button onClick={() => handleSync('sync')} className="gap-2">
                  <RefreshCw size={16} /> 匯入預設內容
                </Button>
              </div>
            </GlassCard>
          ) : (
            prompts?.map((prompt) => (
              <GlassCard key={prompt.id} className="p-6 group hover:shadow-lg transition-all border-l-4 border-l-transparent hover:border-l-wood">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${prompt.is_enabled ? 'bg-wood/10 text-wood' : 'bg-ink/5 text-ink-muted'}`}>
                      {prompt.is_enabled ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-ink flex items-center gap-2">
                        {prompt.section_key}
                        {!prompt.is_enabled && <span className="text-[9px] bg-ink/5 px-2 py-0.5 rounded uppercase tracking-widest text-ink-muted">已停用</span>}
                      </h4>
                      <p className="text-[10px] text-ink-muted uppercase tracking-widest mt-1">
                        {prompt.report_type === 'daily' ? '內在校準' : '內在解憂'} · 最後更新: {new Date(prompt.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setTestingPrompt(prompt)}
                      className="p-2 hover:bg-wood/10 text-wood rounded-full transition-colors"
                      title="測試"
                    >
                      <Play size={16} />
                    </button>
                    <button 
                      onClick={() => setEditingPrompt(prompt)}
                      className="p-2 hover:bg-ink/5 text-ink rounded-full transition-colors"
                      title="編輯"
                    >
                      <Settings size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(prompt.id)}
                      className="p-2 hover:bg-fire/10 text-fire rounded-full transition-colors"
                      title="刪除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-ink-muted flex items-center gap-2">
                      <Globe size={10} /> 中文提示詞
                    </label>
                    <div className="p-4 bg-ink/[0.02] border border-ink/5 rounded-xl text-[11px] text-ink-muted line-clamp-3 whitespace-pre-wrap leading-relaxed">
                      {prompt.prompt_zh || <span className="italic text-fire/50">內容空白</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-ink-muted flex items-center gap-2">
                      <Globe size={10} /> 日文提示詞
                    </label>
                    <div className="p-4 bg-ink/[0.02] border border-ink/5 rounded-xl text-[11px] text-ink-muted line-clamp-3 whitespace-pre-wrap leading-relaxed">
                      {prompt.prompt_ja || <span className="italic text-fire/50">內容空白</span>}
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}

      {/* Sync Confirmation Modal */}
      <AnimatePresence>
        {showSyncConfirm && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSyncConfirm(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl space-y-8"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-wood/10 text-wood rounded-full">
                  <RefreshCw size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif">同步系統預設值</h3>
                  <p className="text-sm text-ink-muted">
                    請選擇同步方式。這將影響目前的「{reportType === 'daily' ? '內在校準' : '內在解憂'}」設定。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => handleSync('sync')}
                  className="flex items-start gap-4 p-4 rounded-2xl border border-ink/5 hover:bg-ink/[0.02] transition-all text-left group"
                >
                  <div className="p-2 bg-wood/10 text-wood rounded-lg group-hover:bg-wood group-hover:text-white transition-colors">
                    <RefreshCw size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">補足缺失內容</h4>
                    <p className="text-[11px] text-ink-muted mt-1">僅針對目前空白或缺少的區塊進行填補，不會覆蓋您已修改過的內容。</p>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    if(confirm("警告：這將刪除目前所有自訂內容並恢復為初始預設值，確定要繼續嗎？")) {
                      handleSync('reset');
                    }
                  }}
                  className="flex items-start gap-4 p-4 rounded-2xl border border-fire/10 hover:bg-fire/[0.02] transition-all text-left group"
                >
                  <div className="p-2 bg-fire/10 text-fire rounded-lg group-hover:bg-fire group-hover:text-white transition-colors">
                    <RotateCcw size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-fire">完全重置 (進階)</h4>
                    <p className="text-[11px] text-ink-muted mt-1">刪除此類別下的所有區塊，並重新匯入官方最原始的提示詞內容。</p>
                  </div>
                </button>
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={() => setShowSyncConfirm(false)}
                  className="text-[10px] uppercase tracking-widest text-ink-muted hover:text-ink transition-colors"
                >
                  取消返回
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingPrompt && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingPrompt(null)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-ink/5 flex justify-between items-center bg-ink/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-wood/10 text-wood rounded-lg">
                    <Settings size={18} />
                  </div>
                  <h3 className="text-sm font-serif">編輯 Prompt 區塊</h3>
                </div>
                <button onClick={() => setEditingPrompt(null)} className="p-2 hover:bg-ink/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold">區塊 Key (section_key)</label>
                    <input 
                      type="text"
                      value={editingPrompt.section_key || ''}
                      onChange={(e) => setEditingPrompt({ ...editingPrompt, section_key: e.target.value })}
                      className="w-full px-4 py-3 bg-ink/[0.02] border border-ink/5 rounded-xl text-sm focus:outline-none focus:border-wood/30"
                      placeholder="例如: system_instruction"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold">狀態</label>
                    <div className="flex items-center gap-4 h-[46px]">
                      <button 
                        onClick={() => setEditingPrompt({ ...editingPrompt, is_enabled: !editingPrompt.is_enabled })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all ${
                          editingPrompt.is_enabled ? 'bg-wood/10 text-wood border border-wood/20' : 'bg-ink/5 text-ink-muted border border-ink/10'
                        }`}
                      >
                        {editingPrompt.is_enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                        {editingPrompt.is_enabled ? '已啟用' : '已停用'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold">中文提示詞 (zh-TW)</label>
                  <textarea 
                    value={editingPrompt.prompt_zh || ''}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, prompt_zh: e.target.value })}
                    className="w-full h-48 px-4 py-3 bg-ink/[0.02] border border-ink/5 rounded-2xl text-sm focus:outline-none focus:border-wood/30 resize-none leading-relaxed font-mono"
                    placeholder="輸入繁體中文提示詞內容..."
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold">日文提示詞 (ja-JP)</label>
                  <textarea 
                    value={editingPrompt.prompt_ja || ''}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, prompt_ja: e.target.value })}
                    className="w-full h-48 px-4 py-3 bg-ink/[0.02] border border-ink/5 rounded-2xl text-sm focus:outline-none focus:border-wood/30 resize-none leading-relaxed font-mono"
                    placeholder="輸入日文提示詞內容..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-ink/5 bg-ink/[0.02] flex justify-end gap-4">
                <Button variant="outline" onClick={() => setEditingPrompt(null)} className="h-12 px-8 text-[10px] uppercase tracking-widest">
                  取消
                </Button>
                <Button onClick={handleSave} className="h-12 px-8 text-[10px] uppercase tracking-widest gap-2">
                  <Save size={14} /> 儲存設定
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Test Modal */}
      <AnimatePresence>
        {testingPrompt && (
          <PromptSandbox 
            prompt={testingPrompt} 
            onClose={() => setTestingPrompt(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
