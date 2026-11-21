import { useEffect, useState } from "react";

/**
 * Hook that returns true when the CSS media query matches.
 * Evaluates on mount and on window resize.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);

    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
