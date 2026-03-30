import React from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useAdminSettings, useSaveSettingsMutation } from '../../../hooks/useAdminData';
import { SEOSettings } from './SEOSettings';
import { SocialSettings } from './SocialSettings';
import { FontSettings } from './FontSettings';
import { AnalyticsSettings } from './AnalyticsSettings';

export const SettingsManager: React.FC = () => {
  const { data: seoSettings, isLoading: seoLoading } = useAdminSettings('seo');
  const { data: fontSettings, isLoading: fontsLoading } = useAdminSettings('fonts');
  const saveSettingsMutation = useSaveSettingsMutation();

  const seo = seoSettings || {
    title: "EUNIE 嶼妳 | 懂妳的能量，平衡妳的生活",
    description: "透過五行能量卡片，探索內在自我，獲得每日心靈指引與能量平衡。",
    keywords: "能量卡片, 五行, 心靈導引, 冥想, 自我探索",
    og_image: "https://picsum.photos/seed/lumina-og/1200/630",
    google_analytics_id: "",
    search_console_id: "",
    index_enabled: true
  };

  const fonts = fontSettings || {
    zh: {
      display: { url: "https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@500;700&display=swap", family: "\"Noto Serif TC\", serif" },
      body: { url: "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500&display=swap", family: "\"Noto Sans TC\", sans-serif" }
    },
    ja: {
      display: { url: "https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&display=swap", family: "\"Shippori Mincho\", serif" },
      body: { url: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500&display=swap", family: "\"Noto Sans JP\", sans-serif" }
    }
  };

  const handleSaveAllSettings = async () => {
    try {
      await Promise.all([
        saveSettingsMutation.mutateAsync({ key: 'seo', value: seo }),
        saveSettingsMutation.mutateAsync({ key: 'fonts', value: fonts })
      ]);
      alert('設定已儲存');
    } catch (error) {
      console.error("儲存設定失敗:", error);
      alert('儲存失敗');
    }
  };

  if (seoLoading || fontsLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-pulse-soft text-[10px] tracking-[0.4em] text-ink-muted uppercase">設定讀取中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xs uppercase tracking-[0.3em] font-medium">系統全站設定</h3>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleSaveAllSettings}
            disabled={saveSettingsMutation.isPending}
            className="gap-2 h-10 px-6"
          >
            {saveSettingsMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            儲存所有設定
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SEOSettings seo={seo} />
        <SocialSettings seo={seo} />
        <FontSettings fonts={fonts} />
        <AnalyticsSettings seo={seo} />
      </div>
    </div>
  );
};
