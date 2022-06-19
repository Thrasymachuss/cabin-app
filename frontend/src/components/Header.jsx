import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import { FaBars } from "react-icons/fa";

function Header() {
  const [navEnabled, setNavEnabled] = useState(false);
  const toggleNav = () => {
    setNavEnabled(!navEnabled);
  };
  const loggedIn = false;
  return loggedIn ? (
    <header className={styles.header}>
      <div className={styles["hamburger-wrap"]} onClick={toggleNav}>
        <FaBars className={styles.hamburger} />
      </div>
      <nav className={styles.nav}>
        <ul
          className={`${styles["links-list"]} ${navEnabled ? styles.show : ""}`}
        >
          <li>
            <Link to="/register" className={styles.link}>
              Register
            </Link>
          </li>
          <li>
            <Link to="/login" className={styles.link}>
              Login
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  ) : (
    ""
  );
}

export default Header;
