import { Platform } from "react-native";

/**
 * Shared clipboard helper. Mirrors the copy logic used by the exercise view's
 * code editor (navigator.clipboard → hidden-textarea execCommand fallback) and
 * routes through expo-clipboard on native so no WebView or native module is
 * required. Returns true only when the write succeeded.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  if (Platform.OS === "web") {
    return copyWeb(text);
  }
  return copyNative(text);
}

async function copyNative(text: string): Promise<boolean> {
  try {
    const Clipboard = require("expo-clipboard");
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
}

async function copyWeb(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to execCommand fallback
  }
  try {
    if (typeof document === "undefined") return false;
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "-9999px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
