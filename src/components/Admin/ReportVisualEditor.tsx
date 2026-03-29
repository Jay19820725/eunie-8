import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layout, 
  Palette, 
  Type, 
  Sparkles, 
  BarChart3, 
  Eye, 
  Smartphone, 
  Monitor, 
  Save, 
  Send, 
  RotateCcw,
  Plus,
  GripVertical,
  Trash2,
  ChevronRight,
  ChevronDown,
  Languages,
  Settings,
  Wind,
  Cloud,
  Sun,
  Trees,
  Waves,
  CheckCircle2,
  X
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { ReportSettings, AtmosphereType, ChartType } from '../../core/types';
import { useAdminSettings, useSaveSettingsMutation } from '../../hooks/useAdminData';

interface ReportVisualEditorProps {
  onClose?: () => void;
}

const ATMOSPHERES: { id: AtmosphereType; name: string; icon: React.ReactNode; description: string }[] = [
  { id: 'ocean', name: 'Ocean', icon: <Waves className="text-blue-400" />, description: '深邃寧靜的海底氛圍' },
  { id: 'nebula', name: 'Nebula', icon: <Cloud className="text-purple-400" />, description: '神祕廣闊的星雲氛圍' },
  { id: 'komorebi', name: 'Komorebi', icon: <Sun className="text-amber-400" />, description: '溫暖明亮的林間漏光' },
  { id: 'forest', name: 'Forest', icon: <Trees className="text-emerald-400" />, description: '清新自然的森林氛圍' },
];

const CHART_TYPES: { id: ChartType; name: string }[] = [
  { id: 'radar', name: '雷達圖 (Radar)' },
  { id: 'bar', name: '柱狀圖 (Bar)' },
  { id: 'pie', name: '圓餅圖 (Pie)' },
  { id: 'energy_trend', name: '能量趨勢圖 (Energy Trend)' },
];

