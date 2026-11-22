import "@testing-library/jest-dom";

// Clean up the dialog portal between tests to prevent accumulation
import { afterEach } from "vitest";

afterEach(() => {
  const portal = document.getElementById("dialog-portal");
  if (portal) {
    portal.innerHTML = "";
  }
});
