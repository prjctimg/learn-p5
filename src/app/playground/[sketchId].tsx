import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text, Pressable, StyleSheet, Modal, ScrollView, TextInput, Alert, Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
// safe area not needed here
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { WebView } from "react-native-webview";
import Header from "../../components/Header";
import { useThemeContext } from "../../components/ThemeProvider";
import { Colors } from "../../constants/Colors";
import { DEFAULTS } from "../../constants/Defaults";
import { useRuntimeAssets } from "../../hooks/useRuntimeAssets";
import { getPlaygroundHtml } from "../../utils/editor/playgroundHtml";
import type { Sketch, SketchAddon, P5AddonCatalogEntry, GitHubAuthState } from "../../types";
import {
  getSketch, saveTextSketchFile, importBinaryAsset, setSketchAddons, updateSketch,
} from "../../utils/playground/sketchspace";
import { readAsDataUrl, dataUrlToBase64 } from "../../utils/playground/fileStore";
import { detectP5AssetType, evaluateAddonCompatibility } from "../../utils/playground/p5Assets";
import { P5_ADDON_CATALOG } from "../../data/p5Addons";
import { createId } from "../../utils/playground/id";
import {
  loadGitHubAuth, clearGitHubAuth, signInWithToken, getGitHubRedirectUri, exchangeGitHubCode, useGitHubAuthRequest,
} from "../../utils/playground/githubAuth";
import { syncSketchToGist } from "../../utils/playground/githubGistSync";
// (unused import removed)

import { parseFrameInput } from "../../utils/playground/frames";

async function buildAssetMap(sketch: Sketch): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  for (const file of sketch.files) {
    if (file.kind === "code" && file.path === sketch.entryFile) continue;
    try {
      if (file.uri.startsWith("webfile://")) {
        map[file.path] = await readAsDataUrl(file.uri, file.mimeType);
      } else {
        // Native file URI - WebView can read with allowFileAccess
        map[file.path] = file.uri;
      }
      // also map by basename for convenience
      const base = file.path.split("/").pop();
      if (base && !map[base]) map[base] = map[file.path];
    } catch {
      // ignore missing asset
    }
  }
  return map;
}

