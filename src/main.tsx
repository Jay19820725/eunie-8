import React, { StrictMode, Component } from 'react';
import {createRoot} from 'react-dom/client';

import App from './App.tsx';
import './index.css';
import { AuthProvider } from './store/AuthContext';
import { TestProvider } from './store/TestContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#faf8f5', color: '#6b5c4a', fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center'
        }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>EUNIE 暫時無法載入</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.6rem 1.4rem', borderRadius: '9999px',
              border: '1px solid #c4a882', background: 'transparent',
              color: '#6b5c4a', cursor: 'pointer', fontSize: '0.9rem'
            }}
          >
            重新整理
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <TestProvider>
              <App />
            </TestProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
