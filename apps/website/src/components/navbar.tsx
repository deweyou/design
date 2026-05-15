import { Link, useLocation } from 'react-router-dom';

import { Button, IconButton, TabList, Tabs, TabTrigger } from '@deweyou-design/react';
import { ExternalLinkIcon, LogoGithubIcon, MoonIcon, SunnyIcon } from '@deweyou-design/react-icons';

import styles from './navbar.module.less';

const STORYBOOK_URL = 'https://design-storybook-deweyous-projects.vercel.app';
const GITHUB_URL = 'https://github.com/deweyou/design';
const ROUTE_TABS = [
  { label: 'Overview', to: '/', value: '/' },
  { label: 'Components', to: '/components', value: '/components' },
  { label: 'Icons', to: '/icons', value: '/icons' },
] as const;

type NavbarProps = {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
};

const getActiveRouteTab = (pathname: string) =>
  ROUTE_TABS.find(({ value }) => value !== '/' && pathname.startsWith(value))?.value ?? '/';

export const Navbar = ({ mode, onToggleMode }: NavbarProps) => {
  const { pathname } = useLocation();

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
          size="sm"
          value={getActiveRouteTab(pathname)}
        >
          <TabList className={styles.routeTabList}>
            {ROUTE_TABS.map((item) => (
              <TabTrigger key={item.value} asChild className={styles.routeTab} value={item.value}>
                <Link to={item.to}>{item.label}</Link>
              </TabTrigger>
            ))}
          </TabList>
        </Tabs>
        <Button
          className={styles.navLinkButton}
          href={STORYBOOK_URL}
          icon={<ExternalLinkIcon aria-hidden size="xs" />}
          rel="noopener noreferrer"
          size="sm"
          target="_blank"
          variant="link"
        >
          Storybook
        </Button>
        <Button
          className={styles.navLinkButton}
          href={GITHUB_URL}
          icon={<LogoGithubIcon aria-hidden size="xs" />}
          rel="noopener noreferrer"
          size="sm"
          target="_blank"
          variant="link"
        >
          GitHub
        </Button>
      </div>

      <div className={styles.actions}>
        <IconButton
          aria-label={mode === 'light' ? '切换深色模式' : '切换浅色模式'}
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
