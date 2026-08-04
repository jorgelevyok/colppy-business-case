/**
 * Application entry point. Mounts the root React tree and loads global styles.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './routes';
import './styles/reset.css';
import './styles/main.css';
import './styles/toast.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
