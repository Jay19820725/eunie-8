import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { LoopStage, AnalysisReport } from '../core/types';

export function useUserOrchestrator() {
  const [loopStage, setLoopStage] = useState<LoopStage>('calibration');
  const [streak, setStreak] = useState(0);
  const [pendingReport, setPendingReport] = useState<AnalysisReport | null>(null);
  const { profile } = useAuth();

  // Fetch daily status and streak
  useEffect(() => {
    if (profile?.uid) {
      fetch(`/api/users/${profile.uid}/daily-status`)
        .then(res => res.json())
        .then(data => {
          setStreak(data.streak || 0);
          if (data.isCompletedToday) {
            setLoopStage('completed');
          } else {
            // If not completed today, use the synced loopStage from backend
            setLoopStage((data.loopStage as LoopStage) || 'calibration');
          }
        })
        .catch(err => console.error("Error fetching daily status:", err));
    } else {
      // Reset state on logout
      setStreak(0);
      setLoopStage('calibration');
    }
  }, [profile?.uid]);

  // Save loopStage to backend if logged in, else localStorage
  useEffect(() => {
    if (!loopStage) return;

    if (profile?.uid) {
      // Sync to backend
      fetch(`/api/users/${profile.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loop_stage: loopStage })
      }).catch(err => console.error("Error syncing loopStage:", err));
    } else {
      // Fallback to localStorage for guests
      localStorage.setItem('lastLoopStage', loopStage);
    }
  }, [loopStage, profile?.uid]);

  // Check for completed reports that haven't been seen
  const checkPendingReports = (currentPage: string) => {
    if (profile?.uid && currentPage !== 'report') {
      const controller = new AbortController();
      
      fetch(`/api/reports/${profile.uid}`, { signal: controller.signal })
        .then(res => {
          if (!res.ok) throw new Error(`Server responded with ${res.status}`);
          return res.json();
        })
        .then(data => {
          const reports = data.reports || [];
          if (Array.isArray(reports) && reports.length > 0) {
            const latest = reports[0];
            const lastSeenId = localStorage.getItem('lastSeenReportId');
            if (latest.id !== lastSeenId && latest.todayTheme) {
              setPendingReport(latest);
              if (currentPage === 'home') {
                setLoopStage('resonance');
              }
            }
          }
        })
        .catch(err => {
          if (err.name === 'AbortError') return;
          if (!err.message.includes('404') && !err.message.includes('401')) {
            console.error("Failed to fetch reports for return prompt:", err.message);
          }
        });
        
      return () => controller.abort();
    }
  };

  return {
    loopStage,
    setLoopStage,
    streak,
    setStreak,
    pendingReport,
    setPendingReport,
    checkPendingReports
  };
}
