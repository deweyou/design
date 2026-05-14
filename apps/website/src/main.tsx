import React from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider, useLocation } from 'react-router-dom';

import { Toaster } from '@deweyou-design/react';
import { useThemeMode } from '@deweyou-design/react-hooks';
import '@deweyou-design/styles/theme.css';

import { Navbar } from './components/navbar';
import { ComponentsPage } from './pages/components';
import { HomePage } from './pages/home';
import { IconsPage } from './pages/icons';
import './style.css';

const Layout = () => {
  const { mode, toggleMode } = useThemeMode('light');
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      let targetId: string;

      try {
        targetId = decodeURIComponent(location.hash.slice(1));
      } catch {
        return;
      }

      const target = document.getElementById(targetId);
      const navigation = document.querySelector('nav[aria-label="Primary navigation"]');

      if (!target) {
        return;
      }

      const navigationHeight = navigation?.getBoundingClientRect().height ?? 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navigationHeight;

      window.scrollTo({ top: Math.max(0, targetTop) });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.pathname]);

  return (
    <>
      <Navbar mode={mode} onToggleMode={toggleMode} />
      <Outlet />
      <Toaster />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'components', element: <ComponentsPage /> },
      { path: 'icons', element: <IconsPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
