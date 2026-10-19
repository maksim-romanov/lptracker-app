# Overlays

## Bottom sheet

*overlay, scoped tasks only*

- **Use.** Add wallet, set alert, sign in, share options, and position details on phone. Not for navigation.
- **Anatomy.** Handle, title, close button, content, primary action at the bottom.
- **Size.** Detents at medium and large on phone; centred dialog or side sheet on wide layouts.
- **Rules.** The handle is also a button. Dragging always has a Cancel or Done. The page behind is inert. Closing returns focus to the opener.
- **Motion.** `gentle` in and out; scrim fades with `fast`.

## Dialog

*overlay, confirm and form*

- **Variants.** Confirmation (short, destructive action named), form dialog (Add wallet on wide layouts).
- **Rules.** The safe action comes first. One dialog at a time. The title says the object ("Remove vitalik.eth?"), the body says the consequence.
- **A11y.** Role dialog or alertdialog, focus moves in and is trapped, Escape closes.
- **Width.** 480 on wide layouts (*design-pending*); full width sheet on phone.
