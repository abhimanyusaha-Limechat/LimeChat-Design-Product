# Avatar

From the **LimeChat Design System — V3** ([Figma node `31:53`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=31-53)),
Code-Connected to the Mantine v6 `Avatar`. This component mirrors that API.

## Usage

```tsx
import { Avatar } from './components/Avatar';

<Avatar src="/aditi.jpg" alt="Aditi Rao" />       {/* image */}
<Avatar radius="xl">AR</Avatar>                    {/* initials, circular */}
<Avatar variant="outline" size="lg" />            {/* icon (person glyph) */}
<Avatar size="md"><StarIcon /></Avatar>           {/* custom icon */}

<Avatar.Group limit={3} size="md" radius="xl">
  <Avatar src="/a.jpg" /><Avatar src="/b.jpg" />
  <Avatar src="/c.jpg" /><Avatar src="/d.jpg" />   {/* renders "+1" chip */}
</Avatar.Group>
```

The rendered **type** is derived: `src` → image · string `children` → initials · otherwise → icon.

## Props

| Prop      | Type                                   | Default  |
| --------- | ------------------------------------- | -------- |
| `src`     | `string`                              | —        |
| `alt`     | `string` — also the `aria-label`     | —        |
| `children`| `string` (initials) or a node (icon) | —        |
| `variant` | `light` \| `filled` \| `outline`     | `light`  |
| `size`    | `xs` \| `sm` \| `md` \| `lg` \| `xl` \| `number` (px) | `md` |
| `radius`  | `xs` (4px) \| `xl` (circle) \| `number` (px) | `xs` |

Also accepts native `<div>` attributes and forwards `ref`.

**`Avatar.Group`** — `limit` (collapse the rest into `+N`), plus `size` / `radius`
applied to every child that doesn't set its own.

## Size specs (Figma)

| size | box  | initials font (bold Lato) |
| ---- | ---- | ------------------------- |
| `xs` | 16px | 10 / 12 (SemiBold, uppercase) |
| `sm` | 24px | 12 / 16 |
| `md` | 36px | 16 / 20 |
| `lg` | 56px | 32 / 40 |
| `xl` | 84px | 40 / 48 |

Icon fills 62.5% of the box. A numeric `size` scales the initials font to ~42% of the box.

## Colour tokens (primary family)

| variant   | background                              | foreground |
| --------- | -------------------------------------- | ---------- |
| `light`   | `#f1f7e9` (`background/primary/light`)  | `#6bac1b`  |
| `filled`  | `#6bac1b` (`background/primary/filled`) | `#ffffff`  |
| `outline` | transparent, 1px `#6bac1b` border      | `#6bac1b`  |
| image     | `#808975` fallback fill (`text/dimmed`) | —          |

## Deviation notes

- The Figma component exposes only `xs` (4px) and `xl` (circle) radius as
  variants; a numeric `radius` is also accepted (the underlying Mantine prop).
- A broken/failed image keeps the neutral `#808975` fill and shows a white person
  glyph, rather than disappearing.
- `Avatar.Group` isn't in this node (it's a sibling component in the file) — a
  lightweight implementation is included here as a common pairing.
