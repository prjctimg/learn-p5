import type { GitHubAuthState, Sketch, SketchFile } from "../../types";
import { readSketchFileText } from "./sketchspace";

const API = "https://api.github.com";

async function ghFetch(path: string, auth: GitHubAuthState, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub API ${res.status}: ${text || res.statusText}`);
  }
  return res;
}

function isTextSyncable(file: SketchFile): boolean {
  if (file.kind === "asset") return false;
  if (file.mimeType.startsWith("image/") || file.mimeType.startsWith("audio/") || file.mimeType.startsWith("font/")) return false;
  // binary models etc kept local
  if (/\.(png|jpe?g|gif|webp|avif|bmp|mp3|wav|ogg|m4a|aac|flac|ttf|otf|woff2?|obj|stl)$/i.test(file.name)) return false;
  return true;
}

export interface GistSyncResult {
  gistId: string;
  gistUrl: string;
  updatedAt: string;
}

export async function syncSketchToGist(auth: GitHubAuthState, sketch: Sketch): Promise<GistSyncResult> {
  const files: Record<string, { content: string }> = {};
  for (const file of sketch.files) {
    if (!isTextSyncable(file)) continue;
    const content = await readSketchFileText(file);
    // Gist filenames can't have slashes; flatten path.
    const gistName = file.path.replace(/\//g, "__");
    files[gistName] = { content };
  }
  const manifest = {
    format: "learn-p5-sketchspace",
    version: 1,
    name: sketch.name,
    entryFile: sketch.entryFile,
    addons: sketch.addons,
    localOnlyFiles: sketch.files.filter((f) => !isTextSyncable(f)).map((f) => ({ path: f.path, kind: f.kind, mimeType: f.mimeType, size: f.size })),
    syncedAt: new Date().toISOString(),
  };
  files["playground.manifest.json"] = { content: JSON.stringify(manifest, null, 2) };

  const body = {
    description: `Learn P5 Sketchspace: ${sketch.name}`,
    public: false,
    files,
  };

  const path = sketch.gistId ? `/gists/${sketch.gistId}` : "/gists";
  const method = sketch.gistId ? "PATCH" : "POST";
  const res = await ghFetch(path, auth, { method, body: JSON.stringify(body) });
  const data = await res.json();
  return {
    gistId: data.id as string,
    gistUrl: data.html_url as string,
    updatedAt: data.updated_at as string,
  };
}

export async function fetchGist(auth: GitHubAuthState, gistId: string) {
  const res = await ghFetch(`/gists/${gistId}`, auth);
  return res.json();
}
