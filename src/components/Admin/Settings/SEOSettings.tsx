import React from 'react';
import { Globe } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { useQueryClient } from '@tanstack/react-query';

interface SEOSettingsProps {
  seo: any;
}

export const SEOSettings: React.FC<SEOSettingsProps> = ({ seo }) => {
  const queryClient = useQueryClient();

  return (
    <GlassCard className="p-8 space-y-6">
      <div className="flex items-center gap-3 text-wood">
        <Globe size={18} />
        <h3 className="text-xs uppercase tracking-widest">基礎 SEO 設定</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-ink-muted">網站標題 (Title)</label>
          <input
            type="text"
            value={seo.title || ''}
            onChange={(e) => queryClient.setQueryData(['admin', 'settings', 'seo'], { ...seo, title: e.target.value })}
            className="w-full px-4 py-3 bg-ink/[0.02] border border-ink/5 rounded-xl text-sm focus:outline-none focus:border-wood/30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-ink-muted">網站描述 (Description)</label>
          <textarea
            value={seo.description || ''}
            onChange={(e) => queryClient.setQueryData(['admin', 'settings', 'seo'], { ...seo, description: e.target.value })}
            className="w-full h-32 px-4 py-3 bg-ink/[0.02] border border-ink/5 rounded-xl text-sm focus:outline-none focus:border-wood/30 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-ink-muted">關鍵字 (Keywords)</label>
          <input
            type="text"
            value={seo.keywords || ''}
            onChange={(e) => queryClient.setQueryData(['admin', 'settings', 'seo'], { ...seo, keywords: e.target.value })}
            className="w-full px-4 py-3 bg-ink/[0.02] border border-ink/5 rounded-xl text-sm focus:outline-none focus:border-wood/30"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-ink/[0.02] rounded-xl border border-ink/5">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-medium">搜尋引擎索引</p>
            <p className="text-[8px] text-ink-muted tracking-widest mt-1">開啟後 Google 才能搜尋到網站</p>
          </div>
          <button
            onClick={() => queryClient.setQueryData(['admin', 'settings', 'seo'], { ...seo, index_enabled: !seo.index_enabled })}
            className={`w-10 h-5 rounded-full relative transition-colors ${seo.index_enabled ? 'bg-wood' : 'bg-ink/10'}`}
          >
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${seo.index_enabled ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </div>
    </GlassCard>
  );
};
