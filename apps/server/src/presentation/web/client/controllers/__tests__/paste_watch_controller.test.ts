import { GlobalRegistrator } from "@happy-dom/global-registrator";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test";

beforeAll(() => {
  GlobalRegistrator.register();
});

afterAll(async () => {
  await GlobalRegistrator.unregister();
});

const { default: PasteWatchController } = await import("../paste_watch_controller");

let controller: InstanceType<typeof PasteWatchController>;
let dispatched: { eventName: string; detail: unknown }[];
let openCalls: number;
let addressTarget: HTMLElement;
let dotTarget: HTMLElement;

const makePasteEvent = (text: string | null, target: HTMLElement): ClipboardEvent => {
  const event = new Event("paste", { cancelable: true }) as ClipboardEvent;
  Object.defineProperty(event, "clipboardData", { value: text === null ? null : { getData: () => text } });
  Object.defineProperty(event, "target", { value: target });
  return event;
};

beforeEach(() => {
  document.body.innerHTML = "";
  dispatched = [];
  openCalls = 0;
  addressTarget = document.createElement("span");
  dotTarget = document.createElement("span");

  controller = Object.create(PasteWatchController.prototype) as InstanceType<typeof PasteWatchController>;
  Object.defineProperty(controller, "dispatch", {
    configurable: true,
    value: (eventName: string, opts: { detail: unknown }) => {
      dispatched.push({ eventName, detail: opts.detail });
    },
  });
  Object.defineProperty(controller, "addressTarget", { configurable: true, value: addressTarget });
  Object.defineProperty(controller, "dotTarget", { configurable: true, value: dotTarget });
  Object.defineProperty(controller, "hasDialogOutlet", { configurable: true, value: true });
  Object.defineProperty(controller, "dialogOutlet", {
    configurable: true,
    value: {
      open: () => {
        openCalls += 1;
      },
    },
  });
});

describe("paste", () => {
  it("stages a valid address pasted outside any field and opens the confirm dialog", () => {
    controller.paste(makePasteEvent("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", document.body));

    expect(addressTarget.textContent).toBe("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    expect(dotTarget.style.getPropertyValue("--chip-hue")).not.toBe("");
    expect(openCalls).toBe(1);
    expect(dispatched).toEqual([]);
  });

  it("trims surrounding whitespace before validating", () => {
    controller.paste(makePasteEvent("  0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2\n", document.body));

    expect(openCalls).toBe(1);
  });

  it("ignores a paste that lands inside a text field", () => {
    const input = document.createElement("input");
    document.body.append(input);

    controller.paste(makePasteEvent("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", input));

    expect(openCalls).toBe(0);
  });

  it("ignores a paste that lands inside a contenteditable region", () => {
    const editable = document.createElement("div");
    editable.contentEditable = "true";
    const child = document.createElement("span");
    editable.append(child);
    document.body.append(editable);

    controller.paste(makePasteEvent("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", child));

    expect(openCalls).toBe(0);
  });

  it("ignores text that is not a bare wallet address", () => {
    controller.paste(makePasteEvent("not an address", document.body));

    expect(openCalls).toBe(0);
  });

  it("ignores an empty clipboard", () => {
    controller.paste(makePasteEvent("", document.body));

    expect(openCalls).toBe(0);
  });

  it("does nothing when clipboardData is unavailable", () => {
    controller.paste(makePasteEvent(null, document.body));

    expect(openCalls).toBe(0);
  });
});

describe("confirm", () => {
  it("dispatches the staged address", () => {
    controller.paste(makePasteEvent("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", document.body));
    controller.confirm();

    expect(dispatched).toEqual([{ eventName: "paste", detail: { address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" } }]);
  });

  it("does nothing without a staged address", () => {
    controller.confirm();

    expect(dispatched).toEqual([]);
  });

  it("only dispatches once per confirmed paste", () => {
    controller.paste(makePasteEvent("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", document.body));
    controller.confirm();
    controller.confirm();

    expect(dispatched).toHaveLength(1);
  });
});
