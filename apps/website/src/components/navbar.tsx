import { NavLink } from 'react-router-dom';

import styles from './navbar.module.less';

const STORYBOOK_URL = 'https://design-storybook-deweyous-projects.vercel.app';
const GITHUB_URL = 'https://github.com/deweyou/design';

export const Navbar = () => (
  <nav className={styles.navbar}>
    <div className={styles.mark}>
      Deweyou
      <br />
      Design
      <small>v1.0 · MMXXVI</small>
    </div>
    <div className={styles.group}>
      <span className={styles.label}>§ Index</span>
      <NavLink
        to="/"
        end
        className={({ isActive }) => `${styles.link}${isActive ? ` ${styles.active}` : ''}`}
      >
        Overview
        <span>00</span>
      </NavLink>
      <NavLink
        to="/icons"
        className={({ isActive }) => `${styles.link}${isActive ? ` ${styles.active}` : ''}`}
      >
        Icons
        <span>05</span>
      </NavLink>
    </div>
    <div className={styles.group}>
      <span className={styles.label}>§ External</span>
      <a href={STORYBOOK_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
        Storybook ↗
      </a>
      <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
        GitHub ↗
      </a>
    </div>
    <div className={styles.meta}>
      MIT · 2026
      <br />
      design.deweyou.me
    </div>
  </nav>
);
