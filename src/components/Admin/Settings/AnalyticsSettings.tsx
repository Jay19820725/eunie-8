import React from 'react';
import { BarChart3 } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { useQueryClient } from '@tanstack/react-query';

interface AnalyticsSettingsProps {
  seo: any;
}

export const AnalyticsSettings: React.FC<AnalyticsSettingsProps> = ({ seo }) => {
  const queryClient = useQueryClient();

  return (
    <GlassCard className="p-8 space-y-6 lg:col-span-2">
      <div className="flex items-center gap-3 text-water">
        <BarChart3 size={18} />
        <h3 className="text-xs uppercase tracking-widest">追蹤與驗證</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-ink-muted">Google Analytics ID (GA4)</label>
          <input
            type="text"
            placeholder="G-XXXXXXXXXX"
            value={seo.google_analytics_id || ''}
            onChange={(e) => queryClient.setQueryData(['admin', 'settings', 'seo'], { ...seo, google_analytics_id: e.target.value })}
            className="w-full px-4 py-3 bg-ink/[0.02] border border-ink/5 rounded-xl text-sm focus:outline-none focus:border-wood/30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-ink-muted">Search Console 驗證碼</label>
          <input
            type="text"
            placeholder="驗證碼內容"
            value={seo.search_console_id || ''}
            onChange={(e) => queryClient.setQueryData(['admin', 'settings', 'seo'], { ...seo, search_console_id: e.target.value })}
            className="w-full px-4 py-3 bg-ink/[0.02] border border-ink/5 rounded-xl text-sm focus:outline-none focus:border-wood/30"
          />
        </div>
      </div>
    </GlassCard>
  );
};
