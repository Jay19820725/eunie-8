import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, TranslationKey } from './translations';
import { useAuthContext } from '../store/AuthContext';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('zh');
  const [fontSettings, setFontSettings] = useState<any>(null);
  const { profile } = useAuthContext();

  useEffect(() => {
    // 1. Check user profile (synced)
    if (profile?.language && (profile.language === 'zh' || profile.language === 'ja')) {
      setLanguageState(profile.language as Language);
      return;
    }

    // 2. Check localStorage
    const savedLang = localStorage.getItem('user-language') as Language;
    if (savedLang && (savedLang === 'zh' || savedLang === 'ja')) {
      setLanguageState(savedLang);
    } else {
      // 3. Auto-detect from system
      const systemLang = navigator.language.toLowerCase();
      if (systemLang.startsWith('ja')) {
        setLanguageState('ja');
      } else if (systemLang.startsWith('zh')) {
        setLanguageState('zh');
      } else {
        // 4. Default to Chinese if not Chinese or Japanese
        setLanguageState('zh');
      }
    }

    // Fetch font settings
    const fetchFonts = async (retries = 3) => {
      try {
        const res = await fetch(`${window.location.origin}/api/settings/fonts`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setFontSettings(data);
      } catch (err: any) {
        if (retries > 0) {
          console.warn(`Retrying font fetch (${retries} retries left)...`, err.message);
          setTimeout(() => fetchFonts(retries - 1), 1000);
          return;
        }
        console.error('Failed to fetch font settings after retries:', err.name, err.message);
        // Fallback to defaults if fetch fails
        setFontSettings({
          zh: {
            display: { url: "https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@500;700&display=swap", family: "\"Noto Serif TC\", serif" },
            body: { url: "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500&display=swap", family: "\"Noto Sans TC\", sans-serif" }
          },
          ja: {
            display: { url: "https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&display=swap", family: "\"Shippori Mincho\", serif" },
            body: { url: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500&display=swap", family: "\"Noto Sans JP\", sans-serif" }
          }
        });
      }
    };
    fetchFonts();
  }, [profile?.language]);

  useEffect(() => {
    if (!fontSettings || !fontSettings[language]) return;

    const currentFonts = fontSettings[language];
    
    // 1. Update CSS Variables
    document.documentElement.style.setProperty('--font-display', currentFonts.display.family);
    document.documentElement.style.setProperty('--font-body', currentFonts.body.family);

    // 2. Inject Font Links if not already present
    const injectFont = (url: string, id: string) => {
      if (!url) return;
      let link = document.getElementById(id) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      if (link.href !== url) {
        link.href = url;
      }
    };

    injectFont(currentFonts.display.url, 'dynamic-font-display');
    injectFont(currentFonts.body.url, 'dynamic-font-body');
  }, [language, fontSettings]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('user-language', lang);
    
    // Sync to backend if logged in
    if (profile?.uid) {
      fetch(`/api/users/${profile.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang })
      }).catch(err => console.error("Error syncing language:", err));
    }
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations['zh'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
