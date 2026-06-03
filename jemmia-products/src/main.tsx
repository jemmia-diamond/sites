import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('--- TEST INFISICAL ---');
console.log('VITE_TEST_KEY:', import.meta.env.VITE_TEST_KEY);
console.log('------------------------------');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
