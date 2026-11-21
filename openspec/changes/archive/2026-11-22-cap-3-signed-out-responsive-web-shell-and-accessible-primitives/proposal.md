# Proposal

## Why

FRD-01 establishes OpenGym's greenfield foundation and requires a signed-out responsive web shell with accessible primitives so that the application renders correctly for a visitor before any authentication or journal behavior exists (FR-006, FR-007, FR-008, FR-010). The foundation workspace and shared contracts are delivered by CAP-1, but no browser-facing routes, navigation, placeholder screens, or shared Dialog primitive exist yet.

## What Changes

- Add a React Router configuration with `BrowserRouter` rendering `/`, `/today`, `/train`, `/fuel`, `/coach`, `/grow`, and a fallback not-found route.
- Implement the welcome screen (`/`) with approved product copy, six persona names (Sage, Atlas, Nova, Dash, Cleo, Luna), and visibly inactive Google and demo sign-in actions.
- Implement five responsive placeholder screens (`/today`, `/train`, `/fuel`, `/coach`, `/grow`) each showing a named heading and "This part of your journal is on its way".
- Implement a not-found screen for unknown routes with a keyboard-operable start link back to `/`.
- Build responsive shell navigation: top navigation at ≥768 px, bottom navigation at <768 px, with 44 × 44 CSS-px minimum touch targets.
- Create a shared accessible Dialog component that traps focus, closes on Escape, and restores focus to its trigger.
- Ensure all UI uses CSS Modules and `design-system/opengym/tokens.css` tokens only; no raw colour, spacing or radius literals in component CSS.
- Add Playwright/axe tests for route reload, responsive navigation labels, welcome content, keyboard navigation, and dialog focus restoration at 360, 768, and 1440 px.

## Capabilities

### New Capabilities

- `web-shell`: The signed-out responsive React shell with routes, navigation, welcome screen, placeholder screens, not-found screen, and shared Dialog primitive.

### Modified Capabilities

None. The `workspace-foundation` spec is unchanged; CAP-3 adds new browser behavior without modifying workspace or shared-contract requirements.

## Impact

- **Affected code**: `apps/web/src/` — new router, layout, feature modules, components, and styles under `apps/web/src/features/` and `apps/web/src/components/`.
- **Dependencies**: `react-router` for routing.
- **Systems**: No API or database changes; the shell is entirely static and produces no identity, API, or integration side effect.
- **Deferred scope**: Authentication redirects, dark theme, data fetching, journal UI, and an actual Dialog-triggering workflow are explicitly out of scope.
