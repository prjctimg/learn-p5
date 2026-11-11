import { useEffect, useMemo, useState } from "react";
import {
  InteractionManager,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { WebView } from "react-native-webview";
import { Colors, type ColorScheme } from "../constants/Colors";
import type { RuntimeAssetsState } from "../hooks/useRuntimeAssets";
import { getExampleHtml } from "../utils/editor/exampleHtml";
import { highlightSyntax, sanitizeCode } from "../utils/referenceRender";

interface ExamplePreviewProps {
  /** Code shown in the syntax-highlighted block below the preview. */
  code: string;
  colorScheme: ColorScheme;
  assets: RuntimeAssetsState;
  /** Full example source used by the WebView (defaults to `code`). */
  previewCode?: string;
  /** When true, only the code block is shown (symbols without a canvas demo). */
  norender?: boolean;
  previewHeight?: number;
  /** Stagger preview mounts so several examples do not start p5 at once. */
  delayMs?: number;
  codeFontSize?: number;
  codeLineHeight?: number;
  previewStyle?: StyleProp<ViewStyle>;
  codeBlockStyle?: StyleProp<ViewStyle>;
}

/**
 * Reference/exercise examples render here. The highlighted code appears as
 * soon as the screen mounts; the WebView (and therefore p5) is mounted only
 * after runtime files are ready and the current interactions settle, so
 * opening a reference entry never blocks on building or loading the preview.
 */
export default function ExamplePreview({
  code,
  colorScheme,
  assets,
  previewCode,
  norender = false,
  previewHeight = 200,
  delayMs = 0,
  codeFontSize = 12,
  codeLineHeight = 18,
  previewStyle,
  codeBlockStyle,
}: ExamplePreviewProps) {
  const colors = Colors[colorScheme];
  const safeCode = useMemo(() => sanitizeCode(code), [code]);
  const safePreviewCode = useMemo(() => sanitizeCode(previewCode ?? code), [code, previewCode]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (norender || !assets.ready) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const interaction = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => {
        if (!cancelled) setShowPreview(true);
      }, delayMs);
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      interaction.cancel?.();
    };
  }, [assets.ready, delayMs, norender]);

  const html = useMemo(() => {
    if (!showPreview || norender || !assets.ready) return null;
    return getExampleHtml(previewCode ?? code, colorScheme, assets.urls);
  }, [showPreview, norender, assets.ready, assets.urls, previewCode, code, colorScheme]);

  const tokens = useMemo(() => highlightSyntax(code, colorScheme), [code, colorScheme]);

  return (
    <View>
      {!norender &&
        (html ? (
          <WebView
            source={{ html, baseUrl: assets.urls?.baseUrl ?? undefined }}
            style={[styles.preview, { height: previewHeight, backgroundColor: colors.surface }, previewStyle]}
            scrollEnabled={false}
            pointerEvents="none"
            javaScriptEnabled
            domStorageEnabled
            allowFileAccess
            allowFileAccessFromFileURLs
            allowUniversalAccessFromFileURLs
            bounces={false}
          />
        ) : (
          <View
            style={[
              styles.preview,
              styles.placeholder,
              { height: previewHeight, backgroundColor: colors.surfaceDim },
              previewStyle,
            ]}
          >
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              Loading preview…
            </Text>
          </View>
        ))}

      <View
        style={[
          styles.codeBlock,
          { backgroundColor: colors.surfaceDim },
          !norender && styles.codeBlockBelowPreview,
          codeBlockStyle,
        ]}
      >
        <Text style={{ fontFamily: "JetBrainsMono", fontSize: codeFontSize, lineHeight: codeLineHeight }}>
          {tokens.map((t, i) => (
            <Text key={i} style={{ color: t.color }}>{t.text}</Text>
          ))}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    borderRadius: 8,
    overflow: "hidden",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontFamily: "JetBrainsMono",
    fontSize: 12,
  },
  codeBlock: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  codeBlockBelowPreview: {
    marginTop: 8,
  },
});
