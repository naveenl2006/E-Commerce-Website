import React from 'react';
import ReactDOM from 'react-dom/client';
// BrowserRouter import removed
import App from './App';
import './App.css';

import { AuthProvider } from './contexts/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* BrowserRouter wrapper removed */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
