# UI Inventory — OpenGym FRD-01

## Source

Provided, human-verified image references: `docs/ui/prototype-reference/welcome-desktop.png` and `docs/ui/prototype-reference/welcome-phone.png`. Exact visual CSS reference: `docs/ui/prototype-reference/style.css` and `docs/ui/prototype-reference/refinement.css`.

Observed: the welcome composition, warm cream and Peach palette, soft rounded sign-in panel, six-persona visual hierarchy, and desktop/phone reflow. Inferred for implementation because screenshots cannot show them: hover, focus, loading, error, reduced-motion, deep-link, and dialog behavior. No behavior or prototype-only explanatory copy is inherited from the visual source.

## Navigation Model

React Router browser history and deep links. `/` is the signed-out entry; FRD-01 renders the welcome view there. The five shell destinations are `/today`, `/train`, `/fuel`, `/coach`, and `/grow`; each must survive reload. At wide widths (at least 768 px) navigation is a labelled top navigation; below 768 px it is a labelled bottom navigation. In this signed-out foundation, opening any known non-root route renders its named placeholder as required by FRD-01; authentication redirects remain later scope. Browser Back/Forward use history normally. Unknown paths use the not-found screen and its start link returns to `/`.

Focus order follows visible reading order: skip link (when shell content exists), header/navigation, page heading, content controls, then footer/dock. Keyboard users operate navigation and links with Tab/Shift+Tab and Enter/Space; dialogs trap focus, close on Escape, and return focus to their trigger. Narrow navigation targets are at least 44 × 44 CSS px.

## Screens

### SCR-1 — Welcome
- **Route:** `/`
- **Purpose:** Orient a signed-out journal user with the OpenGym message, six named personas, and future entry actions.
- **Source reference:** `welcome-desktop.png` and `welcome-phone.png` (full frame); `style.css` and `refinement.css` (visual tokens).
- **Components:** CMP-1, CMP-2, CMP-3, CMP-4, CMP-5
- **States:** Default light/Peach welcome. Google and demo controls are visibly inactive; activation has no navigation, request, or external side effect in FRD-01. Loading/error/offline data states are not applicable because this screen has no FRD-01 data fetch.
- **Collection controls:** Not applicable; the six persona names are a fixed decorative orientation group, not a browsable collection.
- **Data:** No reads or writes in FRD-01.

### SCR-2 — Daily Overview Placeholder
- **Route:** `/today`
- **Purpose:** Name the future daily overview and show “This part of your journal is on its way”.
- **Source reference:** FRD-01 FR-006; visual shell language from the supplied welcome references.
- **Components:** CMP-1, CMP-6, CMP-7
- **States:** Default placeholder; no journal data, loading, or error state is introduced in FRD-01.
- **Collection controls:** Not applicable.
- **Data:** No reads or writes in FRD-01.

### SCR-3 — Workouts Placeholder
- **Route:** `/train`
- **Purpose:** Name the future workouts area and show “This part of your journal is on its way”.
- **Source reference:** FRD-01 FR-006; supplied welcome references for visual language.
- **Components:** CMP-1, CMP-6, CMP-7
- **States:** Default placeholder; no data state in FRD-01.
- **Collection controls:** Not applicable.
- **Data:** No reads or writes in FRD-01.

### SCR-4 — Nutrition Placeholder
- **Route:** `/fuel`
- **Purpose:** Name the future nutrition area and show “This part of your journal is on its way”.
- **Source reference:** FRD-01 FR-006; supplied welcome references for visual language.
- **Components:** CMP-1, CMP-6, CMP-7
- **States:** Default placeholder; no data state in FRD-01.
- **Collection controls:** Not applicable.
- **Data:** No reads or writes in FRD-01.

### SCR-5 — AI Coach Placeholder
- **Route:** `/coach`
- **Purpose:** Name the future AI coach area and show “This part of your journal is on its way”.
- **Source reference:** FRD-01 FR-006; supplied welcome references for visual language.
- **Components:** CMP-1, CMP-6, CMP-7
- **States:** Default placeholder; no data state in FRD-01.
- **Collection controls:** Not applicable.
- **Data:** No reads or writes in FRD-01.

### SCR-6 — Seasons & Quests Placeholder
- **Route:** `/grow`
- **Purpose:** Name the future seasons and quests area and show “This part of your journal is on its way”.
- **Source reference:** FRD-01 FR-006; supplied welcome references for visual language.
- **Components:** CMP-1, CMP-6, CMP-7
- **States:** Default placeholder; no data state in FRD-01.
- **Collection controls:** Not applicable.
- **Data:** No reads or writes in FRD-01.

