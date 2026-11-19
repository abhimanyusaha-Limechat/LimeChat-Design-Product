import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Agentation } from 'agentation';
import { ThemeProvider } from 'arceus';
import '../arceus/src/styles';
import './base.css';
import './scrollbar.css';
import { App } from './App';
import { AuthGate } from './AuthGate';
import { Inspector } from './components/Inspector';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthGate>
        <App />
        <Inspector />
      </AuthGate>
    </ThemeProvider>
    {import.meta.env.DEV && (
      <Agentation
        endpoint="http://localhost:4747"
        onSessionCreated={(sessionId) => {
          console.log('Session started:', sessionId);
        }}
      />
    )}
  </StrictMode>,
);
