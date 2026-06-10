import {
  forwardRef,
  useRef,
  useCallback,
  useEffect,
  useState,
  useImperativeHandle,
} from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import WebView from "react-native-webview";
import { buildExerciseHtml } from "../utils/buildExerciseHtml";
import { loadEditorAssets } from "../utils/loadEditorAssets";
import { useThemeColor } from "../hooks/useThemeColor";

interface ExerciseWebViewProps {
  code: string;
  onReady?: (code: string) => void;
  onCodeChange?: (code: string) => void;
  onCursorChange?: (line: number, ch: number) => void;
}

export interface ExerciseWebViewRef {
  insertText: (text: string) => void;
  runSketch: () => void;
  resetCode: (code: string) => void;
  setCode: (code: string) => void;
}

const ExerciseWebView = forwardRef<ExerciseWebViewRef, ExerciseWebViewProps>(
  function ExerciseWebView(
    { code, onReady, onCodeChange, onCursorChange },
    ref
  ) {
    const webRef = useRef<WebView>(null);
    const [html, setHtml] = useState<string | null>(null);
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const surface = useThemeColor("surface");

    useEffect(() => {
      let mounted = true;
      (async () => {
        const assets = await loadEditorAssets();
        if (!mounted) return;
        setHtml(buildExerciseHtml(code, assets, isTablet));
      })();
      return () => {
        mounted = false;
      };
    }, []);

    const handleMessage = useCallback(
      (event: { nativeEvent: { data: string } }) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          switch (data.type) {
            case "ready":
              onReady?.(data.code);
              break;
            case "codeChange":
              onCodeChange?.(data.code);
              break;
            case "cursorChange":
              onCursorChange?.(data.line, data.ch);
              break;
          }
        } catch {}
      },
      [onReady, onCodeChange, onCursorChange]
    );

    const postMessage = useCallback((msg: object) => {
      webRef.current?.postMessage(JSON.stringify(msg));
    }, []);

    const insertText = useCallback(
      (text: string) => postMessage({ type: "insert", text }),
      [postMessage]
    );
    const runSketch = useCallback(
      () => postMessage({ type: "run" }),
      [postMessage]
    );
    const resetCode = useCallback(
      (c: string) => postMessage({ type: "reset", code: c }),
      [postMessage]
    );
    const setCode = useCallback(
      (c: string) => postMessage({ type: "setCode", code: c }),
      [postMessage]
    );

    useImperativeHandle(
      ref,
      () => ({ insertText, runSketch, resetCode, setCode }),
      [insertText, runSketch, resetCode, setCode]
    );

    if (!html) {
      return (
        <View style={[styles.loading, { backgroundColor: surface }]} />
      );
    }

    return (
      <View style={styles.container}>
        <WebView
          ref={webRef}
          source={{ html }}
          style={styles.webview}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          keyboardDisplayRequiresUserAction={false}
          hideKeyboardAccessoryView={false}
          originWhitelist={["*"]}
        />
      </View>
    );
  }
);

export default ExerciseWebView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 400,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loading: {
    flex: 1,
    minHeight: 400,
  },
});
