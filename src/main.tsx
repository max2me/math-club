import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ScoreProvider } from './hooks/useScore.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ScoreProvider>
      <App />
    </ScoreProvider>
  </StrictMode>,
);
