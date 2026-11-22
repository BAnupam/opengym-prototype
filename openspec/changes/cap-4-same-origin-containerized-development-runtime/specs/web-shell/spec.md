# Spec Delta

## MODIFIED Requirements

### Requirement: Visual token compliance

All UI elements SHALL be styled exclusively through `apps/web/src/styles/tokens.css` CSS custom properties; no raw colour, spacing, or radius literals are permitted in component CSS.

#### Scenario: No raw colour literals in component styles
- **WHEN** component CSS is inspected
- **THEN** no hex, rgb(), or hsl() colour literals appear outside the token file

#### Scenario: Token file is imported at entry point
- **WHEN** `apps/web/src/main.tsx` is loaded
- **THEN** `./styles/tokens.css` is imported before any other style import