export default function PlaygroundSketchScreen() {
  const { sketchId } = useLocalSearchParams<{ sketchId: string }>();
  const router = useRouter();
  // (no safe area inset usage)
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme];
  const runtimeAssets = useRuntimeAssets({ editor: true });
  const webViewRef = useRef<WebView>(null);

  const [sketch, setSketch] = useState<Sketch | null>(null);
  const [, setCode] = useState("");
  const [initialCode, setInitialCode] = useState("");
  const [htmlKey, setHtmlKey] = useState(0);
  const [assetMap, setAssetMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [addonsVisible, setAddonsVisible] = useState(false);
  const [captureVisible, setCaptureVisible] = useState(false);
  const [syncVisible, setSyncVisible] = useState(false);
  const [frameInput, setFrameInput] = useState("0, 30, 60");
  const [capturedFrames, setCapturedFrames] = useState<{ frame: number; dataUrl: string }[]>([]);
  const [githubAuth, setGithubAuth] = useState<GitHubAuthState | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const [, response, promptAsync] = useGitHubAuthRequest(clientId);

  const load = useCallback(async () => {
    if (!sketchId) return;
    setLoading(true);
    try {
      const s = await getSketch(sketchId);
      setSketch(s);
      if (s) {
        const entry = s.files.find((f) => f.path === s.entryFile) ?? s.files.find((f) => f.path.endsWith(".js"));
        let nextCode = "";
        if (entry) {
          if (typeof entry.content === "string") nextCode = entry.content;
          else {
            const { readTextFile } = await import("../../utils/playground/fileStore");
            nextCode = await readTextFile(entry.uri);
          }
        }
        setCode(nextCode);
        setInitialCode(nextCode);
        setAssetMap(await buildAssetMap(s));
        setHtmlKey((k) => k + 1);
      }
      setGithubAuth(await loadGitHubAuth());
    } finally {
      setLoading(false);
    }
  }, [sketchId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (response?.type === "success" && clientId) {
      const { code } = response.params;
      (async () => {
        try {
          const token = await exchangeGitHubCode({ code, clientId, clientSecret: clientSecret || undefined, redirectUri: getGitHubRedirectUri() });
          const auth = await signInWithToken(token);
          setGithubAuth(auth);
          setStatus("GitHub connected");
        } catch (e: any) {
          setStatus(`GitHub OAuth failed: ${e.message || String(e)}. You can paste a personal access token instead.`);
        }
      })();
    }
  }, [response, clientId, clientSecret]);

  const html = useMemo(() => {
    if (!sketch || !runtimeAssets.ready) return null;
    return getPlaygroundHtml({
      code: initialCode,
      colorScheme,
      editorTheme: "p5-learn",
      codeFontSize: DEFAULTS.codeFontSize,
      ctaColor: derivedColors.primary,
      wordWrap: false,
      assetMap,
      addons: sketch.addons,
      sketchName: sketch.name,
    }, runtimeAssets.urls);
  }, [sketch, runtimeAssets.ready, runtimeAssets.urls, initialCode, colorScheme, derivedColors.primary, assetMap, htmlKey]);

  const saveCode = useCallback(async (nextCode: string) => {
    if (!sketch) return;
    setCode(nextCode);
    const updated = await saveTextSketchFile(sketch.id, sketch.entryFile, nextCode, "text/javascript", "code");
    if (updated) setSketch(updated);
  }, [sketch]);

  const onMessage = useCallback(async (event: { nativeEvent: { data: string } }) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      switch (msg.type) {
        case "codeChange":
          await saveCode(msg.code ?? "");
          break;
        case "exportPng":
          if (msg.dataUrl) await savePngDataUrl(msg.dataUrl, `${sketch?.name || "sketch"}.png`);
          break;
        case "captureComplete":
          setCapturedFrames(Array.isArray(msg.frames) ? msg.frames : []);
          if (msg.frames?.length) setStatus(`Captured ${msg.frames.length} frame(s)`);
          break;
        case "console":
          // optionally show status on errors
          if (msg.level === "error") setStatus(String(msg.message || "Error"));
          break;
      }
    } catch {}
  }, [saveCode, sketch?.name]);

  async function savePngDataUrl(dataUrl: string, name: string) {
    const base64 = dataUrlToBase64(dataUrl);
    if (Platform.OS === "web") {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = name;
      a.click();
      return;
    }
    const dir = `${FileSystem.cacheDirectory}playground-exports/`;
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const uri = `${dir}${Date.now()}-${name}`;
    await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Export PNG" });
    } else {
      Alert.alert("Exported", `Saved to ${uri}`);
    }
  }

  const handleImportAsset = async () => {
    if (!sketch) return;
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: true });
    if (result.canceled) return;
    for (const asset of result.assets) {
      const name = asset.name || "asset";
      const mimeType = asset.mimeType || "application/octet-stream";
      const detected = detectP5AssetType(name, mimeType);
      if (!detected) {
        Alert.alert("Unsupported asset", `"${name}" is not a recognized p5.js asset type. You can still import it, but p5 loaders may not support it.`);
      }
      if (detected?.requiresAddon) {
        Alert.alert("Addon required", `${detected.label} files may require ${detected.requiresAddon}. Add the addon in Addons if needed.`);
      }
      try {
        if (Platform.OS === "web") {
          const resp = await fetch(asset.uri);
          const blob = await resp.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          });
          await importBinaryAsset(sketch.id, name, dataUrlToBase64(dataUrl), mimeType);
        } else {
          const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
          await importBinaryAsset(sketch.id, name, base64, mimeType);
        }
      } catch (e: any) {
        Alert.alert("Import failed", e.message || String(e));
      }
    }
    await load();
    setStatus("Assets imported");
  };

  const handleAddAddon = async (entry: P5AddonCatalogEntry) => {
    if (!sketch) return;
    const compat = evaluateAddonCompatibility(entry);
    const proceed = async () => {
      const addon: SketchAddon = {
        id: createId("addon"),
        name: entry.name,
        url: entry.url,
        version: entry.version,
        enabled: true,
        compatibility: compat.compatibility,
        compatibilityMessage: compat.message,
        addedAt: new Date().toISOString(),
      };
      const next = [...sketch.addons.filter((a) => a.url !== entry.url), addon];
      const updated = await setSketchAddons(sketch.id, next);
      if (updated) { setSketch(updated); await load(); }
    };
    if (compat.compatibility !== "compatible") {
      Alert.alert("Addon compatibility warning", compat.message, [
        { text: "Cancel", style: "cancel" },
        { text: "Add anyway", onPress: () => { void proceed(); } },
      ]);
    } else {
      await proceed();
    }
  };

  const handleToggleAddon = async (addon: SketchAddon) => {
    if (!sketch) return;
    const next = sketch.addons.map((a) => a.id === addon.id ? { ...a, enabled: !a.enabled } : a);
    const updated = await setSketchAddons(sketch.id, next);
    if (updated) { setSketch(updated); await load(); }
  };

  const handleRemoveAddon = async (addon: SketchAddon) => {
    if (!sketch) return;
    const next = sketch.addons.filter((a) => a.id !== addon.id);
    const updated = await setSketchAddons(sketch.id, next);
    if (updated) { setSketch(updated); await load(); }
  };

  const handleCaptureFrames = () => {
    const frames = parseFrameInput(frameInput, DEFAULTS.playgroundMaxFrameCaptures);
    if (frames.length === 0) {
      Alert.alert("Invalid frames", "Enter frame numbers like 0, 30, 60 or ranges like 0-120 step 10.");
      return;
    }
    setCapturedFrames([]);
    webViewRef.current?.postMessage(JSON.stringify({ type: "captureFrames", frames }));
    setCaptureVisible(false);
    setStatus(`Capturing ${frames.length} frame(s)...`);
  };

  const handleExportCapturedFrames = async () => {
    if (capturedFrames.length === 0) return;
    for (let i = 0; i < capturedFrames.length; i++) {
      const f = capturedFrames[i];
      await savePngDataUrl(f.dataUrl, `${sketch?.name || "sketch"}-frame-${f.frame}.png`);
    }
  };

  const handleSync = async () => {
    if (!sketch) return;
    if (!githubAuth) { Alert.alert("Not connected", "Connect GitHub first."); return; }
    setSyncing(true);
    try {
      const result = await syncSketchToGist(githubAuth, sketch);
      const updated = await updateSketch(sketch.id, (s) => ({ ...s, gistId: result.gistId, gistUrl: result.gistUrl, lastSyncedAt: new Date().toISOString(), lastSyncedGistUpdatedAt: result.updatedAt }));
      if (updated) setSketch(updated);
      setStatus("Synced to GitHub Gist");
      Alert.alert("Synced", `Sketch synced to gist.\n${result.gistUrl}\n\nBinary assets are saved locally on your device and were not uploaded.`);
    } catch (e: any) {
      Alert.alert("Sync failed", e.message || String(e));
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectToken = async () => {
    if (!tokenInput.trim()) return;
    try {
      const auth = await signInWithToken(tokenInput.trim());
      setGithubAuth(auth);
      setTokenInput("");
      setStatus("GitHub connected");
    } catch (e: any) {
      Alert.alert("GitHub sign-in failed", e.message || String(e));
    }
  };

  const handleOAuth = async () => {
    if (!clientId.trim()) {
      Alert.alert("Missing Client ID", "Enter a GitHub OAuth App client ID, or use a personal access token below.");
      return;
    }
    try {
      await promptAsync();
    } catch (e: any) {
      Alert.alert("OAuth failed", e.message || String(e));
    }
  };

  if (loading || !sketch) {
    return (
      <View style={[styles.center, { backgroundColor: colors.surface }]}>
        <Text style={{ color: colors.textSecondary, fontFamily: "JetBrainsMono" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Header title={sketch.name} onBack={() => router.back()} />
      <View style={styles.actionRow}>
        <ActionBtn icon="play" label="Run" onPress={() => webViewRef.current?.postMessage(JSON.stringify({ type: "run" }))} colors={colors} primary={derivedColors.primary} />
        <ActionBtn icon="stop" label="Stop" onPress={() => webViewRef.current?.postMessage(JSON.stringify({ type: "stop" }))} colors={colors} primary={derivedColors.primary} />
        <ActionBtn icon="image-plus" label="Assets" onPress={handleImportAsset} colors={colors} primary={derivedColors.primary} />
        <ActionBtn icon="puzzle-outline" label="Addons" onPress={() => setAddonsVisible(true)} colors={colors} primary={derivedColors.primary} />
        <ActionBtn icon="camera-outline" label="Frames" onPress={() => setCaptureVisible(true)} colors={colors} primary={derivedColors.primary} />
        <ActionBtn icon="github" label="Sync" onPress={() => setSyncVisible(true)} colors={colors} primary={derivedColors.primary} />
      </View>
      {status ? <Text style={[styles.status, { color: colors.textSecondary }]}>{status}</Text> : null}
      {html ? (
        <WebView
          ref={webViewRef}
          source={{ html, baseUrl: runtimeAssets.urls?.baseUrl ?? undefined }}
          style={styles.webview}
          onMessage={onMessage}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs
          originWhitelist={["*"]}
          mixedContentMode="always"
        />
      ) : (
        <View style={styles.center}><Text style={{ color: colors.textSecondary, fontFamily: "JetBrainsMono" }}>Loading runtime...</Text></View>
      )}

      <Modal visible={addonsVisible} transparent animationType="slide" onRequestClose={() => setAddonsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surfaceContainerHigh }]}>
            <ModalHeader title="Community Addons" onClose={() => setAddonsVisible(false)} colors={colors} />
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={[styles.modalHint, { color: colors.textSecondary }]}>Addons inject scripts into your sketch. If an addon is not tested with the bundled p5.js version, you will be warned before adding it.</Text>
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Enabled in sketch</Text>
              {sketch.addons.length === 0 ? <Text style={[styles.modalHint, { color: colors.textSecondary }]}>No addons added.</Text> : sketch.addons.map((a) => (
                <View key={a.id} style={[styles.addonRow, { borderColor: colors.outlineVariant }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.addonName, { color: colors.onSurface }]}>{a.name}</Text>
                    <Text style={[styles.addonMeta, { color: colors.textSecondary }]}>{a.compatibility}{a.compatibilityMessage ? ` - ${a.compatibilityMessage}` : ""}</Text>
                  </View>
                  <Pressable onPress={() => handleToggleAddon(a)} style={styles.smallBtn}><Text style={{ color: derivedColors.primary, fontFamily: "JetBrainsMono" }}>{a.enabled ? "Disable" : "Enable"}</Text></Pressable>
                  <Pressable onPress={() => handleRemoveAddon(a)} style={styles.smallBtn}><Text style={{ color: "#ef4444", fontFamily: "JetBrainsMono" }}>Remove</Text></Pressable>
                </View>
              ))}
              <Text style={[styles.sectionTitle, { color: colors.onSurface, marginTop: 16 }]}>Catalog</Text>
              {P5_ADDON_CATALOG.map((entry) => {
                const compat = evaluateAddonCompatibility(entry);
                return (
                  <View key={entry.id} style={[styles.addonRow, { borderColor: colors.outlineVariant }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.addonName, { color: colors.onSurface }]}>{entry.name}</Text>
                      <Text style={[styles.addonMeta, { color: colors.textSecondary }]}>{entry.description}</Text>
                      <Text style={[styles.addonMeta, { color: compat.compatibility === "compatible" ? "#22c55e" : compat.compatibility === "incompatible" ? "#ef4444" : "#f59e0b" }]}>{compat.message}</Text>
                    </View>
                    <Pressable onPress={() => handleAddAddon(entry)} style={styles.smallBtn}><Text style={{ color: derivedColors.primary, fontFamily: "JetBrainsMono" }}>Add</Text></Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={captureVisible} transparent animationType="slide" onRequestClose={() => setCaptureVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surfaceContainerHigh }]}>
            <ModalHeader title="Capture Frames" onClose={() => setCaptureVisible(false)} colors={colors} />
            <Text style={[styles.modalHint, { color: colors.textSecondary }]}>Enter frames to capture, e.g. 0, 30, 60 or 0-120 step 10. Frames are captured from the running sketch canvas.</Text>
            <TextInput value={frameInput} onChangeText={setFrameInput} style={[styles.input, { color: colors.onSurface, borderColor: colors.outlineVariant, backgroundColor: colors.surface }]} placeholder="0, 30, 60" placeholderTextColor={colors.textSecondary} />
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <Pressable onPress={handleCaptureFrames} style={[styles.primaryBtn, { backgroundColor: derivedColors.primary }]}><Text style={[styles.primaryBtnText, { color: colors.onPrimary }]}>Capture</Text></Pressable>
              <Pressable onPress={handleExportCapturedFrames} style={[styles.secondaryBtn, { borderColor: colors.outlineVariant }]}><Text style={[styles.primaryBtnText, { color: colors.onSurface }]}>Export Captured</Text></Pressable>
            </View>
            {capturedFrames.length > 0 ? <Text style={[styles.modalHint, { color: colors.textSecondary, marginTop: 12 }]}>Captured {capturedFrames.length} frame(s). Use Export Captured to save/share PNG files.</Text> : null}
          </View>
        </View>
      </Modal>

      <Modal visible={syncVisible} transparent animationType="slide" onRequestClose={() => setSyncVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surfaceContainerHigh }]}>
            <ModalHeader title="GitHub Sync" onClose={() => setSyncVisible(false)} colors={colors} />
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={[styles.modalHint, { color: colors.textSecondary }]}>Sync sketches to a GitHub Gist. Binary assets (images, audio, fonts, models) are saved locally on your device and are not uploaded.</Text>
              {githubAuth ? (
                <View>
                  <Text style={[styles.modalHint, { color: colors.onSurface }]}>Connected as {githubAuth.user.login}</Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                    <Pressable onPress={handleSync} disabled={syncing} style={[styles.primaryBtn, { backgroundColor: derivedColors.primary, opacity: syncing ? 0.6 : 1 }]}><Text style={[styles.primaryBtnText, { color: colors.onPrimary }]}>{syncing ? "Syncing..." : "Sync Sketch"}</Text></Pressable>
                    <Pressable onPress={async () => { await clearGitHubAuth(); setGithubAuth(null); }} style={[styles.secondaryBtn, { borderColor: colors.outlineVariant }]}><Text style={[styles.primaryBtnText, { color: colors.onSurface }]}>Disconnect</Text></Pressable>
                  </View>
                  {sketch.gistUrl ? <Text style={[styles.modalHint, { color: derivedColors.primary, marginTop: 8 }]}>{sketch.gistUrl}</Text> : null}
                </View>
              ) : (
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>OAuth (GitHub App)</Text>
                  <Text style={[styles.modalHint, { color: colors.textSecondary }]}>Enter your GitHub OAuth App Client ID. Client secret is optional for token exchange; if exchange fails, use a personal access token below.</Text>
                  <TextInput value={clientId} onChangeText={setClientId} style={[styles.input, { color: colors.onSurface, borderColor: colors.outlineVariant, backgroundColor: colors.surface }]} placeholder="GitHub OAuth Client ID" placeholderTextColor={colors.textSecondary} autoCapitalize="none" />
                  <TextInput value={clientSecret} onChangeText={setClientSecret} style={[styles.input, { color: colors.onSurface, borderColor: colors.outlineVariant, backgroundColor: colors.surface, marginTop: 8 }]} placeholder="Client secret (optional)" placeholderTextColor={colors.textSecondary} autoCapitalize="none" secureTextEntry />
                  <Pressable onPress={handleOAuth} style={[styles.primaryBtn, { backgroundColor: derivedColors.primary, marginTop: 10 }]}><Text style={[styles.primaryBtnText, { color: colors.onPrimary }]}>Sign in with GitHub</Text></Pressable>
                  <Text style={[styles.sectionTitle, { color: colors.onSurface, marginTop: 16 }]}>Personal Access Token</Text>
                  <Text style={[styles.modalHint, { color: colors.textSecondary }]}>Create a token with gist scope and paste it here.</Text>
                  <TextInput value={tokenInput} onChangeText={setTokenInput} style={[styles.input, { color: colors.onSurface, borderColor: colors.outlineVariant, backgroundColor: colors.surface }]} placeholder="ghp_..." placeholderTextColor={colors.textSecondary} autoCapitalize="none" secureTextEntry />
                  <Pressable onPress={handleConnectToken} style={[styles.secondaryBtn, { borderColor: colors.outlineVariant, marginTop: 10 }]}><Text style={[styles.primaryBtnText, { color: colors.onSurface }]}>Connect with Token</Text></Pressable>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ActionBtn({ icon, label, onPress, colors, primary }: { icon: any; label: string; onPress: () => void; colors: any; primary: string }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionBtn, { backgroundColor: colors.surfaceDim }, pressed && { opacity: 0.7 }]} accessibilityRole="button" accessibilityLabel={label}>
      <MaterialCommunityIcons name={icon} size={16} color={primary} />
      <Text style={[styles.actionBtnText, { color: colors.onSurface }]}>{label}</Text>
    </Pressable>
  );
}

function ModalHeader({ title, onClose, colors }: { title: string; onClose: () => void; colors: any }) {
  return (
    <View style={styles.modalHeader}>
      <Text style={[styles.modalTitle, { color: colors.onSurface }]}>{title}</Text>
      <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close"><MaterialCommunityIcons name="close" size={22} color={colors.onSurfaceVariant} /></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  webview: { flex: 1 },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  actionBtnText: { fontFamily: "JetBrainsMono", fontSize: 11, fontWeight: "700" },
  status: { fontFamily: "JetBrainsMono", fontSize: 11, paddingHorizontal: 16, paddingBottom: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { maxHeight: "85%", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  modalTitle: { fontFamily: "JetBrainsMono", fontSize: 18, fontWeight: "700" },
  modalHint: { fontFamily: "JetBrainsMono", fontSize: 12, lineHeight: 18, marginBottom: 10 },
  sectionTitle: { fontFamily: "JetBrainsMono", fontSize: 13, fontWeight: "700", marginBottom: 8 },
  addonRow: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 8 },
  addonName: { fontFamily: "JetBrainsMono", fontSize: 13, fontWeight: "700" },
  addonMeta: { fontFamily: "JetBrainsMono", fontSize: 11, marginTop: 2, lineHeight: 16 },
  smallBtn: { paddingVertical: 6 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontFamily: "JetBrainsMono", fontSize: 13 },
  primaryBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  secondaryBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, alignItems: "center", borderWidth: 1 },
  primaryBtnText: { fontFamily: "JetBrainsMono", fontSize: 12, fontWeight: "700" },
});
