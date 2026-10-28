import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import * as serviceWorkerRegistration from './utils/serviceWorkerRegistration';
import { Toaster } from 'react-hot-toast';

// Debug helpers (available in console)
if (import.meta.env.DEV) {
  import('./utils/authDebug').then(({ checkAuthStatus, testMessageAPI }) => {
    (window as any).checkAuth = checkAuthStatus;
    (window as any).testMessages = testMessageAPI;
    console.log('🛠️ Debug helpers loaded. Try: checkAuth() or testMessages()');
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" />
  </React.StrictMode>
);
// Unregister service worker to fix caching issues
serviceWorkerRegistration.unregister();
