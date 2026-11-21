# Tasks

## 1. Router and shell scaffolding

- [x] 1.1 Install `react-router` dependency in `apps/web/package.json` and verify installation succeeds
- [x] 1.2 Create `apps/web/src/app.tsx` with `BrowserRouter` wrapping `<Routes>` for `/`, `/today`, `/train`, `/fuel`, `/coach`, `/grow`, and a fallback `*` route, then verify typecheck passes
- [x] 1.3 Update `apps/web/src/main.tsx` to render the `<App>` from `./app` instead of the inline component, keeping the token CSS import first, then verify typecheck passes

## 2. Responsive navigation component

- [x] 2.1 Create `apps/web/src/components/ShellNavigation.tsx` with a `useMediaQuery` hook for `min-width: 768px`, rendering top nav (Daily Overview, Workouts, Nutrition, AI Coach, Seasons & Quests) or bottom nav (Today, Train, Fuel, Coach, Grow) with `<Link>` elements, and verify typecheck passes
- [x] 2.2 Create `apps/web/src/components/ShellNavigation.module.css` with top/bottom nav styles using only token variables (`var(--space-*)`, `var(--font-body)`, `var(--fg)`, `var(--accent)`, etc.), bottom nav fixed at bottom with 44px minimum target height, visible focus ring via `var(--focus-ring)`, and verify no raw literals exist in the file
- [x] 2.3 Write a Playwright test verifying top navigation labels at 1440 px and bottom navigation labels at 360 px, then verify the test passes

## 3. Welcome screen (SCR-1)

- [x] 3.1 Create `apps/web/src/features/welcome/WelcomeScreen.tsx` with OpenGym brand lockup, six persona circles (Sage, Atlas, Nova, Dash, Cleo, Luna) using token-derived colours, and the approved welcome message, then verify typecheck passes
- [x] 3.2 Create `apps/web/src/features/welcome/WelcomeScreen.module.css` styled exclusively with token variables, including desktop side-panel and phone stacked-card layouts, and verify no raw literals exist in the file
- [x] 3.3 Implement visibly inactive Google and demo sign-in actions with `aria-disabled="true"` and `tabIndex={-1}`, verifying no click handler navigates or fires any request
- [x] 3.4 Write a Playwright test verifying welcome content and persona names at 360, 768, and 1440 px, then verify the test passes
- [x] 3.5 Write an axe accessibility test for the welcome screen at 360, 768, and 1440 px, then verify zero violations

## 4. Placeholder screens (SCR-2 through SCR-6)

- [x] 4.1 Create `apps/web/src/features/placeholder/PlaceholderPanel.tsx` accepting `heading` and `message` props, rendered with token-styled panel, and verify typecheck passes
- [x] 4.2 Create `apps/web/src/features/placeholder/PlaceholderPanel.module.css` using only token variables, and verify no raw literals exist
- [x] 4.3 Wire all five placeholder routes (`/today`, `/train`, `/fuel`, `/coach`, `/grow`) in the router to render `PlaceholderPanel` with correct headings, and verify typecheck passes
- [x] 4.4 Write a Playwright test verifying each placeholder heading and message at 768 px, then verify the test passes
- [x] 4.5 Write a Playwright test verifying route reload: navigate to `/fuel`, reload, and assert the Nutrition placeholder reappears, then verify the test passes

## 5. Not-found screen (SCR-7)

- [x] 5.1 Create `apps/web/src/features/not-found/NotFoundScreen.tsx` with "Page not found" heading and a `<Link>` start link to `/` that is keyboard operable, then verify typecheck passes
- [x] 5.2 Create `apps/web/src/features/not-found/NotFoundScreen.module.css` using only token variables, and verify no raw literals exist
- [x] 5.3 Write a Playwright test verifying the not-found screen renders for unknown routes and the start link navigates to `/` on Enter, then verify the test passes

## 6. Dialog primitive (CMP-9)

- [x] 6.1 Create `apps/web/src/components/Dialog.tsx` rendering via `createPortal` into a body-level container, with focus trap, Escape close, and focus restore to trigger, then verify typecheck passes
- [x] 6.2 Create `apps/web/src/components/Dialog.module.css` using only token variables, and verify no raw literals exist
- [x] 6.3 Write a unit test verifying Dialog focus trap, Escape close, and focus restoration, then verify the test passes

## 7. Integration and accessibility verification

- [x] 7.1 Write an axe accessibility test for each placeholder screen and the not-found screen at 360, 768, and 1440 px, then verify zero violations across all
- [x] 7.2 Write a Playwright test verifying keyboard navigation (Tab/Shift+Tab/Enter) through all routes and navigation, then verify the test passes
- [x] 7.3 Write a Playwright layout test verifying no horizontal scroll at 360, 768, and 1440 px across all routes, then verify the test passes

## 8. UI lint and static verification

- [x] 8.1 Run the UI lint script against `apps/web/src` with the token file and verify zero P0 findings
- [x] 8.2 Run `pnpm lint` from the workspace root and verify it passes for `apps/web/src`
- [x] 8.3 Run `pnpm typecheck` from the workspace root and verify it passes for all workspaces
