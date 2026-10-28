import { describe, expect, it } from "@jest/globals";
import { parseContentPack } from "./parse";
import type { ContentPack } from "./types";

function validPack(overrides: Partial<ContentPack> = {}): ContentPack {
  return {
    schemaVersion: 1,
    contentVersion: "test",
    generatedAt: new Date().toISOString(),
    p5: {
      version: "2.4.0-rc.1",
      source:
        "/*! p5.js v2.4.0-rc.1 October 20, 2026 */\n" +
        "/* learn-p5-runtime-compat:start */\nvar p5=(function(){\n" +
        "x".repeat(100_000) +
        "\nreturn p5;})();",
    },
    p5Assets: {},
    courses: [],
    reference: {
      byName: {},
      functionNames: [],
      metadata: { generatedAt: new Date().toISOString(), p5Version: "2.4.0-rc.1", symbolCount: 0 },
    },
    ...overrides,
  };
}

describe("parseContentPack", () => {
  it("accepts a complete p5 runtime", () => {
    const pack = parseContentPack(JSON.stringify(validPack()));
    expect(pack.p5.version).toBe("2.4.0-rc.1");
  });

  it("rejects an empty p5 runtime", () => {
    const pack = validPack({ p5: { version: "2.4.0-rc.1", source: "" } });
    expect(() => parseContentPack(JSON.stringify(pack))).toThrow(/incomplete p5\.js runtime/i);
  });

  it("rejects a truncated p5 runtime", () => {
    const pack = validPack();
    pack.p5.source =
      "/*! p5.js v2.4.0-rc.1 October 20, 2026 */\n" +
      "/* learn-p5-runtime-compat:start */\nvar p5=(function(){\n" +
      "x".repeat(100_000);
    expect(() => parseContentPack(JSON.stringify(pack))).toThrow(/truncated p5\.js runtime/i);
  });

  it("rejects a runtime without the compatibility shim", () => {
    const pack = validPack();
    pack.p5.source = pack.p5.source.replace(
      "/* learn-p5-runtime-compat:start */\n",
      ""
    );
    expect(() => parseContentPack(JSON.stringify(pack))).toThrow(
      /unsupported p5\.js runtime/i
    );
  });

  it("rejects a runtime whose header does not match the declared version", () => {
    const pack = validPack();
    pack.p5.source = pack.p5.source.replace("v2.4.0-rc.1", "v2.3.0");
    expect(() => parseContentPack(JSON.stringify(pack))).toThrow(/mismatched p5\.js version/i);
  });
});
