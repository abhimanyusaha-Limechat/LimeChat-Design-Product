---
version: alpha
name: Arceus 3.0.0
description: LimeChat design system — Mantine v8 wrapper. Token values live in theme source files; this doc references those files and documents usage.
---

# Arceus Design System

## Overview

Arceus is the LimeChat design system — a React component library built on Mantine v8, TypeScript, and the Lato typeface. It powers LimeChat's products: outbound messaging, bot automation builder, wallet, voice-widgets, analytics.

**Brand personality:** Professional B2B SaaS — trustworthy, efficient, and channel-aware. The visual language balances LimeChat green as the primary action color with a cool secondary blue for accents and gradients for AI features. UI density is moderate: compact enough for data-heavy dashboards, readable enough for long-form settings and forms.

**Package:** npm name `arceus`, source at `packages/ui/`. Storybook lives at [arceus.limechat.ai](https://arceus.limechat.ai).

**Token source of truth:** Do not invent or hardcode design values. Read the theme files listed in each section below. Theme assembly is in [`src/theme/defaults/theme.ts`](src/theme/defaults/theme.ts).

**Setup:**

```tsx
import { ThemeProvider, ModalsProvider, ToastContainer } from 'arceus';
import 'arceus/styles';
import 'arceus/dist/arceus.css';

<ThemeProvider>
  <ModalsProvider>
    {/* app */}
  </ModalsProvider>
</ThemeProvider>
<ToastContainer />
```

Import components from the `'arceus'` barrel only — never deep subpaths.

**REM base:** Defined in [`src/theme/typography/toRem.ts`](src/theme/typography/toRem.ts) (`REM_BASE_PX`). All spacing, radius, and font-size tokens are converted through this base. This differs from the browser default of 16px.

## Colors

Palette keys (`primary`, `secondary`, `gray`, etc.) are defined as 10-step Mantine color tuples (index 0 = lightest tint, index 9 = darkest shade, index 6 = brand shade). Use palette keys in component `color` props rather than raw hex values.

| Concern | Source file |
|---------|-------------|
| Brand, semantic, channel, gray palettes | [`src/theme/palettes/colors.ts`](src/theme/palettes/colors.ts) |
| Text tones (`DARK`, `LIGHT`, `PLACEHOLDER`) | [`src/theme/palettes/fonts.ts`](src/theme/palettes/fonts.ts) |
| Chart accents (`extra01`–`extra10`) | [`src/theme/palettes/accents.ts`](src/theme/palettes/accents.ts) |
| AI / channel gradients | [`src/theme/palettes/gradients.ts`](src/theme/palettes/gradients.ts) |
| Theme wiring (`primaryColor`, `white`, `other`) | [`src/theme/defaults/theme.ts`](src/theme/defaults/theme.ts) |

### Brand & Action

- **Primary:** LimeChat green. Main CTAs, success-adjacent brand moments, primary `Button` and `Badge` fills. Shade `6` is the brand shade.
- **Secondary:** Brand blue. Accents, links, AI gradient endpoint. Pair with primary for the default AI gradient.
- **Canvas:** Default page and card surface — theme `white`.

### Text

- **Dark / Light:** Headings and primary body vs secondary copy. Maps to `tone="dark"` / `tone="light"` on `Title` and `Text` (see [`src/components/core/typography/variants.ts`](src/components/core/typography/variants.ts)).
- **Placeholder:** Form field placeholder text (`PLACEHOLDER` in fonts palette).

### Semantic

Success, error, warning, and info palettes live in `colors.ts`. Prefer palette keys (`success`, `error` / `red`, `warning` / `yellow`, `info`) over hex.

### Surfaces & Structure

- **Hairline / disabled fills:** Use `gray` palette steps from `colors.ts` (e.g. dividers, table borders, disabled backgrounds).
- Do not fork surface colors in app CSS — reference Mantine CSS variables (`var(--mantine-color-gray-3)`, etc.).

### Channel Brands

WhatsApp, Instagram, and Facebook palettes are in `colors.ts`. Use only in channel-specific UI — never as generic accent colors. Channel gradients are in `gradients.ts` (90deg shade 6 → 7).

### Chart Accents

Ten supplementary colors via theme `other` / CSS variables `--mantine-other-extra01` through `--mantine-other-extra10` (from `accents.ts`).

### Gradients

- **AI Gradient:** Default theme gradient from `gradients.ts` — use `variant="gradient"` on Button or `--mantine-ai-gradient` in CSS.
- Apply gradients sparingly — one gradient element per view at most.

## Typography

Font family is set on the theme in [`src/theme/defaults/theme.ts`](src/theme/defaults/theme.ts) (`Lato`). Font-size and line-height scales are in [`src/theme/typography/fontScale.ts`](src/theme/typography/fontScale.ts).

Never set raw `fontSize` or `fontWeight` on text elements — use Arceus `Title` and `Text` with `variant` and `tone` props. Variant → size/weight mappings live in [`src/components/core/typography/variants.ts`](src/components/core/typography/variants.ts).

### Title Variants

Use `Title` for headings. Each level has a `-medium` weight variant for softer emphasis.

| Variant | Use |
|---------|-----|
| `h1` | Page titles |
| `h2` | Section headings |
| `h3` / `h3-medium` | Sub-section heads |
| `h4` / `h4-medium` | Card titles, modal titles |
| `h5` / `h5-medium` | Table column headers, compact labels |
| `h6` / `h6-medium` | Small section labels |
| `h7` / `h7-medium` | Micro labels |

### Text Variants

Use `Text` for body copy, captions, and metadata.

| Variant | Use |
|---------|-----|
| `subtitle-1` | Lead paragraphs, form section intros |
| `subtitle-2` | Secondary lead text |
| `body-1` | Default body |
| `body-2` | Standard UI body — most common in tables and forms |
| `body-3` | Compact body |
| `caption-1` | Helper text |
| `caption-2` | Fine print |
| `caption-3` | Micro captions |

### Tone Prop

Tone → color mapping is in `TONE_TO_COLOR` in [`src/components/core/typography/variants.ts`](src/components/core/typography/variants.ts).

| Tone | Use |
|------|-----|
| `dark` | Primary readable text |
| `light` | Secondary, metadata |
| `primary` | Brand emphasis |
| `secondary` | Blue accent text |
| `red` | Error messages |
| `yellow` | Warning messages |

Example:

```tsx
<Title variant="h4-medium" tone="dark">Campaign Settings</Title>
<Text variant="body-2" tone="light">Last updated 2 hours ago</Text>
```

### Button Typography

Button label typography follows the control font-size scale in [`src/theme/tokens/sizes/sizing.ts`](src/theme/tokens/sizes/sizing.ts) (`controlFontSize`). Default size is `sm`. Use the `label` prop, not `children`.

## Layout

### Spacing Scale

Defined in [`src/theme/layout/spacing.ts`](src/theme/layout/spacing.ts). 8px-base rhythm with micro-steps. Use Mantine `spacing` prop values or CSS variables (`var(--mantine-spacing-md)`).

### Layout Primitives

Build layouts with Arceus flex primitives — do not use raw CSS grid/flex unless necessary.

| Component | Use |
|-----------|-----|
| `Stack` | Vertical stacking with gap |
| `Group` | Horizontal row with gap |
| `Box` | Generic container |
| `Flex` | Custom flex layouts |
| `AppShell` | Dashboard shell with navbar |
| `Container` | Max-width content wrapper |
| `SimpleGrid` / `Grid` | Responsive grids |

Default component size and radius are in [`src/theme/defaults/componentSize.ts`](src/theme/defaults/componentSize.ts). Default gap between stacked elements is `sm` or `md` for section breaks.

### Component Sizing

Interactive control heights, paddings, and font sizes share a unified size scale in [`src/theme/tokens/sizes/sizing.ts`](src/theme/tokens/sizes/sizing.ts) (`container`, `controlFontSize`, etc.). Sizes: `xs` through `xl`.

### App-Level Styling

Consumer apps (e.g. marketing/automation) extend Arceus via SASS classes that reference Mantine CSS variables (`var(--mantine-color-primary-6)`, `var(--mantine-spacing-md)`). Do not fork or override the theme — use CSS variables and `className`/`classNames` props.

## Elevation & Depth

Arceus inherits Mantine v8 default shadows (`xs` through `xl`). No custom shadow tokens are defined.

- **Modals:** `shadow: xl` — see [`src/components/core/Modal/modal.extension.ts`](src/components/core/Modal/modal.extension.ts).
- **Menus / Popovers:** `shadow: lg`.
- **Cards:** `shadow: xs` to `md` depending on context.

Depth is primarily conveyed through surface color shifts rather than heavy shadows: white cards on `gray[0]` backgrounds, hairline dividers between rows, and tonal palette steps for hover states.

## Shapes

Corner radius scale is in [`src/theme/layout/radius.ts`](src/theme/layout/radius.ts). Global default radius is `defaultRadius` in [`src/theme/defaults/theme.ts`](src/theme/defaults/theme.ts) / `SIZE_DEFAULT.radius` in [`src/theme/defaults/componentSize.ts`](src/theme/defaults/componentSize.ts) (`2xs`).

| Token | Use |
|-------|-----|
| `zero` | Tables, flush panels |
| `2xs` | **Default** — buttons, inputs, badges |
| `xs` | Modals, larger cards |
| `sm` | Feature cards |
| `md` | Hero panels |
| `lg`–`2xl` | Large containers, rarely used |

Buttons are not pill-shaped by default. Use `radius="2xs"` unless a specific component extension sets otherwise (modals use `xs`).

## Components

Arceus is a component library — always prefer importing React components over constructing UI from raw tokens. The patterns below reflect production usage across LimeChat apps.

### Component Selection Guide

| UI need | Arceus component |
|---------|-----------------|
| Primary action | `Button variant="filled" color="primary"` |
| Secondary action | `Button variant="default" color="gray"` |
| Destructive action | `Button variant="filled" color="red"` |
| Icon-only action | `ActionIcon variant="subtle"` |
| Page heading | `Title variant="h1"` or `h2` |
| Section heading | `Title variant="h4-medium"` |
| Body copy | `Text variant="body-2" tone="dark"` |
| Metadata / caption | `Text variant="body-3" tone="light"` |
| Text input | `TextInput` with `InputWrapper` |
| Dropdown | `Select` or `MultiSelect` |
| Search/filter | `SearchBox` |
| Confirmation dialog | `Modal` + `ModalFooter` |
| Delete confirmation | `DeleteModal` |
| Paginated data list | `DataTableControlled` + `DataTableHeader` |
| Tab navigation | `Tabs variant="default"` |
| Toast notification | `toastSuccess` / `toastError` / `toastInfo` / `toastWarn` |
| Loading state | `Loader` or `PageLoader` |
| Status indicator | `Badge` |
| Dashboard layout | `AppShell` |

### Button

```tsx
<Button
  label="Save Campaign"
  color="primary"
  variant="filled"
  size="sm"
  onClick={handleSave}
/>

<Button
  label="Cancel"
  color="gray"
  variant="default"
  onClick={handleCancel}
/>
```

- **`label` prop** is the Arceus convention (alias for `children`).
- **`variant="filled" color="primary"`** for the single most important action per view.
- **`variant="default" color="gray"`** for secondary actions.
- **`variant="subtle"`** for tertiary/inline actions.
- **`variant="gradient"`** for AI-branded CTAs (uses default AI gradient from `gradients.ts`).
- **`loading`** and **`disabled`** states are built-in. Disabled styling uses gray palette steps from `colors.ts`.
- Defaults: [`src/theme/extensions/button.extension.ts`](src/theme/extensions/button.extension.ts), [`src/theme/defaults/componentSize.ts`](src/theme/defaults/componentSize.ts).

### Modal

```tsx
<Modal
  opened={opened}
  onClose={close}
  title="Download Report"
  description="Select a date range for the export."
>
  {/* body content */}
  <Modal.Footer>
    <Button label="Cancel" color="gray" variant="default" onClick={close} />
    <Button label="Download" color="primary" variant="filled" onClick={handleDownload} />
  </Modal.Footer>
</Modal>
```

- Always pair action buttons with `Modal.Footer`.
- Defaults and padding: [`src/components/core/Modal/modal.extension.ts`](src/components/core/Modal/modal.extension.ts).

### Forms

```tsx
<InputWrapper label="Campaign Name" required>
  <TextInput placeholder="Enter campaign name" />
</InputWrapper>

<Select
  label="Channel"
  data={[{ value: 'whatsapp', label: 'WhatsApp' }]}
/>

<Switch label="Enable test mode" />
```

- Compose forms with `TextInput`, `Select`, `MultiSelect`, `NumberInput`, `Switch`, `Checkbox`, `RadioButton`, and `TimeInput`.
- Wrap fields in `InputWrapper` for consistent label, error, and description styling.
- Shared input tokens: [`src/theme/extensions/input/`](src/theme/extensions/input/).
- Apps use `FormGenerator` for schema-driven dynamic forms with `@mantine/form`.
- Focus state replaces the hairline border with the primary color.

### Data Tables

```tsx
<DataTableControlled
  columns={columns}
  fetchData={fetchCampaigns}
  initialPageSize={20}
/>
```

- Use `DataTableControlled` for server-paginated lists (segments, automation flows, templates).
- Define column typography with `TABLE_TEXT` constants.
- Apply `DataTableHeader` for toolbar actions above the table.

### Stepper

`Stepper` accepts Mantine `StepperProps` and composes `Stepper.Step` and `Stepper.Completed`.
Use zero-based `active` and `onStepClick` indexes. Defaults match the [Figma states](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=9909-911): horizontal overlapping steps, a minimum 48px height that grows with content, 12px vertical padding, 24px trailing padding, 20px icons, and 12px icon-to-text spacing.

```tsx
<Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>
  <Stepper.Step label="Account" description="Create an account">Account form</Stepper.Step>
  <Stepper.Step label="Profile" description="Add details">Profile form</Stepper.Step>
  <Stepper.Step label="Review">Review form</Stepper.Step>
  <Stepper.Completed>Setup complete</Stepper.Completed>
</Stepper>
```

- Omit `description` for the label-only state. Completed steps show a check icon.
- Set a step's `color="red"` or `color="error"` for the error state, including shade-qualified colors. Error steps retain their number; a per-step `completedIcon` can override it.
- Set `allowStepSelect={false}` on a step to prevent header navigation. `allowNextStepsSelect={false}` permits returning to completed steps while blocking future steps.
- Customize with Mantine props (`orientation`, `iconPosition`, `iconSize`, `color`, `radius`, icons, and Styles API) when the use case requires it. Use the defaults in apps to preserve the design.
- Stories: `Navigation/Stepper`. Browser regression checks: `pnpm --filter arceus test:stepper-stories`; screenshots live in `packages/ui/__visual__/baselines/Stepper-story-*.png`.

### Feedback

```tsx
import { toastSuccess, toastError } from 'arceus';

toastSuccess(t('message.route.for.i18'));
toastError(t('message.route.for.i18'));
```

- Toasts are the primary feedback mechanism for async operations.
- Use `Alert` for persistent inline messages.
- Use `Loader` for inline loading, `PageLoader` for full-page loading states.

### Guardrails

- Import all UI from the `'arceus'` barrel. Never import `@mantine/core` directly in app code — use Arceus wrappers.
- Never use raw hex values when a palette key exists. If such a case is encountered, flag it in planning. Resolve values from the theme files above.
- Always use `Title` / `Text` with `variant` and `tone` — not raw font sizes; don't use semantic HTML for typography.
- Never override the theme with a custom `createAppTheme` unless explicitly required.
- Do not mix channel brand colors into generic UI elements.
- Use `label` on `Button`, not `children`, when `label` is the established pattern.
- Do not apply more than one gradient element per view.
- Do not set pill radius on buttons unless explicitly designing a special CTA. Badge variants manage pill shapes.
- Never add `aria-label` unless required by the app.
