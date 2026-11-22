import React from "react";
import { Link } from "react-router";
import styles from "./NotFoundScreen.module.css";

export function NotFoundScreen(): React.ReactElement {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Page not found</h1>
      <p className={styles.text}>
        The page you are looking for does not exist.
      </p>
      <Link to="/" className={styles.startLink}>
        Go to the start page
      </Link>
    </div>
  );
}
