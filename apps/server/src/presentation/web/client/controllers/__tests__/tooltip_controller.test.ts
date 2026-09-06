import { GlobalRegistrator } from "@happy-dom/global-registrator";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test";

beforeAll(() => {
  GlobalRegistrator.register();
});

afterAll(async () => {
  await GlobalRegistrator.unregister();
});

const { default: TooltipController } = await import("../tooltip_controller");

type TTestableController = Omit<InstanceType<typeof TooltipController>, "trigger"> & { bubbleTarget: HTMLElement; trigger: HTMLElement | null };
type TStubbedPopover = HTMLElement & { showPopover: () => void; hidePopover: () => void };

let controller: TTestableController;
let bubble: TStubbedPopover;
let showCalls: number;
let hideCalls: number;

const stubPopover = (element: HTMLElement): TStubbedPopover => {
  const stubbed = element as TStubbedPopover;
  stubbed.showPopover = () => {
    showCalls += 1;
  };
  stubbed.hidePopover = () => {
    hideCalls += 1;
  };
  return stubbed;
};

const makeTrigger = (options: { tooltip?: string; clipped?: boolean; text?: string; className?: string } = {}): HTMLElement => {
  const trigger = document.createElement("span");
  if (options.tooltip !== undefined) trigger.dataset.tooltip = options.tooltip;
  if (options.className) trigger.className = options.className;
  trigger.textContent = options.text ?? "some text";
  Object.defineProperty(trigger, "scrollWidth", { configurable: true, value: options.clipped ? 100 : 50 });
  Object.defineProperty(trigger, "clientWidth", { configurable: true, value: 50 });
  document.body.append(trigger);
  return trigger;
};

const showFrom = (target: HTMLElement): void => {
  const event = new Event("mouseover", { bubbles: true });
  Object.defineProperty(event, "target", { value: target });
  controller.show(event);
};

beforeEach(() => {
  document.body.innerHTML = "";
  showCalls = 0;
  hideCalls = 0;

  controller = Object.create(TooltipController.prototype) as TTestableController;
  bubble = stubPopover(document.createElement("div"));
  document.body.append(bubble);
  controller.bubbleTarget = bubble;
  controller.trigger = null;
});

describe("show — visible-text fallback (.sr-only stripping)", () => {
  it("strips .sr-only content from the tooltip text", () => {
    const trigger = makeTrigger({ className: "truncate", clipped: true });
    trigger.innerHTML = 'WETH <span class="sr-only">on Ethereum</span>';

    showFrom(trigger);

    expect(bubble.textContent).toBe("WETH");
  });

  it("returns the full text when there is no .sr-only content", () => {
    const trigger = makeTrigger({ className: "truncate", clipped: true, text: "WETH / USDC" });

    showFrom(trigger);

    expect(bubble.textContent).toBe("WETH / USDC");
  });
});

describe("show — clipped-label gating", () => {
  it("shows a tooltip built from visible text when the label is actually clipped", () => {
    const trigger = makeTrigger({ className: "truncate", clipped: true, text: "a very long label" });

    showFrom(trigger);

    expect(bubble.textContent).toBe("a very long label");
    expect(showCalls).toBe(1);
  });

  it("does not show a tooltip when the label fits and carries no explicit text", () => {
    const trigger = makeTrigger({ className: "truncate", clipped: false });

    showFrom(trigger);

    expect(showCalls).toBe(0);
  });
});

describe("show — data-tooltip", () => {
  it("uses the explicit data-tooltip text regardless of clipping", () => {
    const trigger = makeTrigger({ tooltip: "0xC02a…6Cc2", clipped: false });

    showFrom(trigger);

    expect(bubble.textContent).toBe("0xC02a…6Cc2");
    expect(showCalls).toBe(1);
  });

  it("is a no-op when the trigger is unchanged from the previous call", () => {
    const trigger = makeTrigger({ tooltip: "same" });

    showFrom(trigger);
    bubble.textContent = "mutated by the test";
    showFrom(trigger);

    expect(bubble.textContent).toBe("mutated by the test");
    expect(showCalls).toBe(1);
  });

  it("hides when the event target has neither a tooltip trigger nor a truncate ancestor", () => {
    const trigger = makeTrigger({ tooltip: "x" });
    showFrom(trigger);

    const other = document.createElement("span");
    document.body.append(other);
    showFrom(other);

    expect(hideCalls).toBe(1);
    expect(controller.trigger).toBeNull();
  });
});

describe("hide", () => {
  it("hides the popover once a trigger is active", () => {
    const trigger = makeTrigger({ tooltip: "x" });
    showFrom(trigger);

    controller.hide();

    expect(hideCalls).toBe(1);
    expect(controller.trigger).toBeNull();
  });

  it("is a no-op when nothing is currently shown", () => {
    controller.hide();

    expect(hideCalls).toBe(0);
  });
});

describe("dismiss", () => {
  it("hides on Escape", () => {
    const trigger = makeTrigger({ tooltip: "x" });
    showFrom(trigger);

    controller.dismiss(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(hideCalls).toBe(1);
  });

  it("ignores other keys", () => {
    const trigger = makeTrigger({ tooltip: "x" });
    showFrom(trigger);

    controller.dismiss(new KeyboardEvent("keydown", { key: "Enter" }));

    expect(hideCalls).toBe(0);
  });
});
