import { NavLink } from 'react-router-dom';

import { IconButton } from '@deweyou-design/react';
import { SettingsIcon } from '@deweyou-design/react-icons';

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
      <small>v1.0</small>
    </NavLink>

    <div className={styles.links}>
      <NavLink to="/" end className={linkClassName}>
        Overview
      </NavLink>
      <NavLink to="/components" className={linkClassName}>
        Components
      </NavLink>
      <NavLink to="/icons" className={linkClassName}>
        Icons
      </NavLink>
      <a href={STORYBOOK_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
        Storybook ↗
      </a>
      <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
        GitHub ↗
      </a>
    </div>

    <div className={styles.actions}>
      <span className={styles.modeLabel}>{mode}</span>
      <IconButton
        aria-label={mode === 'light' ? '切换深色模式' : '切换浅色模式'}
        icon={<SettingsIcon />}
        shape="pill"
        size="sm"
        variant="outlined"
        onClick={onToggleMode}
      />
    </div>
  </nav>
);
