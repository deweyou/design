import { NavLink } from 'react-router-dom';

import styles from './navbar.module.less';

const STORYBOOK_URL = '#';
const GITHUB_URL = 'https://github.com/deweyou/ui';

export const Navbar = () => (
  <nav className={styles.navbar}>
    <NavLink
      to="/"
      end
      className={({ isActive }) => `${styles.link}${isActive ? ` ${styles.active}` : ''}`}
    >
      Home
    </NavLink>
    <NavLink
      to="/icons"
      className={({ isActive }) => `${styles.link}${isActive ? ` ${styles.active}` : ''}`}
    >
      Icons
    </NavLink>
    <a href={STORYBOOK_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
      Storybook ↗
    </a>
    <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
      GitHub ↗
    </a>
  </nav>
);
