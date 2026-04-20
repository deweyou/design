import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';

import { IconButton, Toaster } from '@deweyou-design/react';
import { useThemeMode } from '@deweyou-design/react-hooks';
import '@deweyou-design/styles/theme.css';

import { Navbar } from './components/navbar';
import { HomePage } from './pages/home';
import { IconsPage } from './pages/icons';
import './style.css';

const SunIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="1em"
    stroke="currentColor"
    strokeLinecap="square"
    strokeLinejoin="miter"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="1em"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="1em"
    stroke="currentColor"
    strokeLinecap="square"
    strokeLinejoin="miter"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="1em"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const Layout = () => {
  const { mode, toggleMode } = useThemeMode('light');

  return (
    <>
      <Navbar />
      <Outlet />
      <Toaster />
      <IconButton
        aria-label={mode === 'light' ? '切换深色模式' : '切换浅色模式'}
        icon={mode === 'light' ? <MoonIcon /> : <SunIcon />}
        shape="pill"
        style={{
          bottom: 28,
          boxShadow: 'var(--ui-shadow-soft)',
          position: 'fixed',
          right: 28,
        }}
        variant="outlined"
        onClick={toggleMode}
      />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'icons', element: <IconsPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
