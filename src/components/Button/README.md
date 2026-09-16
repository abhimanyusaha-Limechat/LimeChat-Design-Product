# Button

From the **LimeChat Design System — V3** ([Figma node `30:3`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=30-3)),
which is Code-Connected to the `arceus` / Mantine v6 `Button`. This component
mirrors that API.

## Usage

```tsx
import { Button } from './components/Button';

<Button>Save</Button>
<Button variant="outline" color="red" size="md" leftSection={<TrashIcon />}>
  Delete
</Button>
<Button variant="light" color="green" loading>Saving…</Button>
<Button variant="subtle" color="gray" href="/back">Back</Button>
```

## Props

| Prop            | Type                                                            | Default     |
| --------------- | ------------------------------------------------------------- | ----------- |
| `variant`       | `filled` \| `light` \| `outline` \| `subtle` \| `white` \| `default` | `filled` |
| `color`         | `primary` \| `green` \| `gray` \| `red` \| `yellow`             | `primary`   |
| `size`          | `xs` \| `sm` \| `md` \| `lg` \| `xl`                            | `sm`        |
| `leftSection` / `rightSection` | `ReactNode`                                     | —           |
| `fullWidth`     | `boolean`                                                     | `false`     |
| `loading`       | `boolean` — spinner + blocks interaction                      | `false`     |
| `textTransform` | `capitalize` \| `none` — the DS capitalises labels            | `capitalize`|
| `href`          | `string` — render an `<a role="button">` instead of a `<button>` | —        |

Also accepts native `<button>` / `<a>` attributes (`onClick`, `disabled`, `aria-*`, `form`, …) and forwards `ref`.

`color` maps to the token families: `green`→success, `red`→error, `yellow`→warning.

## Size specs (Figma "Button Sizes" table)

| size | font (Button/\*) bold | L&R padding | height |
| ---- | -------------------- | ----------- | ------ |
| `xs` | 12 / 16              | 12px        | 24px   |
| `sm` | 14 / 20              | 16px        | 32px   |
| `md` | 16 / 24              | 20px        | 40px   |
| `lg` | 18 / 28              | 24px        | 48px   |
| `xl` | 20 / 32              | 32px        | 56px   |

Gap `8px` (`spacing/xs`), radius `4px` (`radius/2xs`). Icons render at `16px`
(`12px` for `xs`).

## Colour tokens

| color  | filled / hover        | light / hover         | text (light·outline·subtle·white) | border (outline) |
| ------ | --------------------- | --------------------- | --------------------------------- | ---------------- |
| primary| `#6bac1b` / `#508014` | `#f1f7e9` / `#edf5e3` | `#6bac1b`                         | `#6bac1b`        |
| green  | `#16a34a` / `#007729` | `#e8f6ed` / `#e3f4e9` | `#16a34a`                         | `#16a34a`        |
| gray   | `#bfbfbf` / `#8c8c8c` | `#f3f4f3` / `#f0f0ef` | `#8c8c8c`                         | `#d9d9d9`        |
| red    | `#e5484d` / `#da1b21` | `#fceaea` / `#fae5e5` | `#da1b21`                         | `#e5484d`        |
| yellow | `#e8a325` / `#c68610` | `#fcf2e7` / `#faeee1` | `#c68610`                         | `#e8a325`        |

`default` variant: white bg, `#d9d9d9` border, `#3c492c` text, `#fafafa` hover.
`white` variant: white bg + `0 1px 2px rgba(0,0,0,.06)` shadow, colour text.
Disabled (all variants): `#f0f0f0` bg / `#bfbfbf` text.

## Deviation notes

- Figma exposes `Disabled` only for the `filled` variant; it's generalised to
  every variant here using the same `background/disabled/default` /
  `text/disabled/default` tokens.
- `loading` and `fullWidth` are in Figma's "Excluded Properties" list (they exist
  on the underlying Mantine component but aren't drawn as variants) — implemented
  here since they're part of that component's contract.
- The top navigation bar's `Voice call` / `Ticket` CTAs use this component
  (`variant="default" size="sm"`), matching the Figma Code Connect mapping.
