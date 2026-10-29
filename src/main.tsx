import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize session cookies for Laravel recognition
if (typeof document !== 'undefined') {
  document.cookie = `laravel_session=${encodeURIComponent('eyJpdiI6IlpMNEw0a1h3RzVlSmJzN3dVRXF5Zmc9PSIsInZhbHVlIjoiTElQWmt2ZSt1bWlaQWkyU1dDNVJqZz09In0=')}; path=/; max-age=7200; SameSite=Lax`;
  document.cookie = `XSRF-TOKEN=${encodeURIComponent('eyJpdiI6Ims5L2VTYlF4T1p0WVd4b29vS2s9PSJ9')}; path=/; max-age=7200; SameSite=Lax`;
}

createRoot(document.getElementById('root')!).render(<App />);
