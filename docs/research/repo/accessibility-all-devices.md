---
app: repo
topic: Accessibility on every device, including iPadOS and macOS
checked: 2026-10-05
---

# Accessibility on every device

Audit of the navigation plan and [0022](../../decisions/0022-accessibility.md) against official sources. Test layers: [native UI tests](native-ui-tests.md). Colour and contrast: [colour](colour-and-contrast.md). Motion: [0023](../../decisions/0023-motion.md). Nothing here is decided beyond what 0022 now states.

## Decisions

- We treat Mac and iPad as keyboard and pointer devices, not as large phones. HIG asks for full keyboard use, a menu bar with every command, standard shortcuts, secondary-click menus and pointer effects. [1][2][3]
- We rely on Full Keyboard Access for controls and add keyboard focus only for lists, sidebars and fields, because HIG says to avoid custom keyboard navigation for buttons, segmented controls and switches on iPad. [2][4]
- We never move focus when a list row is selected in a split layout, because HIG says changing focus without interaction costs people time. The same holds for `ListDetailSceneStrategy` on Android. [4][11]
- We replace Larger Text snapshots with window-size and display-zoom checks on Mac, because the App Store label does not apply to Mac. [5][6]
- We keep the screen reader cursor still while prices update: stable identity per row, label changed in place, no re-created views. The VoiceOver criteria say a content refresh must not reset the cursor. [7]
- We give every icon-only control a name and a Voice Control input label, and make each list row one element, so "Show numbers" and spoken names work. [7]
- We give every gesture a button or custom action (WCAG 2.5.7), including the sheet drag handle, swipe actions and long-press. [7][8]
- We test Increase Contrast, Reduce Transparency and Bold Text together, and add an increased-contrast token context, because the Sufficient Contrast criteria test them together. [9]
- We replace motion that carries meaning (status change, hierarchy) with a dissolve or highlight under Reduce Motion, and stop decorative motion. [10]
- We declare App Store accessibility labels only for features that pass the manual pass below. [5]
- We set Compose semantics beyond what the checks find: `Role`, `stateDescription`, `heading`, `collectionInfo`, `paneTitle`, `liveRegion`, `error`, custom actions. [11]
- We keep Android windows resizable from 600 dp, because apps targeting API 36 cannot lock orientation there. [12]
- We add reflow, text spacing, forced-colors and increased-contrast checks on the web. [13][14]

## Assistive technology matrix

| Need | iPhone | iPad | Mac | Android | Web |
|---|---|---|---|---|---|
| Screen reader | VoiceOver | VoiceOver | VoiceOver | TalkBack | NVDA, VoiceOver, JAWS |
| Voice | Voice Control | Voice Control | Voice Control | Voice Access | OS voice control |
| Keyboard | Full Keyboard Access | Full Keyboard Access, list focus | Full Keyboard Access, menu bar | Tab, arrows | Tab, visible focus |
| Switch | Switch Control | Switch Control | Switch Control | Switch Access | via the OS |
| Text size | Dynamic Type to AX5 | same | none; window and zoom | font scale 2.0 | zoom 400%, reflow |
| Contrast | Increase Contrast, Reduce Transparency | same | same | high contrast text | `forced-colors`, `prefers-contrast` |
| Motion | Reduce Motion | same | same | animator scale | `prefers-reduced-motion` |

## Manual pass before a release

| Device | Steps |
|---|---|
| iPhone, iPad | VoiceOver through every common task and the rotor by headings; Voice Control with names and numbers; Switch Control scanning; Dynamic Type at AX5; Increase Contrast with Reduce Transparency |
| iPad with keyboard | Full Keyboard Access: Tab between groups, arrows in the list, Return opens, Escape closes sheets |
| Mac | VoiceOver with the menu bar and sidebar; Full Keyboard Access; Voice Control; smallest window and full screen; every command in the menu bar |
| Android | TalkBack through every common task; Switch Access; Voice Access; font scale 2.0; keyboard on a tablet |
| Web | NVDA with Firefox, VoiceOver with Safari; keyboard only; 400% zoom; Windows High Contrast |

