import { NavLink } from 'react-router-dom';

import { IconButton } from '@deweyou-design/react';
import {
  ChevronRightIcon,
  ExternalLinkIcon,
  LogoGithubIcon,
  MoonIcon,
  SunnyIcon,
} from '@deweyou-design/react-icons';

import styles from './navbar.module.less';

const STORYBOOK_URL = 'https://design-storybook-deweyous-projects.vercel.app';
const GITHUB_URL = 'https://github.com/deweyou/design';

type NavbarProps = {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
};

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  `${styles.link}${isActive ? ` ${styles.active}` : ''}`;

export const Navbar = ({ mode, onToggleMode }: NavbarProps) => (
  <nav className={styles.navbar} aria-label="Primary navigation">
    <NavLink to="/" className={styles.mark}>
      <span>Deweyou Design</span>
    </NavLink>

    <div className={styles.links}>
      <NavLink to="/" end className={linkClassName}>
        {({ isActive }) => (
          <>
            {isActive && <ChevronRightIcon aria-hidden className={styles.activeIcon} size="xs" />}
            <span>Overview</span>
          </>
        )}
      </NavLink>
      <NavLink to="/components" className={linkClassName}>
        {({ isActive }) => (
          <>
            {isActive && <ChevronRightIcon aria-hidden className={styles.activeIcon} size="xs" />}
            <span>Components</span>
          </>
        )}
      </NavLink>
      <NavLink to="/icons" className={linkClassName}>
        {({ isActive }) => (
          <>
            {isActive && <ChevronRightIcon aria-hidden className={styles.activeIcon} size="xs" />}
            <span>Icons</span>
          </>
        )}
      </NavLink>
      <a href={STORYBOOK_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
        <span>Storybook</span>
        <ExternalLinkIcon aria-hidden size="xs" />
      </a>
      <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
        <span>GitHub</span>
        <LogoGithubIcon aria-hidden size="xs" />
      </a>
    </div>

    <div className={styles.actions}>
      <IconButton
        aria-label={mode === 'light' ? '切换深色模式' : '切换浅色模式'}
        icon={mode === 'light' ? <MoonIcon /> : <SunnyIcon />}
        shape="pill"
        size="sm"
        variant="outlined"
        onClick={onToggleMode}
      />
    </div>
  </nav>
);
