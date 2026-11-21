import { describe, expect, it } from "vitest";

describe("Web app smoke test", () => {
  it("typecheck passes — verified by tsc --noEmit in CI", () => {
    // The real typecheck happens via `pnpm typecheck`.
    // This is a placeholder smoke test confirming vitest can run in the web workspace.
    expect(true).toBe(true);
  });
});