### SCR-7 — Not Found
- **Route:** unmatched path
- **Purpose:** Tell a browser user the page was not found and return them to the start.
- **Source reference:** FRD-01 FR-010.
- **Components:** CMP-1, CMP-6, CMP-8
- **States:** Default error destination; start link is keyboard operable.
- **Collection controls:** Not applicable.
- **Data:** No reads or writes in FRD-01.

## Components

### CMP-1 — Responsive Shell Navigation
- **Used on:** SCR-2, SCR-3, SCR-4, SCR-5, SCR-6, SCR-7
- **Variants:** top navigation at ≥768 px; bottom navigation at <768 px; active/inactive item; desktop labels Daily Overview, Workouts, Nutrition, AI Coach, Seasons & Quests; phone labels Today, Train, Fuel, Coach, Grow.
- **States:** default, hover, focus-visible, active route, keyboard activation; narrow targets meet 44 × 44 CSS px.
- **Source reference:** SRS-NAV-01/02 and FRD-01 FR-006.

### CMP-2 — Brand Lockup
- **Used on:** SCR-1
- **Variants:** desktop and narrow layout; wordmark with “Your training journal” eyebrow.
- **States:** static, non-interactive in FRD-01.
- **Source reference:** supplied welcome references, upper-left region.

### CMP-3 — Welcome Persona Group
- **Used on:** SCR-1
- **Variants:** desktop central visual and phone-width visual; named Sage, Atlas, Nova, Dash, Cleo, Luna.
- **States:** decorative orientation group; no selection or progress semantics in FRD-01.
- **Source reference:** supplied welcome references, central figure group.

### CMP-4 — Welcome Panel
- **Used on:** SCR-1
- **Variants:** desktop side card; phone stacked card; warm surface with large rounded corners.
- **States:** default.
- **Source reference:** supplied welcome references, sign-in panel.

### CMP-5 — Future Entry Actions
- **Used on:** SCR-1
- **Variants:** visible Google and demo actions; primary/secondary visual treatment.
- **States:** inactive, focus-visible; activation intentionally has no side effect in FRD-01.
- **Source reference:** SRS-AUTH-05 and FRD-01 FR-007.

### CMP-6 — Placeholder Panel
- **Used on:** SCR-2, SCR-3, SCR-4, SCR-5, SCR-6
- **Variants:** named destination.
- **States:** default only for this foundation; future data-bearing versions require loading, empty, error, partial, and offline states.
- **Source reference:** FRD-01 FR-006.

### CMP-7 — Page Heading
- **Used on:** SCR-2, SCR-3, SCR-4, SCR-5, SCR-6
- **Variants:** route title and supporting placeholder message.
- **States:** static.
- **Source reference:** FRD-01 FR-006.

### CMP-8 — Start Link
- **Used on:** SCR-7
- **Variants:** text link and focus-visible state.
- **States:** default, hover, focus-visible, keyboard activation.
- **Source reference:** FRD-01 FR-010.

### CMP-9 — Dialog
- **Used on:** future controls; no invocation screen is in FRD-01.
- **Variants:** informational and confirmation content, with optional primary/secondary actions.
- **States:** closed, open, focus trapped, Escape closed, focus restored to trigger.
- **Source reference:** FRD-01 FR-008.

## Standard-Rules Additions

| Item | Screen | Why it was added |
| --- | --- | --- |
| Visible focus order, keyboard activation, and 44 × 44 CSS-px narrow-nav targets | SCR-1 through SCR-7 | The screenshots cannot represent keyboard behavior; FRD-01 and NFR-A11Y require it. |
| Explicit inactive action semantics | SCR-1 | The visual source shows entry controls, but FRD-01 requires no Google, demo, API, or navigation behavior. |
| Explicit future data states for the shared placeholder primitive | SCR-2 through SCR-6 | The current placeholders are static, but state coverage prevents later data views from omitting loading, empty, error, partial, and offline treatments. |
| Dialog focus-trap and focus-return contract | SCR-1 through SCR-7 | The dialog is required by FRD-01 although the screenshots do not reveal its interaction behavior. |

## Gaps

- Six persona figures are visible in the composite screenshots, but no reusable/licensed source artwork was supplied. Do not crop or extract assets from the screenshots; obtain approved artwork or use an approved implementation approach before the welcome screen is built.
- The screenshot source does not resolve hover, focus, error, loading, offline, or dialog copy; this inventory records the FRD/TDD requirements for those states but does not invent a separate visual design.
