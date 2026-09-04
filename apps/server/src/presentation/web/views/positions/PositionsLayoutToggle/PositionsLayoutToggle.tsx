import { Icon, type TIconName } from "../../components/Icon/Icon";

const OPTIONS: { layout: string; icon: TIconName; label: string }[] = [
  { layout: "table", icon: "rows", label: "Table view" },
  { layout: "cards", icon: "cards", label: "Card view" },
];

const OPTION_CLASS =
  "flex cursor-pointer items-center justify-center p-1.5 text-on-surface-variant hover:text-on-surface aria-pressed:bg-surface-variant aria-pressed:text-on-surface";

export const PositionsLayoutToggle = () => (
  <fieldset
    aria-label="Layout"
    class="inline-flex divide-x divide-outline-variant overflow-hidden rounded-sm border border-outline-variant"
    data-controller="layout"
    data-action="board:refresh@document->layout#sync"
  >
    {OPTIONS.map((option) => (
      <button
        type="button"
        data-layout={option.layout}
        data-layout-target="option"
        data-action="layout#choose"
        aria-pressed="false"
        aria-label={option.label}
        title={option.label}
        class={OPTION_CLASS}
      >
        <Icon name={option.icon} size={16} />
      </button>
    ))}
  </fieldset>
);
