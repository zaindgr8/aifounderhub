import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const root = document.getElementById('root')!;
// Blog pages arrive as prerendered HTML; App shows it until the blog chunk has loaded.
(window as unknown as { __PRERENDERED_HTML__?: string }).__PRERENDERED_HTML__ = root.innerHTML;

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
