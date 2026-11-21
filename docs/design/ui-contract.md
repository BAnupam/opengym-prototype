# OpenGym UI Contract

## Source

Provided and human-verified visual references:

- `docs/ui/prototype-reference/welcome-desktop.png`
- `docs/ui/prototype-reference/welcome-phone.png`
- `docs/ui/prototype-reference/style.css`
- `docs/ui/prototype-reference/refinement.css`

The source establishes the light, warm-neutral Peach visual language, rounded soft surfaces, dark warm text, a sans-serif interface face, and Georgia italic display emphasis. It is visual authority only: FRD-01, SRS-01, and TDD-01 remain the behavioral authority. In particular, do not reproduce prototype defects catalogued by BR-003 or the prototype-only text `Interactive prototype - Google sign-in is simulated`.

## Design System

- Style: OpenGym warm clay
- Base package: claymorphism
- Selection: The approved reference has a warm cream ground, soft terracotta/Peach accents, large rounded surfaces, and a calm consumer tone. Claymorphism supplies the closest structural basis (soft elevation, 14/22/34 px radii, and spacious rhythm); its colours and typography are overridden from the approved reference.
- Considered alternatives: editorial was rejected because its rust, content-led reading character is too text-forward; clean was rejected because its smaller radii and neutral product-ui character do not match the reference; bento was rejected because its cool blue dashboard bias contradicts the Peach palette.
- Platform: web (derived from `docs/source/TDD-01.md` §1–2; the repository is greenfield and has no detectable application manifest yet)
- Tokens: design-system/opengym/tokens.css
- Theme Entry Point: apps/web/src/main.tsx

The application root does not yet exist. Ralph must import `../../../design-system/opengym/tokens.css` from `apps/web/src/main.tsx` before any other style import (or import it first from the root stylesheet that `main.tsx` loads). This wiring is outstanding by design for the greenfield run; no application root was scaffolded here.

## Token Direction

- Background and surfaces: warm cream (`--bg`, `--surface`, `--surface-warm`), never cool gray or pure white.
- Accent: Peach with dark warm ink for selected states; Sage, Lavender, Sky, and Rose remain future alternate accents and are not part of FRD-01.
- Type: Segoe UI/Arial for interface and body copy; Georgia italic only for display emphasis such as the second line of the welcome headline.
- Geometry: soft 14/22/34 px radii, pill buttons, restrained warm shadow, and a 17 px phone gutter.
- Theme: light only in FRD-01. Dark mode is explicitly deferred.

## Assets

| Asset | Supplied as | Design copy | Project copy | Registered | Used on |
| --- | --- | --- | --- | --- | --- |
| None supplied | — | — | — | — | — |

## Craft Bindings

- `anti-ai-slop` — prevents generic gradients, placeholder copy, emoji icons, and other prohibited shortcuts.
- `accessibility-baseline` — enforces semantic controls, contrast, keyboard order, visible focus, and mobile target sizes.
- `state-coverage` — ensures placeholder and future data views retain explicit loading, empty, error, partial, and offline behavior where applicable.
- `animation-discipline` — keeps the reference's restrained transform/opacity motion and reduced-motion fallback.
- `typography` and `typography-hierarchy` — bind the supplied sans-serif/Georgia display pairing and its hierarchy.

`form-validation` and `rtl-and-bidi` are not bound: FRD-01 contains no data-entry form and targets English only.

## Implementation Constraints

- Components use only `design-system/opengym/tokens.css`; no raw colours, spacing, radii, or timing literals in component CSS.
- At 768 px and above, use the required labelled top navigation; below 768 px, use the required labelled bottom navigation with 44 × 44 CSS-px minimum targets.
- Future Google and demo actions are visible but inactive in this increment: no navigation, API request, identity-provider request, or external integration.
- Use real FRD/SRS copy. Do not copy prototype-only explanatory text or any erroneous prototype behavior.

## Open Items

- The screenshots show six persona figures, but no reusable/licensed source artwork was supplied. The build must obtain approved assets or implement the required figures without extracting pixels from the composite screenshots.
- Root theme wiring is outstanding until Ralph creates `apps/web/src/main.tsx`.
