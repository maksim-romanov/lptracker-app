import { Button } from "../../components/Button/Button";

// Four shapes, no meaning — the panel is the one place on this screen that is selling rather
// than reporting, and it carries the whole weight of a first visit. They are drawn in the
// container's own text colour at an opacity the panel's copy still clears 4.5:1 through.
const BLOBS = [
  "M0 12C34 2 62 8 78 30c16 22 8 48-14 60C42 102 14 92 4 66-4 46-4 26 0 12Z",
  "M50 0c8 18 24 14 34 26s2 30-2 44-22 30-38 28S12 82 6 66-2 32 12 20 42-18 50 0Z",
  "M22 8c14-10 34-10 48 2s16 32 8 48-26 26-42 22S6 60 6 42 8 18 22 8Z",
  "M50 4c20 0 34 16 34 36S70 96 50 96 16 60 16 40 30 4 50 4Z",
];

// The empty state is the pitch, not an apology for having nothing: watching an address is the
// thing that makes this app usable in ten seconds, and it is the one moment where saying so
// costs the user nothing.
export const NoWallets = () => (
  <div class="relative overflow-hidden rounded-lg bg-primary-container px-6 py-10 text-center">
    {BLOBS.map((path, index) => (
      <svg class={`blob blob-${index + 1}`} viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
        <path d={path} />
      </svg>
    ))}

    <div class="relative flex flex-col items-center gap-4">
      {/* Ordinary text roles, not the container's: this is a paragraph on a tinted panel, and
          prose set in the accent colour is legible without being readable. */}
      <div class="flex flex-col gap-2">
        <h2 class="text-headline text-on-surface">Watch a wallet without connecting it</h2>
        {/* Opaque, not the muted alpha: alpha text loses contrast as the ground beneath it
            darkens, and the ground here is mottled by the shapes. Size and weight carry the
            step down from the heading instead. */}
        <p class="text-body-small text-on-surface">Paste an address and Depthly starts tracking. Nothing is signed.</p>
      </div>
      <Button
        data-action="wallet#openSidebar"
        aria-haspopup="dialog"
        class="rounded-full border-transparent bg-primary px-5 py-2 text-button text-on-primary"
      >
        Paste address
      </Button>
    </div>
  </div>
);
