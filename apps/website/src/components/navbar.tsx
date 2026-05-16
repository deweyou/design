import { Link, useLocation, useNavigate } from 'react-router-dom';

import { IconButton, Nav, type NavResponsiveSelectDetails } from '@deweyou-design/react';
import {
  ExternalLinkIcon,
  LogoGithubIcon,
  MenuApplicationIcon,
  MoonIcon,
  SunnyIcon,
} from '@deweyou-design/react-icons';

import styles from './navbar.module.less';

const STORYBOOK_URL = 'https://design-storybook-deweyous-projects.vercel.app';
const GITHUB_URL = 'https://github.com/deweyou/design';
const ROUTE_ITEMS = [
  { label: 'Overview', to: '/', value: '/' },
  { label: 'Components', to: '/components', value: '/components' },
  { label: 'Icons', to: '/icons', value: '/icons' },
] as const;

type NavbarProps = {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
};

const getActiveRouteTab = (pathname: string) =>
  ROUTE_ITEMS.find(({ value }) => value !== '/' && pathname.startsWith(value))?.value ?? '/';

export const Navbar = ({ mode, onToggleMode }: NavbarProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const navigateTo = (to: string, event?: NavResponsiveSelectDetails['event']) => {
    event?.preventDefault();
    navigate(to);
  };

  const navItems = [
    ...ROUTE_ITEMS.map((item) => ({
      href: item.to,
      label: item.label,
      onSelect: ({ event }: NavResponsiveSelectDetails) => navigateTo(item.to, event),
      value: item.value,
    })),
    {
      external: true,
      href: STORYBOOK_URL,
      label: (
        <span className={styles.routeNavLabel}>
          <span>Storybook</span>
          <ExternalLinkIcon aria-hidden size="xs" />
        </span>
      ),
      value: 'storybook',
    },
  ];

  return (
    <nav className={styles.navbar} aria-label="Primary navigation">
      <Link to="/" className={styles.mark}>
        <span>Deweyou Design</span>
      </Link>

      <div className={styles.links}>
        <Nav.Responsive
          aria-label="Site sections"
          breakpoint="sm"
          className={styles.routeNav}
          collapseLabel="Open navigation"
          collapseTrigger={
            <IconButton
              aria-label="Open navigation"
              className={styles.actionButton}
              icon={<MenuApplicationIcon />}
              size="sm"
              variant="ghost"
            />
          }
          items={navItems}
          listClassName={styles.routeNavList}
          size="sm"
          value={getActiveRouteTab(pathname)}
        />
      </div>

      <div className={styles.actions}>
        <IconButton
          aria-label="GitHub"
          className={styles.actionButton}
          href={GITHUB_URL}
          icon={<LogoGithubIcon />}
          rel="noopener noreferrer"
          size="sm"
          target="_blank"
          variant="ghost"
        />
        <IconButton
          aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          className={styles.actionButton}
          icon={mode === 'light' ? <MoonIcon /> : <SunnyIcon />}
          size="sm"
          variant="ghost"
          onClick={onToggleMode}
        />
      </div>
    </nav>
  );
};
