# web-shell Specification

## Purpose
The signed-out responsive web shell renders the OpenGym welcome experience, five placeholder destinations, a not-found screen, and a shared accessible Dialog for future controls, all within the same-origin foundation.

## Requirements

### Requirement: Responsive reload-safe shell navigation

The web application SHALL render known routes `/`, `/today`, `/train`, `/fuel`, `/coach`, and `/grow`, preserving a requested known route after browser reload.

#### Scenario: Narrow bottom navigation renders
- **WHEN** a browser opens the application below 768 CSS px
- **THEN** it shows the labelled bottom navigation Today, Train, Fuel, Coach, and Grow with targets at least 44 × 44 CSS px

#### Scenario: Wide top navigation renders
- **WHEN** a browser opens the application at 768 CSS px or above
- **THEN** it shows the labelled top navigation Daily Overview, Workouts, Nutrition, AI Coach, and Seasons & Quests

#### Scenario: Route survives reload
- **WHEN** a browser reloads `/fuel`
- **THEN** the Nutrition placeholder reappears with its named heading and required message

### Requirement: Inert welcome orientation

The welcome route SHALL show the approved copy, Sage, Atlas, Nova, Dash, Cleo, and Luna plus visibly inactive Google and demo actions.

#### Scenario: Signed-out welcome renders all personas
- **WHEN** a signed-out user opens `/`
- **THEN** the welcome screen shows the required personas Sage, Atlas, Nova, Dash, Cleo, and Luna

#### Scenario: Google action has no side effect
- **WHEN** a user activates the Google sign-in action on the welcome screen
- **THEN** no navigation, API request, identity-provider request, or external side effect occurs

#### Scenario: Demo action has no side effect
- **WHEN** a user activates the demo sign-in action on the welcome screen
- **THEN** no navigation, API request, identity-provider request, or external side effect occurs

### Requirement: Placeholder screen content

Each known non-root route SHALL render its named placeholder with the required heading and message.

#### Scenario: Daily Overview placeholder
- **WHEN** a user navigates to `/today`
- **THEN** the Daily Overview placeholder appears with heading "Daily Overview" and message "This part of your journal is on its way"

#### Scenario: Workouts placeholder
- **WHEN** a user navigates to `/train`
- **THEN** the Workouts placeholder appears with heading "Workouts" and message "This part of your journal is on its way"

#### Scenario: Nutrition placeholder
- **WHEN** a user navigates to `/fuel`
- **THEN** the Nutrition placeholder appears with heading "Nutrition" and message "This part of your journal is on its way"

#### Scenario: AI Coach placeholder
- **WHEN** a user navigates to `/coach`
- **THEN** the AI Coach placeholder appears with heading "AI Coach" and message "This part of your journal is on its way"

#### Scenario: Seasons & Quests placeholder
- **WHEN** a user navigates to `/grow`
- **THEN** the Seasons & Quests placeholder appears with heading "Seasons & Quests" and message "This part of your journal is on its way"

### Requirement: Accessible fallback and dialog primitives

Unknown routes SHALL render Page not found with a keyboard-operable start link, and the shared Dialog SHALL trap focus, close on Escape, and restore focus to its trigger.

#### Scenario: Not found route renders
- **WHEN** a user navigates to an unknown path
- **THEN** a Page not found screen appears with a start link back to `/`

#### Scenario: Start link is keyboard operable
- **WHEN** a keyboard user focuses the start link on the not-found screen
- **THEN** pressing Enter or Space navigates to `/`

#### Scenario: Dialog keyboard exit
- **WHEN** a keyboard user opens a Dialog and presses Escape
- **THEN** the Dialog closes and focus returns to its opener

#### Scenario: Dialog traps focus
- **WHEN** a keyboard user opens a Dialog and presses Tab
- **THEN** focus remains within the Dialog

### Requirement: Visual token compliance

All UI elements SHALL be styled exclusively through `design-system/opengym/tokens.css` CSS custom properties; no raw colour, spacing, or radius literals are permitted in component CSS.

#### Scenario: No raw colour literals in component styles
- **WHEN** component CSS is inspected
- **THEN** no hex, rgb(), or hsl() colour literals appear outside the token file

#### Scenario: Token file is imported at entry point
- **WHEN** `apps/web/src/main.tsx` is loaded
- **THEN** `design-system/opengym/tokens.css` is imported before any other style import

### Requirement: Accessibility baseline

All rendered screens SHALL have zero axe level-A/AA violations, navigation SHALL be operable by Tab/Enter, and bottom navigation targets SHALL be at least 44 × 44 CSS px.

#### Scenario: Welcome screen passes axe check
- **WHEN** axe runs on the welcome screen at 360, 768, and 1440 CSS px
- **THEN** zero level-A/AA violations are reported

#### Scenario: Placeholder screen passes axe check
- **WHEN** axe runs on each placeholder screen at 360, 768, and 1440 CSS px
- **THEN** zero level-A/AA violations are reported

#### Scenario: Navigation is keyboard operable
- **WHEN** a keyboard user tabs through the navigation
- **THEN** each item receives visible focus and can be activated with Enter or Space
