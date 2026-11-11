import { describe, expect, it } from "@jest/globals";
import { parseContentPack } from "./parse";
import type { ContentPack } from "../types";

function validPack(overrides: Partial<ContentPack> = {}): ContentPack {
  return {
    schemaVersion: 2,
    contentVersion: "test",
    generatedAt: new Date().toISOString(),
    p5Assets: {},
    courses: [],
    reference: {
      byName: {},
      functionNames: [],
      metadata: {
        generatedAt: new Date().toISOString(),
        p5Version: "2.4.0-rc.1",
        symbolCount: 0,
      },
    },
    ...overrides,
  };
}

describe("parseContentPack", () => {
  it("accepts a valid schema 2 pack", () => {
    const pack = parseContentPack(JSON.stringify(validPack()));
    expect(pack.schemaVersion).toBe(2);
    expect(pack.contentVersion).toBe("test");
  });

  it("rejects unsupported schema versions", () => {
    expect(() =>
      parseContentPack(JSON.stringify(validPack({ schemaVersion: 1 })))
    ).toThrow(/unsupported content pack schema/i);
    expect(() =>
      parseContentPack(JSON.stringify(validPack({ schemaVersion: 99 })))
    ).toThrow(/unsupported content pack schema/i);
  });

  it("rejects incomplete packs", () => {
    const pack = validPack() as any;
    delete pack.reference;
    expect(() => parseContentPack(JSON.stringify(pack))).toThrow(
      /incomplete/i
    );
  });
});
