# Typography

6 semantic variants using Satoshi font. Headings are always bold; text variants support a `bold` modifier.

## Headings

- **`display`** — 32px, Satoshi-Black. Hero text, splash screens.
- **`title`** — 22px, Satoshi-Bold. Screen titles, section headers.
- **`headline`** — 18px, Satoshi-Bold. Card accents, section emphasis.

## Text

- **`body`** — 16px, Satoshi-Regular (bold: Satoshi-Bold). Default text, descriptions.
- **`bodySmall`** — 13px, Satoshi-Regular (bold: Satoshi-Medium). Secondary info, captions.
- **`label`** — 14px, Satoshi-Medium (bold: Satoshi-Bold). Buttons, tabs, chips.

```typescript
<Text variant="title">Screen Title</Text>
<Text variant="headline">Card Accent</Text>
<Text variant="body" bold>Emphasized value</Text>
<Text variant="bodySmall" color="muted">Caption</Text>
```
