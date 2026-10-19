# Rendering modes

The system may restyle a widget. The structure must survive every mode.

| Mode | Condition | Structure rule |
|---|---|---|
| Full colour | Home Screen default | Surface and ink come from tokens; the Fill is chosen by the configuration |
| Accented (tinted) | Home Screen tint style | The system replaces colour with one tint. Status stays a word and a shape. Group parts that take the accent; the rest stays neutral |
| Vibrant | Lock Screen | Single colour with levels of opacity. Contrast is checked across the lightest and darkest wallpaper |
| Reduced luminance | Always On | Dimmed; text must stay legible |
| Transparency changes | System glass or opacity setting | No part of the structure relies on a particular background |

> **Rule.** The widget draws its own background as one removable group, so the system can remove it without breaking the layout.
