// Suppress benign Vite WebSocket connection errors that are expected in the sandboxed dev environment.
if (typeof window !== 'undefined') {
  // 1. Filter benign WebSocket logs and errors
  const isBenignWebsocketError = (err: any): boolean => {
    if (!err) return false;
    let message = '';
    if (typeof err === 'string') {
      message = err;
    } else {
      message = (err.message || err.reason || err.description || err.name || '').toString();
    }
    const isBenign = (
      /websocket/i.test(message) ||
      /web-socket/i.test(message) ||
      /socket/i.test(message) ||
      /closed without opened/i.test(message) ||
      message.includes('WebSocket') ||
      message.includes('WebSocket closed')
    );
    if (isBenign) return true;
    
    try {
      const str = JSON.stringify(err);
      if (str && (/websocket/i.test(str) || /web-socket/i.test(str) || /socket/i.test(str) || str.includes('closed without opened'))) {
        return true;
      }
    } catch (_) {}
    return false;
  };

  // 2. Intercept console.error and console.warn to block websocket noise
  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    const isBenign = args.some(arg => {
      if (!arg) return false;
      const str = typeof arg === 'string' ? arg : (arg.message || arg.stack || arg.toString || '').toString();
      return isBenignWebsocketError(str);
    });
    if (isBenign) return;
    originalConsoleError.apply(console, args);
  };

  const originalConsoleWarn = console.warn;
  console.warn = function (...args: any[]) {
    const isBenign = args.some(arg => {
      if (!arg) return false;
      const str = typeof arg === 'string' ? arg : (arg.message || arg.stack || arg.toString || '').toString();
      return isBenignWebsocketError(str);
    });
    if (isBenign) return;
    originalConsoleWarn.apply(console, args);
  };

  // 3. Intercept WebSocket constructor to gracefully bypass Vite HMR connections
  const OriginalWebSocket = window.WebSocket;
  if (OriginalWebSocket) {
    const CustomWebSocket = function (this: any, url: string, protocols?: string | string[]) {
      const isViteSocket = 
        protocols === 'vite-hmr' || 
        /vite/i.test(url) || 
        /hmr/i.test(url) ||
        (typeof protocols === 'string' && protocols.includes('vite')) ||
        (Array.isArray(protocols) && protocols.includes('vite-hmr'));
        
      if (isViteSocket) {
        // Create a dummy WebSocket-like object that behaves benignly
        const dummy: any = {
          url: url,
          readyState: 0, // CONNECTING
          bufferedAmount: 0,
          extensions: "",
          protocol: "vite-hmr",
          binaryType: "blob",
          onopen: null,
          onclose: null,
          onerror: null,
          onmessage: null,
          send: () => {},
          close: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        };
        // Simulate a clean, delayed close so Vite client doesn't retry infinitely or complain
        setTimeout(() => {
          dummy.readyState = 3; // CLOSED
          if (dummy.onclose) {
            try {
              dummy.onclose(new CloseEvent('close', { wasClean: true, code: 1000, reason: "Vite HMR WebSocket disabled" }));
            } catch (_) {
              if (typeof dummy.onclose === 'function') {
                dummy.onclose({ wasClean: true, code: 1000, reason: "Vite HMR WebSocket disabled" });
              }
            }
          }
        }, 150);
        return dummy;
      }
      
      // For any other WebSocket, construct normally
      return Reflect.construct(OriginalWebSocket, [url, protocols], new.target || CustomWebSocket);
    } as any;
    
    CustomWebSocket.prototype = OriginalWebSocket.prototype;
    Object.setPrototypeOf(CustomWebSocket, OriginalWebSocket);
    
    try {
      Object.defineProperty(window, 'WebSocket', {
        value: CustomWebSocket,
        writable: true,
        configurable: true,
        enumerable: true
      });
    } catch (e) {
      try {
        (window as any).WebSocket = CustomWebSocket;
      } catch (err) {
        console.warn('[Vite HMR Fix] Unable to override window.WebSocket:', err);
      }
    }
  }

  // 4. Register event handlers in capturing phase
  const checkAndSuppress = (event: any) => {
    const errorVal = event.reason || event.error || event;
    const messageVal = event.message || '';
    
    let isBenign = false;
    if (errorVal) {
      if (isBenignWebsocketError(errorVal) || isBenignWebsocketError(errorVal.message)) {
        isBenign = true;
      }
    }
    if (!isBenign && messageVal) {
      if (isBenignWebsocketError(messageVal)) {
        isBenign = true;
      }
    }

    if (isBenign) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
      return true;
    }
    return false;
  };

  window.addEventListener('unhandledrejection', (event) => {
    checkAndSuppress(event);
  }, true);

  window.addEventListener('error', (event) => {
    checkAndSuppress(event);
  }, true);

  // 5. Monkeypatch property handlers
  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const msgStr = (message || '').toString();
    const errStr = error ? (error.message || error.toString()) : '';
    if (isBenignWebsocketError(msgStr) || isBenignWebsocketError(errStr)) {
      return true; // suppresses the error display in browser
    }
    if (originalOnError) {
      return originalOnError.apply(this, arguments as any);
    }
    return false;
  };

  const originalOnUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = function (event) {
    const reason = event.reason;
    const reasonStr = reason ? (reason.message || reason.toString()) : '';
    if (isBenignWebsocketError(reasonStr)) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
      return;
    }
    if (originalOnUnhandledRejection) {
      originalOnUnhandledRejection.apply(this, arguments as any);
    }
  };
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
