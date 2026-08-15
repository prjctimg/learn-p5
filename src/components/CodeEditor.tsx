import { useState, useEffect, useCallback, useImperativeHandle, forwardRef, useRef, useMemo } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { WebView } from "react-native-webview";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";
import { getEditorHtml } from "../utils/editor/editor";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
  isRunning: boolean;
  wordWrap?: boolean;
}

interface CodeEditorHandle {
  insertText: (text: string, cursorOffset?: number) => void;
  focus: () => void;
}

const CODE_FONT_SIZE_KEY = "setting_codeFontSize";

const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  function CodeEditor({ code, onChange, onRun, isRunning, wordWrap }, ref) {
    const [webViewReady, setWebViewReady] = useState(false);
    const [fontSize, setFontSize] = useState(22);
    const webViewRef = useRef<WebView>(null);
    const { colorScheme, ctaColor } = useThemeContext();
    const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
    const editorHtml = useMemo(() => getEditorHtml(colorScheme === "dark" ? "dark" : "light", ctaColor, wordWrap), [colorScheme, ctaColor, wordWrap]);

    useEffect(() => {
      AsyncStorage.getItem(CODE_FONT_SIZE_KEY).then((val) => {
        if (val) setFontSize(parseInt(val, 10));
      });
    }, []);

    useEffect(() => {
      if (webViewReady && webViewRef.current) {
        webViewRef.current.postMessage(
          JSON.stringify({ type: "setCode", code })
        );
      }
    }, [code, webViewReady]);

    useEffect(() => {
      if (webViewReady && webViewRef.current) {
        webViewRef.current.postMessage(
          JSON.stringify({ type: "setFontSize", fontSize })
        );
      }
    }, [fontSize, webViewReady]);

    const handleMessage = useCallback(
      (event: { nativeEvent: { data: string } }) => {
        try {
          const msg = JSON.parse(event.nativeEvent.data);
          if (msg.type === "codeChange") {
            onChange(msg.code);
          } else if (msg.type === "ready") {
            setWebViewReady(true);
          }
        } catch {}
      },
      [onChange]
    );

    useImperativeHandle(
      ref,
      () => ({
        insertText: (text: string, cursorOffset?: number) => {
          if (webViewRef.current && webViewReady) {
            webViewRef.current.postMessage(
              JSON.stringify({ type: "insert", text, cursorOffset })
            );
          }
        },
        focus: () => {
          if (webViewRef.current && webViewReady) {
            webViewRef.current.postMessage(
              JSON.stringify({ type: "focus" })
            );
          }
        },
      }),
      [webViewReady]
    );

    return (
      <View style={[styles.container, { backgroundColor: colors.surfaceContainerLowest }]}>
        <WebView
          ref={webViewRef}
          source={{ html: editorHtml }}
          style={styles.webview}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={["*"]}
          scrollEnabled={true}
          bounces={false}
        />

        <Pressable
          onPress={onRun}
          disabled={isRunning}
          style={({ pressed }) => [
            styles.runButton,
            { backgroundColor: colors.primary },
            pressed && styles.runButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Run sketch"
          accessibilityState={{ disabled: isRunning }}
        >
          <MaterialCommunityIcons
            name={isRunning ? "reload" : "play"}
            size={28}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    );
  }
);

export default CodeEditor;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  webview: {
    flex: 1,
    backgroundColor: "#0D0E12",
  },
  runButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
  },
  runButtonPressed: {
    transform: [{ scale: 0.9 }],
  },
});