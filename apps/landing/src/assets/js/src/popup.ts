type TallyOpenOptions = {
  layout?: "default" | "modal";
  hideTitle?: boolean;
  overlay?: boolean;
};

type TallyWindow = Window & {
  Tally?: { openPopup: (formId: string, options?: TallyOpenOptions) => void };
};

const EMBED_SRC = "https://tally.so/widgets/embed.js";
const TRIGGER_ATTR = "data-popup-tally";
const REOPEN_GUARD_MS = 500;

let loading: Promise<void> | null = null;
let lastOpenedAt = 0;

function loadEmbed(): Promise<void> {
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const w = window as TallyWindow;
    if (w.Tally) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${EMBED_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("tally embed failed to load")));
      return;
    }
    const s = document.createElement("script");
    s.src = EMBED_SRC;
    s.async = true;
    s.addEventListener("load", () => resolve());
    s.addEventListener("error", () => reject(new Error("tally embed failed to load")));
    document.head.appendChild(s);
  });
  return loading;
}

document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const target = event.target;
  if (!(target instanceof Element)) return;
  const trigger = target.closest<HTMLAnchorElement>(`[${TRIGGER_ATTR}]`);
  if (!trigger) return;

  const formId = trigger.getAttribute(TRIGGER_ATTR);
  if (!formId) return;

  event.preventDefault();

  const now = performance.now();
  if (now - lastOpenedAt < REOPEN_GUARD_MS) return;
  lastOpenedAt = now;

  loadEmbed()
    .then(() => {
      (window as TallyWindow).Tally?.openPopup(formId, {
        layout: "modal",
        hideTitle: true,
        overlay: true,
      });
    })
    .catch(() => {
      loading = null;
      if (trigger.href) location.href = trigger.href;
    });
});

export {};
