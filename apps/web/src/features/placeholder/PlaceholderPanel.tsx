import React from "react";
import styles from "./PlaceholderPanel.module.css";

interface PlaceholderPanelProps {
  heading: string;
  message?: string;
}

export function PlaceholderPanel({
  heading,
  message = "This part of your journal is on its way",
}: PlaceholderPanelProps): React.ReactElement {
  return (
    <div className={styles.panel}>
      <h2 className={styles.heading}>{heading}</h2>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
