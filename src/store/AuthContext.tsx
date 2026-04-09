import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { userService } from '../services/userService';
import { UserProfile } from '../core/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSubscribed: boolean;
  isPremium: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setProfile: (profile: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const refreshProfile = async () => {
    if (user) {
      try {
        const userProfile = await userService.getProfile(user.uid);
        setProfile(userProfile);
      } catch (error) {
        console.error("AuthContext: Failed to refresh profile:", error);
      }
    }
  };

  useEffect(() => {
    if (!auth || typeof auth.onAuthStateChanged !== 'function') {
      setLoading(false);
      return;
    }

    // 處理 signInWithRedirect 的回傳結果（LINE WebView 相容）
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        console.log("AuthContext: Redirect login successful:", result.user.email);
      }
    }).catch((error) => {
      if (error.code !== 'auth/no-auth-event') {
        console.error("AuthContext: Redirect result error:", error);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Start fetching profile but don't block the UI if we already have basic user info
        try {
          const userProfile = await userService.getOrCreateProfile(firebaseUser);
          setProfile(userProfile);
        } catch (error) {
          console.error("AuthContext: Failed to fetch profile:", error);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    if (isLoggingIn) {
      console.warn("AuthContext: Login already in progress...");
      return;
    }

    if (!auth || typeof auth.onAuthStateChanged !== 'function') {
      alert("Firebase 尚未配置，無法登入。");
      return;
    }

    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const ua = navigator.userAgent || '';
    // LINE 瀏覽器：Google 拒絕 WebView 中的 OAuth，必須在外部瀏覽器開啟
    const isLineBrowser = /Line\//i.test(ua);
    if (isLineBrowser) {
      const url = window.location.href;
      const sep = url.includes('?') ? '&' : '?';
      window.location.replace(`${url}${sep}openExternalBrowser=1`);
      setIsLoggingIn(false);
      return;
    }

    // 偵測其他 Android WebView，使用 redirect 避免 popup 被封鎖
    const isWebView = /LIFF|wv\b|Version\/[\d.]+ Chrome/.test(ua);

    try {
      console.log("AuthContext: Starting Google Login...", isWebView ? "(redirect)" : "(popup)");
      if (isWebView) {
        await signInWithRedirect(auth, provider);
        return; // redirect 會離開頁面，不需要後續處理
      }
      const result = await signInWithPopup(auth, provider);
      console.log("AuthContext: Login successful for:", result.user.email);
    } catch (error: any) {
      console.error("AuthContext: Login failed:", error);

      let errorMessage = "登入失敗，請稍後再試。";

      if (error.code === 'auth/popup-blocked') {
        // Popup 被封鎖時自動降級為 redirect
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch {
          errorMessage = "登入視窗被瀏覽器攔截，請嘗試用其他瀏覽器開啟。";
        }
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "登入視窗已被關閉。";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "此網域未經授權，請聯絡管理員將此網域加入 Firebase 授權清單。";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Google 登入功能未在 Firebase Console 中啟用。";
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.warn("AuthContext: Popup request was cancelled by a newer request.");
        return;
      }

      alert(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    if (!auth || typeof auth.onAuthStateChanged !== 'function') {
      setUser(null);
      setProfile(null);
      return;
    }
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      
      // Clear user-specific localStorage data
      localStorage.removeItem('eunie_report_history');
      localStorage.removeItem('eunie_pending_sync');
      localStorage.removeItem('lastSeenReportId');
      localStorage.removeItem('lastLoopStage');
      
    } catch (error) {
      console.error("AuthContext: Logout failed:", error);
    }
  };

  const isAdmin = profile?.role === 'admin';
  const isPremiumMember = profile?.role === 'premium_member';
  const isSubscribed = profile?.subscription_status === 'active';
  const isPremium = isAdmin || isPremiumMember || isSubscribed;

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin,
      isSubscribed,
      isPremium,
      login, 
      logout, 
      refreshProfile, 
      setProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
