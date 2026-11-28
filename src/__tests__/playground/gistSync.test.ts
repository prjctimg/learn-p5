import { describe, expect, it, jest } from "@jest/globals";

jest.mock("../../utils/playground/sketchspace", () => ({
  readSketchFileText: jest.fn(async (f: any) => f.content || `content:${f.path}`),
}));

// eslint-disable-next-line import/first
import { syncSketchToGist } from "../../utils/playground/githubGistSync";

describe("githubGistSync", () => {
  it("syncs text files and keeps binary assets local-only in manifest", async () => {
    const fetchMock = jest.fn(async () => ({
      ok: true,
      json: async () => ({ id: "gist1", html_url: "https://gist.github.com/gist1", updated_at: "2026-01-01T00:00:00Z" }),
    }));
    (globalThis as any).fetch = fetchMock;

    const result = await syncSketchToGist(
      { accessToken: "tok", user: { login: "me" } },
      {
        id: "s1",
        name: "My Sketch",
        createdAt: "now",
        updatedAt: "now",
        entryFile: "sketch.js",
        addons: [],
        files: [
          { id: "f1", name: "sketch.js", path: "sketch.js", kind: "code", mimeType: "text/javascript", size: 10, uri: "file://sketch.js", content: "circle(1,2,3)", source: "local", updatedAt: "now" },
          { id: "f2", name: "cat.png", path: "assets/cat.png", kind: "asset", mimeType: "image/png", size: 100, uri: "file://cat.png", source: "local", updatedAt: "now" },
        ],
      } as any
    );

    expect(result.gistId).toBe("gist1");
    const call = fetchMock.mock.calls[0] as any[];
    const body = JSON.parse(call[1].body as string);
    expect(body.files["sketch.js"]).toBeDefined();
    expect(body.files["assets__cat.png"]).toBeUndefined();
    const manifest = JSON.parse(body.files["playground.manifest.json"].content);
    expect(manifest.localOnlyFiles[0].path).toBe("assets/cat.png");
  });
});
