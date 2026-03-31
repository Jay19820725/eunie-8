import React from 'react';
import { Share2, Image as ImageIcon } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { useQueryClient } from '@tanstack/react-query';

interface SocialSettingsProps {
  seo: any;
}

export const SocialSettings: React.FC<SocialSettingsProps> = ({ seo }) => {
  const queryClient = useQueryClient();

  return (
    <div className="space-y-8">
      <GlassCard className="p-8 space-y-6">
        <div className="flex items-center gap-3 text-fire">
          <Share2 size={18} />
          <h3 className="text-xs uppercase tracking-widest">社群分享設定 (OG)</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-ink-muted">預設分享圖 URL</label>
            <input
              type="text"
              value={seo.og_image || ''}
              onChange={(e) => queryClient.setQueryData(['admin', 'settings', 'seo'], { ...seo, og_image: e.target.value })}
              className="w-full px-4 py-3 bg-ink/[0.02] border border-ink/5 rounded-xl text-sm focus:outline-none focus:border-wood/30"
            />
          </div>

          <div className="aspect-[1.91/1] rounded-2xl overflow-hidden bg-ink/5 border border-ink/5">
            {seo.og_image ? (
              <img src={seo.og_image} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink/10">
                <ImageIcon size={48} />
              </div>
            )}
          </div>
          <p className="text-[8px] text-ink-muted text-center tracking-widest">建議尺寸: 1200 x 630 px</p>
        </div>
      </GlassCard>

      {/* LINE Preview Simulation */}
      <GlassCard className="p-8 space-y-6 bg-[#06C755]/5 border-[#06C755]/20">
        <div className="flex items-center gap-3 text-[#06C755]">
          <div className="w-5 h-5 bg-[#06C755] rounded-sm flex items-center justify-center text-white text-[10px] font-bold">L</div>
          <h3 className="text-xs uppercase tracking-widest">LINE 分享預覽模擬</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-ink/5 overflow-hidden max-w-[300px] mx-auto">
          <div className="aspect-[1.91/1] bg-ink/5 overflow-hidden">
            {seo.og_image && <img src={seo.og_image} className="w-full h-full object-cover" />}
          </div>
          <div className="p-3 space-y-1">
            <h4 className="text-[13px] font-bold text-ink line-clamp-1">{seo.title}</h4>
            <p className="text-[11px] text-ink-muted line-clamp-2 leading-tight">{seo.description}</p>
            <p className="text-[9px] text-ink-muted/60 pt-1">{typeof window !== 'undefined' ? new URL(window.location.href).hostname : ''}</p>
          </div>
        </div>
        <p className="text-[9px] text-ink-muted text-center leading-relaxed">
          * 此為模擬預覽，實際效果可能因 LINE 版本而異。<br/>
          更新後若無即時生效，請使用 LINE Page Picker Tool 清除快取。
        </p>
      </GlassCard>
    </div>
  );
};
