import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/appShell.css';

const pagesRoute = new URLSearchParams(window.location.search).get('__pages_route');
if (pagesRoute) {
  const url = new URL(window.location.href);
  const route = pagesRoute.startsWith('/') ? pagesRoute : `/${pagesRoute}`;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  url.pathname = `${base}${route}`;
  url.searchParams.delete('__pages_route');
  window.history.replaceState(null, '', url);
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
