// ─── Entry Point ───
// Wraps the App in all global providers.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { ItineraryProvider } from './context/ItineraryContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <ItineraryProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </ItineraryProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
