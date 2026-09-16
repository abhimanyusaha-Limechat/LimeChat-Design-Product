# NativeSelect

Styled native `<select>` from the **LimeChat Design System — V3**
([Figma node `31:15`](https://www.figma.com/design/Ncj0VUMigW7YqlpYcCB12G/LimeChat-Design-System---V3?node-id=31-15)),
which is Code-Connected to the Mantine v6 `NativeSelect`. This component mirrors
that API.

It wraps a real `<select>` element (styled with `appearance: none` + an overlaid
chevron), so the native dropdown, keyboard behaviour and form semantics are
preserved.

## Usage

```tsx
import { NativeSelect } from './components/Select';

<NativeSelect
  label="Channel"
  description="Where the broadcast goes"
  placeholder="Pick one"
  data={['WhatsApp', 'Instagram', 'Email']}
  value={value}
  onChange={(e) => setValue(e.currentTarget.value)}
/>

<NativeSelect
  label="Reach"
  withAsterisk
  error="This field is required"
  data={[
    { value: 'all', label: 'Everyone' },
    { group: 'Saved', items: [{ value: 's1', label: 'High intent' }] },
  ]}
/>
```

## Props

| Prop           | Type                                              | Default   |
| -------------- | ------------------------------------------------ | --------- |
| `data`         | `(string \| {value,label,disabled} \| {group,items})[]` | —   |
| `label`        | `ReactNode`                                       | —         |
| `description`  | `ReactNode` — sub-label under the label           | —         |
| `placeholder`  | `string` — disabled first option when empty       | —         |
| `error`        | `ReactNode \| boolean` — red control + message    | —         |
| `caption`      | `ReactNode` — helper text below the control       | —         |
| `withAsterisk` | `boolean` — red `*` after the label               | `false`   |
| `variant`      | `default` \| `filled` \| `unstyled`               | `default` |
| `size`         | `xs` \| `sm` \| `md` \| `lg` \| `xl`              | `sm`      |
| `fullWidth`    | `boolean` (root defaults to `320px`)              | `false`   |

Also accepts native `<select>` attributes (`value`, `defaultValue`, `onChange`,
`disabled`, `name`, `required`, `id`, …) and forwards `ref` to the `<select>`.

## Size specs (Figma)

| size | input height | L&R padding | value / label font | helper font | gap → chevron | icon |
| ---- | ------------ | ----------- | ------------------ | ----------- | ------------- | ---- |
| `xs` | 24px         | 12px        | 12 / 16            | 10 / 12.5   | 8px           | 12px |
| `sm` | 32px         | 12px        | 14 / 20            | 12 / 16     | 8px           | 16px |
| `md` | 40px         | 16px        | 16 / 24            | 14 / 20     | 12px          | 16px |
| `lg` | 48px         | 16px        | 18 / 28            | 16 / 24     | 12px          | 16px |
| `xl` | 56px         | 20px        | 20 / 32            | 18 / 28     | 16px          | 16px |

Label is SemiBold `#3c492c`; description / caption are Regular `#808975`; radius `4px`.

## Variants & states

| | |
| --- | --- |
| `default`  | white bg, `#d9d9d9` border |
| `filled`   | `#fafdf6` bg, no border |
| `unstyled` | no bg / border / horizontal padding — value + chevron only |
| **error**  | `#e5484d` border, `#da1b21` value / chevron / message |
| **disabled** | `#f0f0f0` bg, `#bfbfbf` text |
| **focus**  | border → `#6bac1b` + 3px ring |

## Deviation notes

- Native `<select>` can't render a true placeholder; it's emulated with a hidden
  disabled first `<option value="">` and a `data-placeholder` flag that greys the
  value text while empty.
- The chevron is an inline `currentColor` SVG (Tabler `chevron-down`) so it
  recolours with the error state.
