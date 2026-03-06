import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { GOOGLE_CLIENT_ID } from './utils/constants';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
const app = (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

root.render(
  <React.StrictMode>
    {GOOGLE_CLIENT_ID ? (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {app}
      </GoogleOAuthProvider>
    ) : app}
  </React.StrictMode>
);
