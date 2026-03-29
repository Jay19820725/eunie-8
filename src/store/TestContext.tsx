import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ImageCard, WordCard, SelectedCards, AnalysisReport, CardPair } from '../core/types';
import { EnergyEngine } from '../core/engine';
import { auth } from '../lib/firebase';
import { performEunieDraw } from '../services/cardEngine';
import { generateAIAnalysis } from '../services/analysisService';
import { drawSession, updateSession } from '../services/sessionService';
import { useLanguage } from '../i18n/LanguageContext';

interface TestContextType {
  selectedCards: SelectedCards;
  setSelectedCards: React.Dispatch<React.SetStateAction<SelectedCards>>;
  currentStep: number;
  isCompleted: boolean;
  isDrawing: boolean;
  report: AnalysisReport | null;
  startDraw: () => Promise<void>;
  resetTest: () => void;
  setPairs: (pairs: CardPair[]) => void;
  setAssociations: (associations: { pair_id: string; text: string }[]) => void;
  generateReport: () => Promise<AnalysisReport | null>;
  setReport: (report: AnalysisReport | null) => void;
  reportType: 'daily' | 'wish';
  setReportType: (type: 'daily' | 'wish') => void;
  wishContext: { category: string; target: string; content: string } | null;
  setWishContext: (context: { category: string; target: string; content: string } | null) => void;
  historicalScores: Record<string, number> | null;
  userPoints: number;
  isFirstPurchase: boolean;
  fetchUserPoints: () => Promise<void>;
  isPurchaseModalOpen: boolean;
  setIsPurchaseModalOpen: (isOpen: boolean) => void;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCards, setSelectedCards] = useState<SelectedCards>({ images: [], words: [], drawnAt: 0 });
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [isFirstPurchase, setIsFirstPurchase] = useState<boolean>(true);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'daily' | 'wish'>('daily');
  const [wishContext, setWishContext] = useState<{ category: string; target: string; content: string } | null>(null);
  const [historicalScores, setHistoricalScores] = useState<Record<string, number> | null>(null);
  const { language } = useLanguage();

  const fetchHistoricalScores = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const res = await fetch(`/api/reports/history/${user.uid}?limit=10`);
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.length > 0) {
        const totals: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
        data.forEach((r: any) => {
          if (r.total_scores) {
            Object.keys(totals).forEach(k => {
              totals[k] += (r.total_scores[k] || 0);
            });
          }
        });
        Object.keys(totals).forEach(k => {
          totals[k] = Math.round(totals[k] / data.length);
        });
        setHistoricalScores(totals);
      }
    } catch (err) {
      console.error("Failed to fetch historical scores:", err);
    }
  }, []);

  const syncPendingReports = useCallback(async () => {
    const pendingIds = JSON.parse(localStorage.getItem('eunie_pending_sync') || '[]');
    if (pendingIds.length === 0) return;

    console.log(`Syncing ${pendingIds.length} pending reports...`);
    const history = JSON.parse(localStorage.getItem('eunie_report_history') || '[]');
    const user = auth.currentUser;
    const userId = user?.uid || null;

    for (const id of pendingIds) {
      const reportData = history.find((r: any) => r.id === id);
      if (!reportData) continue;

      try {
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: reportData.id,
            userId: userId,
            dominantElement: reportData.dominantElement,
            weakElement: reportData.weakElement,
            balanceScore: reportData.balanceScore,
            todayTheme: reportData.todayTheme,
            isAiComplete: reportData.isAiComplete,
            // All other fields
            interpretation: reportData.interpretation,
            pairInterpretations: reportData.pairInterpretations,
            cardInterpretation: reportData.cardInterpretation,
            psychologicalInsight: reportData.psychologicalInsight,
            fiveElementAnalysis: reportData.fiveElementAnalysis,
            reflection: reportData.reflection,
            actionSuggestion: reportData.actionSuggestion,
            soulMirror: reportData.soulMirror,
            destinyWhisper: reportData.destinyWhisper,
            transformationPath: reportData.transformationPath,
            healingRitual: reportData.healingRitual,
            plainSummary: reportData.plainSummary,
            manifestationGuidance: reportData.manifestationGuidance,
            energyObstacles: reportData.energyObstacles,
            multilingualContent: reportData.multilingualContent,
            selectedImageIds: reportData.selectedImageIds,
            selectedWordIds: reportData.selectedWordIds,
            totalScores: reportData.totalScores,
            pairs: reportData.pairs,
            reportType: reportData.reportType,
            wishContext: reportData.wishContext
          })
        });

        if (response.ok) {
          const pending = JSON.parse(localStorage.getItem('eunie_pending_sync') || '[]');
          localStorage.setItem('eunie_pending_sync', JSON.stringify(pending.filter((pid: string) => pid !== id)));
        }
      } catch (err) {
        console.error(`Failed to sync report ${id}:`, err);
      }
    }
  }, []);

  const fetchUserPoints = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const res = await fetch(`/api/users/${user.uid}/points`);
      const data = await res.json();
      setUserPoints(data.points || 0);
      setIsFirstPurchase(data.is_first_purchase !== false);
    } catch (err) {
      console.error("Failed to fetch user points:", err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserPoints();
        fetchHistoricalScores();
        syncPendingReports();
      } else {
        // Reset state on logout
        setUserPoints(0);
        setIsFirstPurchase(true);
        setReport(null);
        setSelectedCards({ images: [], words: [], drawnAt: 0 });
        setCurrentStep(0);
        setIsCompleted(false);
        setReportType('daily');
        setWishContext(null);
        setHistoricalScores(null);
      }
    });
    return () => unsubscribe();
  }, [fetchUserPoints, fetchHistoricalScores, syncPendingReports]);

  const startDraw = useCallback(async () => {
    setIsDrawing(true);
    try {
      const user = auth.currentUser;
      if (user) {
        // If user is logged in, use the new drawSession service to persist the draw
        const drawPromise = drawSession(user.uid, language);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("API timeout")), 8000)
        );

        try {
          const { sessionId, imageCards, wordCards } = await Promise.race([drawPromise, timeoutPromise]) as any;
          setSelectedCards({
            sessionId,
            images: imageCards,
            words: wordCards,
            drawnAt: Date.now()
          });
        } catch (err) {
          console.warn("API draw session failed or timed out, falling back to local draw:", err);
          const draw = await performEunieDraw(language);
          setSelectedCards(draw);
        }
      } else {
        // Fallback for guest users
        const draw = await performEunieDraw(language);
        setSelectedCards(draw);
      }
      setCurrentStep(1);
    } catch (error) {
      console.error("Draw failed:", error);
    } finally {
      setIsDrawing(false);
    }
  }, [language]);

  const setPairs = useCallback((pairs: CardPair[]) => {
    setSelectedCards(prev => ({ ...prev, pairs }));
  }, []);

  const setAssociations = useCallback((associations: { pair_id: string; text: string }[]) => {
    setSelectedCards(prev => {
      if (!prev.pairs) return prev;
      const updatedPairs = prev.pairs.map((pair, i) => ({
        ...pair,
        association: associations.find(a => a.pair_id === i.toString())?.text
      }));

      // Update API session if it exists
      if (prev.sessionId) {
        updateSession(prev.sessionId, updatedPairs).catch(err => {
          console.error("Failed to update session with associations:", err);
        });
      }

      return { ...prev, pairs: updatedPairs };
    });
  }, []);

  const resetTest = useCallback(() => {
    setSelectedCards({ images: [], words: [], drawnAt: 0 });
    setCurrentStep(0);
    setIsCompleted(false);
    setReport(null);
    setWishContext(null);
  }, []);

  const generateReport = useCallback(async (): Promise<AnalysisReport | null> => {
    if (selectedCards.images.length === 0 && selectedCards.words.length === 0) return null;
    
    const user = auth.currentUser;
    
    // Check points before generating AI report
    if (!user) {
      // Guest users must register to get points/analysis
      setIsPurchaseModalOpen(true);
      return null;
    }

    if (userPoints <= 0) {
      setIsPurchaseModalOpen(true);
      return null;
    }

    try {
      // Consume point
      const consumeRes = await fetch('/api/reports/consume-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });

      if (!consumeRes.ok) {
        setIsPurchaseModalOpen(true);
        return null;
      }

      // Refresh points after consumption
      fetchUserPoints();

      const analysis = EnergyEngine.analyze(selectedCards);
      const userId = user.uid;

      // 1. Create the initial report structure (Instant)
      const reportId = crypto.randomUUID();
      const initialReport: AnalysisReport = {
        id: reportId,
        timestamp: Date.now(),
        interpretation: "正在編織 AI 深度引導報告...",
        ...analysis,
        selectedImageIds: selectedCards.images.map(img => img.id),
        selectedWordIds: selectedCards.words.map(w => w.id),
        pairs: selectedCards.pairs,
        isGuest: !user,
        isAiComplete: false
      };

      // 2. Save to localStorage immediately (Local-First)
      const saveToLocal = (data: AnalysisReport) => {
        try {
          const history = JSON.parse(localStorage.getItem('eunie_report_history') || '[]');
          const filtered = history.filter((r: any) => r.id !== data.id);
          localStorage.setItem('eunie_report_history', JSON.stringify([data, ...filtered].slice(0, 50)));
          
          const pending = JSON.parse(localStorage.getItem('eunie_pending_sync') || '[]');
          const pendingFiltered = pending.filter((id: string) => id !== data.id);
          localStorage.setItem('eunie_pending_sync', JSON.stringify([data.id, ...pendingFiltered]));
        } catch (e) {
          console.error("LocalStorage save failed:", e);
        }
      };

      saveToLocal(initialReport);
      setReport(initialReport);
      setIsCompleted(true); // Trigger navigation to report page immediately

      // 3. Background AI Analysis & Cloud Sync (Non-blocking)
      const runBackgroundTasks = async () => {
        try {
          // Get AI Analysis
          const aiAnalysis = await generateAIAnalysis(
            selectedCards, 
            analysis.totalScores, 
            language,
            reportType,
            wishContext || undefined,
            historicalScores || undefined
          );
          
          const finalReport: AnalysisReport = {
            ...initialReport,
            ...aiAnalysis,
            reportType, // Store report type in report object
            wishContext,
            isAiComplete: true,
            multilingualContent: {
              ...initialReport.multilingualContent,
              [language === 'zh' ? 'zh-TW' : 'ja-JP']: {
                todayTheme: aiAnalysis.todayTheme || "",
                cardInterpretation: aiAnalysis.cardInterpretation || "",
                psychologicalInsight: aiAnalysis.psychologicalInsight || "",
                fiveElementAnalysis: aiAnalysis.fiveElementAnalysis || "",
                reflection: aiAnalysis.reflection || "",
                actionSuggestion: aiAnalysis.actionSuggestion || "",
                pairInterpretations: aiAnalysis.pairInterpretations || [],
                soulMirror: aiAnalysis.soulMirror,
                destinyWhisper: aiAnalysis.destinyWhisper,
                transformationPath: aiAnalysis.transformationPath,
                healingRitual: aiAnalysis.healingRitual,
                plainSummary: aiAnalysis.plainSummary,
              }
            } as any
          };

          // Update local state and storage
          setReport(finalReport);
          saveToLocal(finalReport);

          // Sync to Cloud
          const syncToCloud = async (data: AnalysisReport) => {
            try {
              const response = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: data.id,
                  userId: userId,
                  lang: language, // Added language tag
                  reportType: data.reportType,
                  wishContext: data.wishContext,
                  dominantElement: data.dominantElement,
                  weakElement: data.weakElement,
                  balanceScore: data.balanceScore,
                  todayTheme: data.todayTheme,
                  isAiComplete: data.isAiComplete,
                  interpretation: data.interpretation,
                  pairInterpretations: data.pairInterpretations,
                  cardInterpretation: data.cardInterpretation,
                  psychologicalInsight: data.psychologicalInsight,
                  fiveElementAnalysis: data.fiveElementAnalysis,
                  reflection: data.reflection,
                  actionSuggestion: data.actionSuggestion,
                  soulMirror: data.soulMirror,
                  destinyWhisper: data.destinyWhisper,
                  transformationPath: data.transformationPath,
                  healingRitual: data.healingRitual,
                  plainSummary: data.plainSummary,
                  manifestationGuidance: data.manifestationGuidance,
                  energyObstacles: data.energyObstacles,
                  multilingualContent: data.multilingualContent,
                  selectedImageIds: data.selectedImageIds,
                  selectedWordIds: data.selectedWordIds,
                  totalScores: data.totalScores,
                  pairs: data.pairs
                })
              });

              if (response.ok) {
                const pending = JSON.parse(localStorage.getItem('eunie_pending_sync') || '[]');
                localStorage.setItem('eunie_pending_sync', JSON.stringify(pending.filter((id: string) => id !== data.id)));
              }
            } catch (err) {
              console.error("Cloud sync network error:", err);
            }
          };

          await syncToCloud(finalReport);
        } catch (aiError) {
          console.error("Background AI Analysis failed:", aiError);
          // Ensure the user isn't stuck in "weaving" state even if AI fails
          setReport(prev => prev ? { ...prev, isAiComplete: true } : null);
        }
      };

      // Fire and forget background tasks
      runBackgroundTasks();

      return initialReport;
    } catch (error) {
      console.error("Report generation failed:", error);
      return null;
    }
  }, [selectedCards, language, userPoints, fetchUserPoints]);

  useEffect(() => {
    // Initial sync on mount
    syncPendingReports();
    return () => {};
  }, [syncPendingReports]);

  return (
    <TestContext.Provider value={{
      selectedCards,
      setSelectedCards,
      currentStep,
      isCompleted,
      isDrawing,
      report,
      startDraw,
      resetTest,
      setPairs,
      setAssociations,
      generateReport,
      setReport,
      reportType,
      setReportType,
      wishContext,
      setWishContext,
      historicalScores,
      userPoints,
      isFirstPurchase,
      fetchUserPoints,
      isPurchaseModalOpen,
      setIsPurchaseModalOpen
    }}>
      {children}
    </TestContext.Provider>
  );
};

export const useTest = () => {
  const context = useContext(TestContext);
  if (!context) throw new Error('useTest must be used within a TestProvider');
  return context;
};
