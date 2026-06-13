---
version: alpha
name: Resume Matcher Editorial Brutalism
description: Agent-readable design system extracted on 2026-06-13 from https://resumematcher.fyi/. Color and font tokens come from the site's public CSS; layout and component patterns are inferred from public markup and should be treated as the repository's UI contract until local implementation supersedes them.
colors:
  ink: "#000000"
  paper: "#EDEADF"
  paper-raised: "#E5E5E0"
  paper-muted: "#D8D8D2"
  text-muted: "#374151"
  text-deep: "#111827"
  primary: "#1D4ED8"
  primary-strong: "#1E40AF"
  success: "#15803D"
  danger: "#DC2626"
  warning: "#F97316"
  inverse: "#FFFFFF"
typography:
  display-hero:
    fontFamily: Petrona
    fontSize: 72px
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: -0.025em
  display-section:
    fontFamily: Petrona
    fontSize: 60px
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: -0.025em
  title-card:
    fontFamily: Petrona
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.025em
  body-lg:
    fontFamily: Source Sans 3
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: 0px
  body-md:
    fontFamily: Source Sans 3
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0px
  label-md:
    fontFamily: Source Sans 3
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0.08em
  label-sm:
    fontFamily: Source Sans 3
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: 0.05em
  code-sm:
    fontFamily: Azeret Mono
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0px
rounded:
  none: 0px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  4xl: 80px
components:
  page:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "{spacing.lg}"
  nav-shell:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: "{spacing.lg}"
  section-shell:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.text-deep}"
    rounded: "{rounded.none}"
    padding: "{spacing.3xl}"
  panel:
    backgroundColor: "{colors.paper-muted}"
    textColor: "{colors.text-deep}"
    rounded: "{rounded.none}"
    padding: "{spacing.xl}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.inverse}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: "{spacing.md}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: "{spacing.md}"
  step-badge:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.ink}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.none}"
    size: 48px
  sticker-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.inverse}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: "{spacing.sm}"
  sticker-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.ink}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: "{spacing.sm}"
  link-inline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.primary-strong}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "{spacing.xs}"
  support-copy:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.text-muted}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: "{spacing.xs}"
  social-chip-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.inverse}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.none}"
    padding: "{spacing.md}"
  close-chip-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.inverse}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.none}"
    padding: "{spacing.sm}"
---

# Resume Matcher Editorial Brutalism

## Overview

This system is extracted from `https://resumematcher.fyi/` and is the required visual source of truth for future UI work in this repository. Exact token values come from the site's published CSS variables; layout patterns, section framing, and several component behaviors are inferred from public markup on June 13, 2026.

The visual direction is editorial neo-brutalism: warm paper surfaces, black outlines, hard offset shadows, assertive serif headlines, utilitarian sans-serif UI labels, and small doses of playful rotation. Interfaces should feel tactile and opinionated rather than polished, soft, or generic SaaS.

## Colors

`paper`, `paper-raised`, and `paper-muted` are the default surfaces. The page should live on warm off-white tones instead of pure white, with pure white reserved for inverse text or high-contrast sticker moments.

`ink` is the default text and border color. `text-muted` and `text-deep` are for secondary body copy and dense supporting copy, but borders should remain black unless a specific inverse treatment is required.

`primary` is the CTA and highlight blue. `warning` is the loud orange used for counters, inline stickers, and menu triggers. `success` is a secondary accent for supportive links or chips. `danger` is reserved for destructive or close actions only.

The page background should keep the subtle graph-paper treatment visible in the source site: a 40px grid using very low-opacity black lines over the warm paper base.

## Typography

Use `Petrona` for all display and section headlines. Headlines are tight, high-contrast, and slightly literary. Desktop hero text should land around 72px to 96px, with section titles scaling from roughly 48px to 96px depending on viewport and emphasis.

Use `Source Sans 3` for all body copy, controls, labels, and supporting text. Body copy is readable and generous, usually 16px to 20px with line heights around 1.5 to 1.72. UI labels often shift to uppercase with wider tracking so buttons, chips, and numeric callouts feel stamped rather than elegant.

Use `Azeret Mono` only for code, data-like snippets, or utility annotations. Do not let monospaced text become the dominant tone of a screen.

## Layout