Common tasks, as the App Store defines them: first launch, sign-in, adding a wallet, opening a position, setting an alert, settings. [5]

## App Store accessibility labels

| Label | Status in the plan |
|---|---|
| VoiceOver | Audits planned; manual pass and criteria in this file missing |
| Voice Control | Not planned before this file |
| Larger Text | Snapshots planned; not applicable on Mac |
| Dark Interface | Planned: Neon Night |
| Differentiate Without Color Alone | Status is word plus shape; rest to verify |
| Sufficient Contrast | Token test planned; increased-contrast context missing |
| Reduced Motion | Planned; zoom navigation fallback to verify on a device |
| Captions, Audio Descriptions | Not applicable, no media |

## Facts that constrain us

- Labels are voluntary now and become required for new submissions later, on iOS, iPadOS and macOS 26 and later. [5]
- iPadOS supports keyboard navigation in text fields, text views and sidebars; collection views and custom views need the APIs. [2]
- Control and Option are poor modifiers on Mac: the system uses Control for focus and screenshots; Command is the main modifier, Command-comma opens settings. [2]
- HIG uses a focus ring on text and search fields and a full-row highlight in lists and collections. [4]
- Compose focus: components are focusable by default; custom ones need `focusable()`; traversal order follows layout unless `focusProperties` changes it. [11]
- WCAG 2.2 added 2.4.11 focus not obscured, 2.5.7 dragging alternatives, 2.5.8 target size, 3.3.7 redundant entry and 3.3.8 accessible authentication, and removed 4.1.1. [8]

## Open questions

- Does `performAccessibilityAudit` run under the macOS destination on CI runners without extra permission? Measure once ([native UI tests](native-ui-tests.md)).
- 0022 says audits run on every screen; the native UI test note says once per scenario. Pick one.
- Window sizes for iPad Split View, Slide Over and Stage Manager, and the smallest Mac window: not read from Apple pages here.
- How navigation zoom behaves under Reduce Motion and Prefer Cross-Fade Transitions: not documented by Apple.
- Right-to-left layout of the range bar: mirror the labels, keep low to high price left to right? Decide in the component spec.

## Sources

1. Apple HIG, Designing for macOS — https://developer.apple.com/design/human-interface-guidelines/designing-for-macos
2. Apple HIG, Keyboards — https://developer.apple.com/design/human-interface-guidelines/keyboards
3. Apple HIG, Pointing devices — https://developer.apple.com/design/human-interface-guidelines/pointing-devices
4. Apple HIG, Focus and selection — https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
5. App Store Connect, Accessibility Nutrition Labels — https://developer.apple.com/help/app-store-connect/manage-app-accessibility/overview-of-accessibility-nutrition-labels
6. App Store Connect, Larger Text criteria — https://developer.apple.com/help/app-store-connect/manage-app-accessibility/larger-text-evaluation-criteria
7. App Store Connect, VoiceOver criteria — https://developer.apple.com/help/app-store-connect/manage-app-accessibility/voiceover-evaluation-criteria
8. W3C, What's new in WCAG 2.2 — https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
9. App Store Connect, Sufficient Contrast criteria — https://developer.apple.com/help/app-store-connect/manage-app-accessibility/sufficient-contrast-evaluation-criteria
10. App Store Connect, Reduced Motion criteria — https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria
11. Android, Compose semantics and focus — https://developer.android.com/develop/ui/compose/accessibility/semantics ; https://developer.android.com/develop/ui/compose/touch-input/focus
12. Android, large screens — https://developer.android.com/develop/ui/compose/layouts/adaptive/support-different-display-sizes
13. W3C, 1.4.10 Reflow — https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
14. MDN, forced-colors — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors
