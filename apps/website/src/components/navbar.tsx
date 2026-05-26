import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { IconButton, NavOverlay } from '@deweyou-design/react';
import {
  ChevronDownIcon,
  ExternalLinkIcon,
  LogoGithubIcon,
  MenuApplicationIcon,
  MoonIcon,
  SunnyIcon,
} from '@deweyou-design/react-icons';

import styles from './navbar.module.less';

const STORYBOOK_URL = 'https://design-storybook-deweyous-projects.vercel.app';
const GITHUB_URL = 'https://github.com/deweyou/design';
const PRIMARY_ROUTE_ITEMS = [
  { label: 'Overview', to: '/', value: '/' },
  { label: 'AI', to: '/ai', value: '/ai' },
] as const;
const EXPLORE_ROUTE_ITEMS = [
  { label: 'Components', to: '/components', value: '/components' },
  { label: 'Fonts', to: '/fonts', value: '/fonts' },
  { label: 'Icons', to: '/icons', value: '/icons' },
  { label: 'Markdown', to: '/markdown-render', value: '/markdown-render' },
  { label: 'Mermaid', to: '/mermaid-render', value: '/mermaid-render' },
] as const;
const MOBILE_ROUTE_ITEMS = [
  PRIMARY_ROUTE_ITEMS[0],
  ...EXPLORE_ROUTE_ITEMS,
  PRIMARY_ROUTE_ITEMS[1],
] as const;

type NavbarProps = {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
};

const isRouteActive = (pathname: string, value: string) =>
  value === '/' ? pathname === '/' : pathname.startsWith(value);

const isExploreActive = (pathname: string) =>
  EXPLORE_ROUTE_ITEMS.some(({ value }) => isRouteActive(pathname, value));

export const Navbar = ({ mode, onToggleMode }: NavbarProps) => {
  const { pathname } = useLocation();
  const exploreMenuRef = useRef<HTMLDivElement>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const exploreActive = isExploreActive(pathname);

  useEffect(() => {
    if (!exploreOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (target instanceof Node && exploreMenuRef.current?.contains(target)) {
        return;
      }

      setExploreOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [exploreOpen]);

  return (
    <nav className={styles.navbar} aria-label="Primary navigation">
      <Link to="/" className={styles.mark}>
        <span>Deweyou Design</span>
      </Link>

      <div className={styles.links}>
        <nav className={styles.routeNav} aria-label="Site sections">
          <div className={styles.routeNavList}>
            <Link
              aria-current={isRouteActive(pathname, '/') ? 'page' : undefined}
              className={styles.routeLink}
              data-active={isRouteActive(pathname, '/') ? '' : undefined}
              to="/"
            >
              Overview
            </Link>
            <div ref={exploreMenuRef} className={styles.routeMenu}>
              <button
                aria-current={exploreActive ? 'page' : undefined}
                aria-expanded={exploreOpen}
                aria-haspopup="menu"
                className={styles.routeMenuTrigger}
                data-active={exploreActive ? '' : undefined}
                type="button"
                onClick={() => setExploreOpen((open) => !open)}
              >
                <span>Explore</span>
                <ChevronDownIcon aria-hidden size="xs" />
              </button>
              {exploreOpen && (
                <div className={styles.routeMenuContent} role="menu">
                  {EXPLORE_ROUTE_ITEMS.map((item) => (
                    <Link
                      key={item.value}
                      aria-current={isRouteActive(pathname, item.value) ? 'page' : undefined}
                      className={styles.routeMenuItem}
                      data-active={isRouteActive(pathname, item.value) ? '' : undefined}
                      role="menuitem"
                      to={item.to}
                      onClick={() => setExploreOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {PRIMARY_ROUTE_ITEMS.slice(1).map((item) => (
              <Link
                key={item.value}
                aria-current={isRouteActive(pathname, item.value) ? 'page' : undefined}
                className={styles.routeLink}
                data-active={isRouteActive(pathname, item.value) ? '' : undefined}
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
            <a
              className={styles.routeLink}
              href={STORYBOOK_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className={styles.routeNavLabel}>
                <span>Storybook</span>
                <ExternalLinkIcon aria-hidden size="xs" />
              </span>
            </a>
          </div>
          <div className={styles.mobileNav}>
            <NavOverlay.Root open={overlayOpen} onOpenChange={setOverlayOpen}>
              <NavOverlay.Trigger>
                <IconButton
                  aria-label="Open navigation"
                  className={styles.actionButton}
                  icon={<MenuApplicationIcon />}
                  size="sm"
                  variant="ghost"
                />
              </NavOverlay.Trigger>
              <NavOverlay.Content className={styles.mobileNavContent}>
                <NavOverlay.CloseButton className={styles.mobileNavCloseButton} />
                <div className={styles.mobileNavList}>
                  {MOBILE_ROUTE_ITEMS.map((item) => (
                    <Link
                      key={item.value}
                      aria-current={isRouteActive(pathname, item.value) ? 'page' : undefined}
                      className={styles.mobileNavLink}
                      data-active={isRouteActive(pathname, item.value) ? '' : undefined}
                      to={item.to}
                      onClick={() => setOverlayOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <a
                    className={styles.mobileNavLink}
                    href={STORYBOOK_URL}
                    rel="noopener noreferrer"
                    target="_blank"
                    onClick={() => setOverlayOpen(false)}
                  >
                    <span className={styles.routeNavLabel}>
                      <span>Storybook</span>
                      <ExternalLinkIcon aria-hidden size="xs" />
                    </span>
                  </a>
                </div>
              </NavOverlay.Content>
            </NavOverlay.Root>
          </div>
        </nav>
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