The spacing rhythm is based on a 4px unit. Most UI should step in 8px, 16px, 24px, 32px, 48px, and 64px increments. Major sections use 64px to 96px vertical padding on desktop and stay roomy on mobile rather than collapsing into tight stacks.

Responsive breakpoints follow the source Tailwind scale exposed in CSS: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, and `2xl` 1536px. Start from a single-column mobile stack and move into two-column compositions at `lg` when artwork or paired text can breathe.

Primary content wrappers should sit inside a centered rail around 1280px wide, with some hero and feature sections allowed to expand to roughly 1600px or 1920px when illustrations need more room. Section interiors frequently keep visible vertical border rails, so wide layouts should still feel framed.

Body copy should typically stay within 58ch to 68ch for readable passages. Large images should be isolated and allowed to stand beside text instead of being boxed into dense card grids by default.

## Elevation & Depth

Do not use blur-heavy elevation. Depth comes from hard offset shadows, visible borders, and tonal paper shifts. The standard shadow steps are about `3px 3px`, `4px 4px`, `6px 6px`, and `8px 8px`, always crisp and always readable.

Borders are structural, not decorative. Use 1px black borders for lighter controls and link treatments, and 2px black borders for panels, nav shells, section cards, badges, and framed containers.

Small rotations are allowed on stickers, CTA buttons, social chips, and highlighted words. Keep them subtle, usually between `-2deg` and `2deg`. Hover states should feel more tactile by changing shadow depth, translation, or rotation rather than by fading opacity.

## Shapes

Corners are square. Cards, buttons, dialogs, inputs, chips, badges, and media frames should all default to `0px` radius.

The design language is rigid but playful: straight-edged boxes hold the structure, while a few inline highlight blocks can rotate slightly to create personality. Avoid pills, capsules, glass panels, or soft floating blobs.

Illustrations can be expressive, but the UI chrome around them must stay rectilinear and assertive.

## Components

Navigation should be a fixed top shell on warm paper with a 2px black border and a hard 6px shadow. The logo lives in its own boxed chip, and desktop links stay simple until hover adds a tinted background and visible border.

Primary buttons use `Source Sans 3` uppercase labels, black borders, square corners, accent fills, and 6px hard shadows. Give them a slight starting rotation and compress them toward the shadow on active press. Secondary buttons keep the same structure but stay transparent or paper-colored until hover inverts them.

Panels, cards, section wrappers, and footers should use warm paper surfaces, 2px black borders, and 8px hard shadows. Padding should stay generous, typically 24px to 40px, so the content does not feel cramped inside the frame.

Step markers and numeric badges should be 48px square blocks in warning orange with bold label typography, black borders, and 3px shadows. Use black text on orange to preserve accessible contrast.

Inline sticker highlights should be short and strategic: one or two words, accent or warning fill, square edges, hard shadow, and slight rotation. Use them to punctuate a headline or punchline, not to decorate entire paragraphs.

Links inside long-form copy should use the accent blue and a strong underline or bottom-border treatment. Hover can add a light accent wash, but links should remain crisp and legible rather than ghosted.

Inputs and selects should be plainer than the marketing cards: white fill, 1px neutral border, square corners, and a visible blue focus ring. Forms should still belong to the same family, but they should not become overstylized stickers.

Accessibility is mandatory. Maintain WCAG AA contrast, preserve a visible `2px` accent focus ring with a paper-colored offset, keep interactive targets at least `44px` tall where practical, support keyboard navigation everywhere, disable decorative motion under `prefers-reduced-motion`, and allow text to reflow at 200% zoom without clipping rotated sticker labels.

## Do's and Don'ts

- Do treat this file as the strict contract for any new UI, component, or page in this repository.
- Do pair Petrona headlines with Source Sans 3 body and label text.
- Do keep black borders, hard shadows, warm paper surfaces, and slight sticker-like rotation as the core personality.
- Do use roomy spacing and framed sections instead of crowding everything into tight dashboards.
- Don't introduce rounded-pill controls, glassmorphism, blurred shadows, gradient-heavy hero treatments, or generic soft cards.
- Don't use pure grayscale surfaces as the default aesthetic; the warm paper base is required.
- Don't scatter multiple loud accent fills inside one small component; pick one dominant color plus black structure.
- Don't create new visual patterns without updating this file first.
