import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Disable console logs in production
if (import.meta.env.PROD) {
  const noop = () => {};
  // Save original console methods
  const originalConsole = { ...console };
  
  // Override console methods
  console.log = noop;
  console.info = noop;
  console.warn = noop;
  console.error = noop;
  
  // Keep debug and trace methods for potential critical debugging
  console.debug = originalConsole.debug;
  console.trace = originalConsole.trace;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
