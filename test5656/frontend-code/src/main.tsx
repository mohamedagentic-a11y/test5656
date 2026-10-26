import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { LanguageProvider } from './i18n/LanguageContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Cannot mount React application.');
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);