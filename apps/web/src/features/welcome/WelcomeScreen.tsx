import React from "react";
import styles from "./WelcomeScreen.module.css";

const personas = [
  { name: "Sage", color: "var(--success)" },
  { name: "Atlas", color: "var(--accent-strong)" },
  { name: "Nova", color: "var(--accent)" },
  { name: "Dash", color: "var(--warn)" },
  { name: "Cleo", color: "var(--danger)" },
  { name: "Luna", color: "var(--muted)" },
];

export function WelcomeScreen(): React.ReactElement {
  return (
    <div className={styles.welcome}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <h1 className={styles.title}>OpenGym</h1>
          <p className={styles.eyebrow}>Your training journal</p>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.personas} aria-label="Featured personas">
          {personas.map((p) => (
            <div key={p.name} className={styles.persona}>
              <div
                className={styles.circle}
                style={{ background: p.color }}
                aria-hidden="true"
              />
              <span className={styles.personaName}>{p.name}</span>
            </div>
          ))}
        </div>

        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Welcome to your training journal</h2>
          <p className={styles.panelText}>
            Track workouts, nutrition, recovery and seasons — all in one place.
            Sign in to get started.
          </p>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.googleButton}
              aria-disabled="true"
              tabIndex={-1}
            >
              Sign in with Google
            </button>
            <button
              type="button"
              className={styles.demoButton}
              aria-disabled="true"
              tabIndex={-1}
            >
              Try the demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
