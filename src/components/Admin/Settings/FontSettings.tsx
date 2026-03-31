import React from 'react';
import { Type as TypeIcon } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { useQueryClient } from '@tanstack/react-query';

interface FontSettingsProps {
  fonts: any;
}

export const FontSettings: React.FC<FontSettingsProps> = ({ fonts }) => {
  const queryClient = useQueryClient();

  return (
    <GlassCard className="p-8 space-y-6">
      <div className="flex items-center gap-3 text-indigo-500">
        <TypeIcon size={18} />
        <h3 className="text-xs uppercase tracking-widest">多語系字型管理</h3>
      </div>

      <div className="space-y-8">
        {['zh', 'ja'].map((lang) => (
          <div key={lang} className="space-y-4 p-4 bg-ink/[0.02] rounded-2xl border border-ink/5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-ink/5 px-2 py-1 rounded">
                {lang === 'zh' ? '繁體中文 (zh)' : '日本語 (ja)'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-ink-muted">標題字型 (Display Font)</label>
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="text"
                    placeholder="字型網址 (Google Fonts URL)"
                    value={fonts[lang].display.url || ''}
                    onChange={(e) => {
                      const newFonts = { ...fonts };
                      newFonts[lang].display.url = e.target.value;
                      queryClient.setQueryData(['admin', 'settings', 'fonts'], newFonts);
                    }}
                    className="w-full px-3 py-2 bg-white border border-ink/5 rounded-lg text-xs focus:outline-none focus:border-wood/30"
                  />
                  <input
                    type="text"
                    placeholder="CSS Family Name (e.g. 'Noto Serif TC', serif)"
                    value={fonts[lang].display.family || ''}
                    onChange={(e) => {
                      const newFonts = { ...fonts };
                      newFonts[lang].display.family = e.target.value;
                      queryClient.setQueryData(['admin', 'settings', 'fonts'], newFonts);
                    }}
                    className="w-full px-3 py-2 bg-white border border-ink/5 rounded-lg text-xs focus:outline-none focus:border-wood/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-ink-muted">內文字型 (Body Font)</label>
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="text"
                    placeholder="字型網址 (Google Fonts URL)"
                    value={fonts[lang].body.url || ''}
                    onChange={(e) => {
                      const newFonts = { ...fonts };
                      newFonts[lang].body.url = e.target.value;
                      queryClient.setQueryData(['admin', 'settings', 'fonts'], newFonts);
                    }}
                    className="w-full px-3 py-2 bg-white border border-ink/5 rounded-lg text-xs focus:outline-none focus:border-wood/30"
                  />
                  <input
                    type="text"
                    placeholder="CSS Family Name (e.g. 'Noto Sans TC', sans-serif)"
                    value={fonts[lang].body.family || ''}
                    onChange={(e) => {
                      const newFonts = { ...fonts };
                      newFonts[lang].body.family = e.target.value;
                      queryClient.setQueryData(['admin', 'settings', 'fonts'], newFonts);
                    }}
                    className="w-full px-3 py-2 bg-white border border-ink/5 rounded-lg text-xs focus:outline-none focus:border-wood/30"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
