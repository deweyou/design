import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';

import { Toaster } from '@deweyou-design/react';
import { useThemeMode } from '@deweyou-design/react-hooks';
import '@deweyou-design/styles/theme.css';
import 'virtual:deweyou-website-fonts.css';

import { Navbar } from './components/navbar';
import { ScrollToTop } from './components/scroll-to-top';
import { AiPage } from './pages/ai';
import { ComponentsPage } from './pages/components';
import { FontsPage } from './pages/fonts';
import { HomePage } from './pages/home';
import { IconsPage } from './pages/icons';
import { MarkdownRenderPage } from './pages/markdown-render';
import './style.css';

const Layout = () => {
  const { mode, toggleMode } = useThemeMode('light');

  return (
    <>
      <ScrollToTop />
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
      { path: 'ai', element: <AiPage /> },
      { path: 'fonts', element: <FontsPage /> },
      { path: 'icons', element: <IconsPage /> },
      { path: 'markdown-render', element: <MarkdownRenderPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