export const ReportVisualEditor: React.FC<ReportVisualEditorProps> = ({ onClose }) => {
  const [reportType, setReportType] = useState<'daily' | 'wish'>('daily');
  const { data: liveSettings, isLoading: liveLoading } = useAdminSettings(`report_${reportType}`);
  const { data: draftSettings, isLoading: draftLoading } = useAdminSettings(`report_${reportType}_draft`);
  const saveSettingsMutation = useSaveSettingsMutation();

  const [settings, setSettings] = useState<ReportSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'layout' | 'styles' | 'prompts' | 'charts'>('layout');
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [previewLang, setPreviewLang] = useState<'zh' | 'ja'>('zh');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (draftSettings) {
      setSettings(draftSettings);
    } else if (liveSettings) {
      setSettings(liveSettings);
    } else {
      // Default settings if none exist
      setSettings({
        layout: [
          { id: 'header', type: 'header', enabled: true, order: 0 },
          { id: 'energy_chart', type: 'chart', enabled: true, order: 1 },
          { id: 'ai_analysis', type: 'content', enabled: true, order: 2 },
          { id: 'card_details', type: 'content', enabled: true, order: 3 },
          { id: 'paywall', type: 'paywall', enabled: true, order: 4 },
        ],
        styles: {
          glassmorphism: 60,
          primaryColor: '#8BA889',
          secondaryColor: '#D98B73',
          fontFamily: 'serif',
        },
        atmosphere: reportType === 'daily' ? 'forest' : 'nebula',
        prompts: {
          zh: {
            tone: reportType === 'daily' ? '客觀、專業' : '溫暖、啟發、具備同理心',
            style: reportType === 'daily' ? '分析型' : '療癒型',
            systemInstruction: reportType === 'daily' ? '你是一位專業的能量分析師...' : '你是一位溫暖的心靈導師...',
          },
          ja: {
            tone: reportType === 'daily' ? '客観的、専門的' : '温かく、啓発的、共感的',
            style: reportType === 'daily' ? '分析的' : 'ヒーリング',
            systemInstruction: reportType === 'daily' ? 'あなたは専門的なエネルギーアナリストです...' : 'あなたは温かい心のメンターです...',
          },
        },
        charts: ['radar', 'energy_trend'],
        isPublished: false,
        updatedAt: new Date().toISOString(),
      });
    }
    setIsDirty(false);
  }, [liveSettings, draftSettings, reportType]);

  const handleSaveDraft = async () => {
    if (!settings) return;
    try {
      await saveSettingsMutation.mutateAsync({ 
        key: `report_${reportType}_draft`, 
        value: { ...settings, updatedAt: new Date().toISOString(), isPublished: false } 
      });
      setIsDirty(false);
      alert('草稿已儲存');
    } catch (error) {
      alert('儲存失敗');
    }
  };

  const handlePublish = async () => {
    if (!settings) return;
    if (!confirm(`確定要發布目前的「${reportType === 'daily' ? '能量檢測' : '煩惱解惑'}」設定到正式環境嗎？`)) return;
    try {
      const updatedSettings = { ...settings, updatedAt: new Date().toISOString(), isPublished: true };
      await Promise.all([
        saveSettingsMutation.mutateAsync({ key: `report_${reportType}`, value: updatedSettings }),
        saveSettingsMutation.mutateAsync({ key: `report_${reportType}_draft`, value: updatedSettings }),
      ]);
      setIsDirty(false);
      alert('已成功發布');
    } catch (error) {
      alert('發布失敗');
    }
  };

  const updateSettings = (newSettings: Partial<ReportSettings>) => {
    setSettings(prev => prev ? { ...prev, ...newSettings } : null);
    setIsDirty(true);
  };

  if (liveLoading || draftLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wood"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-stone-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-stone-200">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-medium uppercase tracking-widest text-stone-600">報告頁面視覺編輯器</h2>
            {isDirty && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-full uppercase tracking-widest">未儲存</span>
            )}
          </div>
          
          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button 
              onClick={() => {
                if (isDirty && !confirm('切換類型將遺失未儲存的更改，確定嗎？')) return;
                setReportType('daily');
              }}
              className={`px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest transition-all ${reportType === 'daily' ? 'bg-white shadow-sm text-wood' : 'text-stone-400'}`}
            >
              能量檢測
            </button>
            <button 
              onClick={() => {
                if (isDirty && !confirm('切換類型將遺失未儲存的更改，確定嗎？')) return;
                setReportType('wish');
              }}
              className={`px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest transition-all ${reportType === 'wish' ? 'bg-white shadow-sm text-wood' : 'text-stone-400'}`}
            >
              煩惱解惑
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleSaveDraft}
            className="h-9 px-4 text-[10px] uppercase tracking-widest gap-2"
          >
            <Save size={14} /> 儲存草稿
          </Button>
          <Button 
            onClick={handlePublish}
            className="h-9 px-4 text-[10px] uppercase tracking-widest gap-2 bg-wood text-white"
          >
            <Send size={14} /> 發布正式版
          </Button>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Controls */}
        <div className="w-80 bg-white border-r border-stone-200 flex flex-col">
          <div className="flex border-b border-stone-100">
            <button 
              onClick={() => setActiveTab('layout')}
              className={`flex-1 py-4 text-[10px] uppercase tracking-widest transition-colors ${activeTab === 'layout' ? 'text-wood border-b-2 border-wood' : 'text-stone-400 hover:text-stone-600'}`}
            >
              佈局
            </button>
            <button 
              onClick={() => setActiveTab('styles')}
              className={`flex-1 py-4 text-[10px] uppercase tracking-widest transition-colors ${activeTab === 'styles' ? 'text-wood border-b-2 border-wood' : 'text-stone-400 hover:text-stone-600'}`}
            >
              樣式
            </button>
            <button 
              onClick={() => setActiveTab('prompts')}
              className={`flex-1 py-4 text-[10px] uppercase tracking-widest transition-colors ${activeTab === 'prompts' ? 'text-wood border-b-2 border-wood' : 'text-stone-400 hover:text-stone-600'}`}
            >
              AI
            </button>
            <button 
              onClick={() => setActiveTab('charts')}
              className={`flex-1 py-4 text-[10px] uppercase tracking-widest transition-colors ${activeTab === 'charts' ? 'text-wood border-b-2 border-wood' : 'text-stone-400 hover:text-stone-600'}`}
            >
              圖表
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === 'layout' && (
                <motion.div
                  key="layout"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">模組排序與開關</h3>
                    <div className="space-y-2">
                      {settings.layout.sort((a, b) => a.order - b.order).map((module, index) => (
                        <div key={module.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100 group">
                          <GripVertical size={14} className="text-stone-300 cursor-grab active:cursor-grabbing" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-stone-700">{module.id}</p>
                            <p className="text-[10px] text-stone-400 uppercase tracking-widest">{module.type}</p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={module.enabled}
                            onChange={(e) => {
                              const newLayout = [...settings.layout];
                              const idx = newLayout.findIndex(m => m.id === module.id);
                              newLayout[idx].enabled = e.target.checked;
                              updateSettings({ layout: newLayout });
                            }}
                            className="rounded border-stone-200 text-wood focus:ring-wood"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'styles' && (
                <motion.div
                  key="styles"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">氛圍選擇</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {ATMOSPHERES.map((atm) => (
                        <button
                          key={atm.id}
                          onClick={() => updateSettings({ atmosphere: atm.id })}
                          className={`p-4 rounded-2xl border transition-all text-left space-y-2 ${settings.atmosphere === atm.id ? 'border-wood bg-wood/5 ring-1 ring-wood/20' : 'border-stone-100 bg-stone-50 hover:border-stone-200'}`}
                        >
                          <div className="flex justify-between items-start">
                            {atm.icon}
                            {settings.atmosphere === atm.id && <CheckCircle2 size={12} className="text-wood" />}
                          </div>
                          <p className="text-xs font-medium text-stone-700">{atm.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">視覺參數</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <label className="text-[10px] uppercase tracking-widest text-stone-500">毛玻璃強度</label>
                        <span className="text-[10px] font-mono text-stone-400">{settings.styles.glassmorphism}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={settings.styles.glassmorphism}
                        onChange={(e) => updateSettings({ styles: { ...settings.styles, glassmorphism: parseInt(e.target.value) } })}
                        className="w-full accent-wood"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest text-stone-500">主色調</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={settings.styles.primaryColor}
                          onChange={(e) => updateSettings({ styles: { ...settings.styles, primaryColor: e.target.value } })}
                          className="w-10 h-10 rounded-lg overflow-hidden border-none cursor-pointer"
                        />
                        <input 
                          type="text" 
                          value={settings.styles.primaryColor}
                          onChange={(e) => updateSettings({ styles: { ...settings.styles, primaryColor: e.target.value } })}
                          className="flex-1 bg-stone-50 border border-stone-100 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-wood/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest text-stone-500">字體風格</label>
                      <select 
                        value={settings.styles.fontFamily}
                        onChange={(e) => updateSettings({ styles: { ...settings.styles, fontFamily: e.target.value as any } })}
                        className="w-full bg-stone-50 border border-stone-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-wood/30"
                      >
                        <option value="serif">優雅襯線體 (Serif)</option>
                        <option value="sans">簡潔無襯線體 (Sans)</option>
                        <option value="mono">技術等寬體 (Mono)</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'prompts' && (
                <motion.div
                  key="prompts"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  <div className="flex bg-stone-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setPreviewLang('zh')}
                      className={`flex-1 py-2 rounded-lg text-[10px] uppercase tracking-widest transition-all ${previewLang === 'zh' ? 'bg-white shadow-sm text-wood' : 'text-stone-400'}`}
                    >
                      中文
                    </button>
                    <button 
                      onClick={() => setPreviewLang('ja')}
                      className={`flex-1 py-2 rounded-lg text-[10px] uppercase tracking-widest transition-all ${previewLang === 'ja' ? 'bg-white shadow-sm text-wood' : 'text-stone-400'}`}
                    >
                      日文
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest text-stone-500">語氣 (Tone)</label>
                      <input 
                        type="text" 
                        value={settings.prompts[previewLang].tone}
                        onChange={(e) => {
                          const newPrompts = { ...settings.prompts };
                          newPrompts[previewLang].tone = e.target.value;
                          updateSettings({ prompts: newPrompts });
                        }}
                        className="w-full bg-stone-50 border border-stone-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-wood/30"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest text-stone-500">風格 (Style)</label>
                      <input 
                        type="text" 
                        value={settings.prompts[previewLang].style}
                        onChange={(e) => {
                          const newPrompts = { ...settings.prompts };
                          newPrompts[previewLang].style = e.target.value;
                          updateSettings({ prompts: newPrompts });
                        }}
                        className="w-full bg-stone-50 border border-stone-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-wood/30"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest text-stone-500">系統指令 (System Instruction)</label>
                      <textarea 
                        rows={8}
                        value={settings.prompts[previewLang].systemInstruction}
                        onChange={(e) => {
                          const newPrompts = { ...settings.prompts };
                          newPrompts[previewLang].systemInstruction = e.target.value;
                          updateSettings({ prompts: newPrompts });
                        }}
                        className="w-full bg-stone-50 border border-stone-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-wood/30 resize-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'charts' && (
                <motion.div
                  key="charts"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">啟用的圖表類型</h3>
                  <div className="space-y-3">
                    {CHART_TYPES.map((chart) => (
                      <label key={chart.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100 cursor-pointer hover:bg-stone-100 transition-colors">
                        <span className="text-xs text-stone-700">{chart.name}</span>
                        <input 
                          type="checkbox" 
                          checked={settings.charts.includes(chart.id)}
                          onChange={(e) => {
                            let newCharts = [...settings.charts];
                            if (e.target.checked) {
                              newCharts.push(chart.id);
                            } else {
                              newCharts = newCharts.filter(id => id !== chart.id);
                            }
                            updateSettings({ charts: newCharts });
                          }}
                          className="rounded border-stone-200 text-wood focus:ring-wood"
                        />
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Main Content - Preview */}
        <div className="flex-1 bg-stone-100 flex flex-col overflow-hidden">
          {/* Preview Toolbar */}
          <div className="flex items-center justify-between px-8 py-4 bg-white/50 backdrop-blur-md border-b border-stone-200">
            <div className="flex items-center gap-4">
              <div className="flex bg-stone-200/50 p-1 rounded-lg">
                <button 
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded-md transition-all ${previewMode === 'mobile' ? 'bg-white shadow-sm text-wood' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  <Smartphone size={16} />
                </button>
                <button 
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded-md transition-all ${previewMode === 'desktop' ? 'bg-white shadow-sm text-wood' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  <Monitor size={16} />
                </button>
              </div>
              <div className="h-4 w-px bg-stone-300" />
              <div className="flex items-center gap-2">
                <Languages size={14} className="text-stone-400" />
                <select 
                  value={previewLang}
                  onChange={(e) => setPreviewLang(e.target.value as 'zh' | 'ja')}
                  className="bg-transparent text-[10px] uppercase tracking-widest text-stone-600 focus:outline-none"
                >
                  <option value="zh">中文預覽</option>
                  <option value="ja">日文預覽</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-400">
              <Eye size={14} /> 即時預覽模式
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 overflow-y-auto p-12 flex justify-center custom-scrollbar">
            <div 
              className={`transition-all duration-500 shadow-2xl rounded-[32px] overflow-hidden bg-white relative ${previewMode === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full max-w-5xl aspect-video'}`}
              style={{
                '--primary': settings.styles.primaryColor,
                '--secondary': settings.styles.secondaryColor,
                fontFamily: settings.styles.fontFamily === 'serif' ? 'Georgia, serif' : settings.styles.fontFamily === 'mono' ? 'monospace' : 'sans-serif'
              } as any}
            >
              {/* Mock Report Content */}
              <div className={`absolute inset-0 overflow-y-auto custom-scrollbar p-8 space-y-8 atmosphere-${settings.atmosphere}`}>
                {/* Background Atmosphere Mockup */}
                <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
                  {settings.atmosphere === 'ocean' && <div className="w-full h-full bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900" />}
                  {settings.atmosphere === 'nebula' && <div className="w-full h-full bg-gradient-to-br from-purple-900 via-fuchsia-900 to-blue-900" />}
                  {settings.atmosphere === 'komorebi' && <div className="w-full h-full bg-gradient-to-tr from-amber-100 via-orange-50 to-emerald-50" />}
                  {settings.atmosphere === 'forest' && <div className="w-full h-full bg-gradient-to-b from-emerald-900 via-green-800 to-stone-900" />}
                </div>

                {settings.layout.filter(m => m.enabled).sort((a, b) => a.order - b.order).map((module) => (
                  <div key={module.id} className="relative">
                    {module.type === 'header' && (
                      <div className="text-center space-y-4 py-8">
                        <h1 className="text-3xl font-serif tracking-tight" style={{ color: settings.styles.primaryColor }}>
                          {reportType === 'daily' 
                            ? (previewLang === 'zh' ? '能量分析報告' : 'エネルギー分析レポート')
                            : (previewLang === 'zh' ? '心靈解惑報告' : '心の悩み解決レポート')}
                        </h1>
                        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                          {reportType === 'daily'
                            ? (previewLang === 'zh' ? '探索你的內在光芒' : 'あなたの内なる輝きを探る')
                            : (previewLang === 'zh' ? '為你的困擾尋找出口' : 'あなたの悩みの出口を見つける')}
                        </p>
                      </div>
                    )}

                    {module.type === 'chart' && (
                      <div 
                        className="aspect-square rounded-3xl border border-white/20 shadow-lg flex items-center justify-center"
                        style={{ backgroundColor: `rgba(255,255,255,${settings.styles.glassmorphism / 100})`, backdropFilter: 'blur(20px)' }}
                      >
                        <div className="text-center space-y-2">
                          <BarChart3 size={48} className="mx-auto opacity-20" style={{ color: settings.styles.primaryColor }} />
                          <p className="text-[10px] uppercase tracking-widest text-stone-400">
                            {CHART_TYPES.find(c => c.id === settings.charts[0])?.name || '圖表區域'}
                          </p>
                        </div>
                      </div>
                    )}

                    {module.type === 'content' && (
                      <div 
                        className="p-6 rounded-3xl border border-white/20 shadow-lg space-y-4"
                        style={{ backgroundColor: `rgba(255,255,255,${settings.styles.glassmorphism / 100})`, backdropFilter: 'blur(20px)' }}
                      >
                        <h4 className="text-xs uppercase tracking-widest font-medium" style={{ color: settings.styles.secondaryColor }}>
                          {module.id === 'ai_analysis' 
                            ? (reportType === 'daily' 
                                ? (previewLang === 'zh' ? 'AI 能量深度解析' : 'AI エネルギー深層解析')
                                : (previewLang === 'zh' ? 'AI 心靈解惑指引' : 'AI 心の悩み解決ガイダンス'))
                            : (previewLang === 'zh' ? '卡片細節' : 'カードの詳細')}
                        </h4>
                        <p className="text-sm leading-relaxed text-stone-600">
                          {reportType === 'daily'
                            ? (previewLang === 'zh' 
                                ? '根據你的能量流動，目前正處於一個轉型期。木元素展現出強大的生命力，而火元素則提醒你需要適度的休息與內省...' 
                                : 'あなたのエネルギーの流れに基づくと、現在は変革期にあります。木のエレメントは強力な生命力を示し、火のエレメントは適度な休息と内省の必要性を思い出させます...')
                            : (previewLang === 'zh'
                                ? '關於你所提到的「職涯迷茫」，卡片顯示你正處於蓄勢待發的狀態。不要急於做出決定，先聽從內心的聲音...'
                                : 'あなたが言及した「キャリアの迷い」について、カードはあなたが準備万端の状態にあることを示しています。急いで決断を下さず、まずは心の声に耳を傾けてください...')}
                        </p>
                      </div>
                    )}

                    {module.type === 'paywall' && (
                      <div className="relative py-12 text-center space-y-6">
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent -z-10" />
                        <Sparkles className="mx-auto text-amber-400" />
                        <h3 className="text-xl font-serif">
                          {previewLang === 'zh' ? '解鎖完整深度報告' : '完全な詳細レポートをアンロック'}
                        </h3>
                        <Button className="w-full h-14 rounded-2xl bg-stone-900 text-white text-xs uppercase tracking-widest">
                          {previewLang === 'zh' ? '立即訂閱' : '今すぐ購読'}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportVisualEditor;
