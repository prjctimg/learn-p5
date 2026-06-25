import AsyncStorage from "@react-native-async-storage/async-storage";
import { importMap } from "./importmap";
import { APP_VERSION } from "../../constants/Version";

const CACHE_VERSION_KEY = "cm_cache_version";
const CACHE_PREFIX = "cm_src_";

export async function getCachedSources(): Promise<Record<string, string> | null> {
  try {
    const version = await AsyncStorage.getItem(CACHE_VERSION_KEY);
    if (version !== APP_VERSION) return null;
    const entries = await AsyncStorage.multiGet(
      Object.keys(importMap).map((k) => CACHE_PREFIX + k)
    );
    const sources: Record<string, string> = {};
    for (const [key, val] of entries) {
      if (val) sources[key.replace(CACHE_PREFIX, "")] = val;
    }
    return Object.keys(sources).length === Object.keys(importMap).length ? sources : null;
  } catch {
    return null;
  }
}

export async function fetchAndCacheSources(
  onProgress?: (loaded: number, total: number) => void
): Promise<Record<string, string> | null> {
  try {
    const entries = Object.entries(importMap);
    const sources: Record<string, string> = {};
    for (let i = 0; i < entries.length; i++) {
      const [name, url] = entries[i];
      const res = await fetch(url);
      sources[name] = await res.text();
      onProgress?.(i + 1, entries.length);
    }
    const pairs: [string, string][] = Object.entries(sources).map(
      ([k, v]) => [CACHE_PREFIX + k, v] as [string, string]
    );
    pairs.push([CACHE_VERSION_KEY, APP_VERSION]);
    await AsyncStorage.multiSet(pairs);
    return sources;
  } catch {
    return null;
  }
}

export function buildImportMapJson(): string {
  return JSON.stringify({ imports: importMap }, null, 2);
}

export function buildCachedSetup(sources: Record<string, string>): string {
  const filtered: Record<string, string> = {};
  for (const name of Object.keys(importMap)) {
    if (sources[name]) {
      filtered[name] = sources[name];
    } else {
      filtered[name] = importMap[name];
    }
  }
  const dataJson = JSON.stringify(filtered).replace(/<\/script>/gi, "<\\/script>");
  return `<script>window.__cmSources=${dataJson}<\/script>
<script>
(function(){
var s=window.__cmSources,m={},e=document.createElement("script");
e.type="importmap";
for(var n in s)m[n]=URL.createObjectURL(new Blob([s[n]],{type:"text/javascript"}));
e.textContent=JSON.stringify({imports:m});
document.head.appendChild(e);
})();
<\/script>`;
}
