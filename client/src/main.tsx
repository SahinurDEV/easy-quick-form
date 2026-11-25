import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { CookiesProvider } from 'react-cookie';
import { disableReactDevTools } from '@fvilers/disable-react-devtools';
import { GoogleOAuthProvider } from '@react-oauth/google';

import App from './App.tsx';
import AuthProvider from './contexts/AuthContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';

if (process.env.NODE_ENV === 'production') {
  disableReactDevTools();
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      networkMode: 'always',
      refetchOnReconnect: true,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <CookiesProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <App />
              <Toaster
                position="bottom-center"
                toastOptions={{
                  className: '!bg-card !text-foreground !border !border-border',
                }}
              />
              <ReactQueryDevtools />
            </QueryClientProvider>
          </AuthProvider>
        </CookiesProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
