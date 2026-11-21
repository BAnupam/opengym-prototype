import React from "react";
import { Link } from "react-router";
import { useMediaQuery } from "../hooks/useMediaQuery";
import styles from "./ShellNavigation.module.css";

const desktopLinks: Array<{ to: string; label: string }> = [
  { to: "/today", label: "Daily Overview" },
  { to: "/train", label: "Workouts" },
  { to: "/fuel", label: "Nutrition" },
  { to: "/coach", label: "AI Coach" },
  { to: "/grow", label: "Seasons & Quests" },
];

const mobileLinks: Array<{ to: string; label: string }> = [
  { to: "/today", label: "Today" },
  { to: "/train", label: "Train" },
  { to: "/fuel", label: "Fuel" },
  { to: "/coach", label: "Coach" },
  { to: "/grow", label: "Grow" },
];

export function ShellNavigation(): React.ReactElement {
  const wide = useMediaQuery("(min-width: 768px)");
  const links = wide ? desktopLinks : mobileLinks;

  return (
    <nav
      className={wide ? styles.topNav : styles.bottomNav}
      aria-label={wide ? "Primary navigation" : "Bottom navigation"}
    >
      {links.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className={styles.navItem}
          aria-current={
            to === "/"
              ? undefined
              : undefined
          }
        >
          <span className={styles.navLabel}>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
