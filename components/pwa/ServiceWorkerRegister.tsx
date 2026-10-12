'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('One Cloud PWA service worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('One Cloud PWA service worker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
