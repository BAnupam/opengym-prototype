# Design

## Context

CAP-1 delivered the workspace foundation: `apps/web`, `apps/api`, `packages/shared`, root commands, and the `design-system/opengym/tokens.css` token contract. The web app currently has a bare `main.tsx` rendering a simple `<h1>OpenGym</h1>` and no routes, no navigation, and no feature modules. CAP-3 adds the browser-facing layer: routing, responsive navigation, the welcome screen, five placeholder screens, not-found recovery, and the shared Dialog component. The API and database are untouched; the shell is entirely static.

## Goals / Non-Goals

**Goals:**
- Render six routes (`/`, `/today`, `/train`, `/fuel`, `/coach`, `/grow`) with deep-link and reload preservation.
- Switch between top and bottom navigation at the 768 px breakpoint.
- Implement the welcome screen with persona names and inert future entry actions.
- Implement the not-found screen with a keyboard-operable start link.
- Create the shared Dialog primitive (focus trap, Escape close, focus restore).
- Achieve zero axe violations at all three mandated widths.

**Non-Goals:**
- Authentication redirects, sessions, or sign-in behavior.
- Dark theme (deferred).
- Data fetching, journal UI, or any API call from the web shell.
- An actual Dialog-triggering workflow (the Dialog is built but not invoked in FRD-01).
- Demo data or seed users.

## Decisions

### React Router v7 (React Router 7 via `react-router`)

React Router 7 uses `BrowserRouter` for client-side history navigation. It provides deep-link support, route configuration via `<Routes>`/`<Route>`, and a `<Link>` component for keyboard-operable internal navigation. This is the standard choice for a React SPA and satisfies the reload-preservation requirement without server-side routing.

**Alternatives considered:**
- File-based routing (Next.js/Nuxt): rejected because the stack mandates Vite, not a meta-framework.
- Manual history management: rejected as unnecessary complexity when React Router provides the needed behavior.

### Responsive navigation via CSS Media Queries and conditional rendering

At the component level, a single `ShellNavigation` component renders either the top or bottom variant based on a CSS media query hook (`useMediaQuery` with `(min-width: 768px)`). This keeps the route configuration identical for both breakpoints while allowing layout to adapt. The bottom navigation renders as a fixed dock with `position: fixed; bottom: 0` to remain accessible on scroll.

**Alternatives considered:**
- CSS-only `display: none` for both variants: would render unused DOM; the conditional-render approach is cleaner.
- Separate components for top and bottom: unnecessary duplication since labels and routes are shared.

### Persona figures without extracted pixels

The UI contract notes that no licensed persona artwork was supplied. Rather than cropping or extracting pixels from the composite screenshots, the implementation renders each persona as a named, stylized CSS shape using only approved tokens. Each persona is represented by a colored circle with its name below, using token-derived colours for variety. This satisfies the visual hierarchy requirement without violating the asset policy.

**Alternatives considered:**
- Placeholder SVG silhouettes: would need to be sourced or drawn, adding asset management.
- Text-only names in a list: does not match the prototype's visual hierarchy.
- Deferring the welcome: the decomposition requires the personas in FRD-01.

### Dialog as a shared primitive with React Portal

The Dialog renders via `createPortal` into a body-level container, ensuring it is not clipped by overflow or z-index of parent containers. Focus management uses a `FocusTrap` utility that cycles Tab through focusable elements and returns focus to the trigger on close. This pattern is standard for modal overlays and satisfies the accessibility requirements.

### Feature module organization

New code is placed additively under `apps/web/src/features/` and `apps/web/src/components/`, following the workspace's mandated additive boundaries. The router configuration lives in `apps/web/src/app.tsx` as a shell layout wrapping all routes, replacing the bare `main.tsx` App component while preserving the token import.

## Risks / Trade-offs

| Risk | Mitigation |
| --- | --- |
| Persona CSS shapes may not match expected visual fidelity | The UI contract explicitly permits approved non-extracted approaches; the shapes use token colours for variety and name labels for identification. |
| React Router introduces a new runtime dependency | It is the mandated stack's standard routing library; no alternative satisfies the requirements within the constraints. |
| Dialog focus-trap may conflict with future components | The Dialog is built as a generic primitive; integration with specific content is deferred to later capabilities. |

## Migration Plan

No data migration is needed. The web app is a static shell. Deployment is a new Vite build serving updated static assets.

## Open Questions

- None. All decisions are settled by the FRD, technical design, UI contract, and ADR-001.
