import type { MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { IconButton, TabList, Tabs, TabTrigger } from '@deweyou-design/react';
import { ExternalLinkIcon, LogoGithubIcon, MoonIcon, SunnyIcon } from '@deweyou-design/react-icons';

import styles from './navbar.module.less';

const STORYBOOK_URL = 'https://design-storybook-deweyous-projects.vercel.app';
const GITHUB_URL = 'https://github.com/deweyou/design';
const ROUTE_TABS = [
  { label: 'Overview', to: '/', value: '/' },
  { label: 'Components', to: '/components', value: '/components' },
  { label: 'Icons', to: '/icons', value: '/icons' },
] as const;
const EXTERNAL_TABS = [
  {
    icon: <ExternalLinkIcon aria-hidden size="xs" />,
    label: 'Storybook',
    to: STORYBOOK_URL,
    value: 'storybook',
  },
  {
    icon: <LogoGithubIcon aria-hidden size="xs" />,
    label: 'GitHub',
    to: GITHUB_URL,
    value: 'github',
  },
] as const;

type NavbarProps = {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
};

const getActiveRouteTab = (pathname: string) =>
  ROUTE_TABS.find(({ value }) => value !== '/' && pathname.startsWith(value))?.value ?? '/';

export const Navbar = ({ mode, onToggleMode }: NavbarProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const navigateTo = (to: string) => {
    navigate(to);
  };

  const openExternal = (to: string) => {
    window.open(to, '_blank', 'noopener,noreferrer');
  };

  const handleRouteClick = (to: string) => (event: MouseEvent<HTMLButtonElement>) => {
    if (
      event.defaultPrevented ||
      event.button > 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    navigateTo(to);
  };

  const handleExternalClick = (to: string) => (event: MouseEvent<HTMLButtonElement>) => {
    if (
      event.defaultPrevented ||
      event.button > 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    openExternal(to);
  };

  return (
    <nav className={styles.navbar} aria-label="Primary navigation">
      <Link to="/" className={styles.mark}>
        <span>Deweyou Design</span>
      </Link>

      <div className={styles.links}>
        <Tabs
          activationMode="manual"
          className={styles.routeTabs}
          hideContent
          overflowMode="collapse"
          size="sm"
          value={getActiveRouteTab(pathname)}
        >
          <TabList className={styles.routeTabList}>
            {ROUTE_TABS.map((item) => (
              <TabTrigger
                key={item.value}
                className={styles.routeTab}
                value={item.value}
                onClick={handleRouteClick(item.to)}
                onSelect={() => navigateTo(item.to)}
              >
                {item.label}
              </TabTrigger>
            ))}
            {EXTERNAL_TABS.map((item) => (
              <TabTrigger
                key={item.value}
                className={styles.routeTab}
                value={item.value}
                onClick={handleExternalClick(item.to)}
                onSelect={() => openExternal(item.to)}
              >
                <span className={styles.routeTabContent}>
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              </TabTrigger>
            ))}
          </TabList>
        </Tabs>
      </div>

      <div className={styles.actions}>
        <IconButton
          aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          className={styles.themeButton}
          icon={mode === 'light' ? <MoonIcon /> : <SunnyIcon />}
          size="sm"
          variant="ghost"
          onClick={onToggleMode}
        />
      </div>
    </nav>
  );
};
