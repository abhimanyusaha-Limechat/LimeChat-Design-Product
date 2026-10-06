import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Agentation } from 'agentation';
import { App } from './App';
import { Inspector } from './components/Inspector';
import './tokens.css';
import './fonts.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Inspector />
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
