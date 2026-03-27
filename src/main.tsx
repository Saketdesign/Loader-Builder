import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { preload } from 'react-dom';
import saketPhoto from './assets/saket.jpeg';

preload(saketPhoto, { as: 'image' });


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
