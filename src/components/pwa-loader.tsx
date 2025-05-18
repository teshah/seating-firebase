"use client";

import { useEffect } from 'react';

const PwaLoader = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js') // Path to your service worker file in the public folder
        .then((registration) => {
          console.log('Service Worker registered successfully with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []); // Empty dependency array ensures this runs once on mount

  return null; // This component does not render any visible UI
};

export default PwaLoader;
