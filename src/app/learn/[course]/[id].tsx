import { useRef, useCallback, useState, useEffect } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ExerciseAppBar from "../../../components/ExerciseAppBar";
import InstructionPanel from "../../../components/InstructionPanel";
import ExerciseWebView from "../../../components/ExerciseWebView";
import type { ExerciseWebViewRef } from "../../../components/ExerciseWebView";
import CodeKeyboard from "../../../components/CodeKeyboard";
import { getExercise } from "../../../data/exercises";
import { useThemeColor } from "../../../hooks/useThemeColor";
import { spacing } from "../../../styles/spacing";

const TABLET_BREAKPOINT = 768;

export default function ExercisePage() {
  const { course, id } = useLocalSearchParams<{ course: string; id: string }>();
  const exercise = getExercise(course ?? "", id ?? "");
  const webviewRef = useRef<ExerciseWebViewRef>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [code, setCode] = useState(exercise?.initialCode ?? "");
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;
  const insets = useSafeAreaInsets();
  const surface = useThemeColor("surface");

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const handleReady = useCallback((_code: string) => {
    setCode(_code);
  }, []);

  const handleCodeChange = useCallback((_code: string) => {
    setCode(_code);
  }, []);

  const handleRun = useCallback(() => {
    webviewRef.current?.runSketch();
  }, []);

  const handleReset = useCallback(() => {
    if (exercise) {
      webviewRef.current?.resetCode(exercise.initialCode);
      setCode(exercise.initialCode);
    }
  }, [exercise]);

  const handleInsert = useCallback((text: string) => {
    webviewRef.current?.insertText(text);
  }, []);

  if (!exercise) {
    return (
      <View style={[styles.center, { backgroundColor: surface }]}>
        <Stack.Screen options={{ title: "Not Found" }} />
        <ExerciseAppBar title="Exercise" />
      </View>
    );
  }

  if (isTablet) {
    return (
      <View style={[styles.tabletContainer, { backgroundColor: surface }]}>
        <Stack.Screen options={{ title: exercise.title }} />
        <ExerciseAppBar title={exercise.title} />
        <View style={styles.tabletBody}>
          <View style={styles.tabletSidebar}>
            <ScrollView contentContainerStyle={styles.sidebarContent}>
              <InstructionPanel
                title={exercise.title}
                description={exercise.description}
                previewImage={exercise.previewImage}
                onRun={handleRun}
                onReset={handleReset}
              />
            </ScrollView>
          </View>
          <View style={styles.tabletMain}>
            <View style={styles.webviewWrap}>
              <ExerciseWebView
                ref={webviewRef}
                code={exercise.initialCode}
                onReady={handleReady}
                onCodeChange={handleCodeChange}
              />
            </View>
            {keyboardVisible && (
              <CodeKeyboard
                tokens={exercise.tokens}
                onInsert={handleInsert}
              />
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: surface }]}>
      <Stack.Screen options={{ title: exercise.title }} />
      <ExerciseAppBar title={exercise.title} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : insets.bottom}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <InstructionPanel
            title={exercise.title}
            description={exercise.description}
            previewImage={exercise.previewImage}
            onRun={handleRun}
            onReset={handleReset}
          />

          <View style={styles.webviewWrap}>
            <ExerciseWebView
              ref={webviewRef}
              code={exercise.initialCode}
              onReady={handleReady}
              onCodeChange={handleCodeChange}
            />
          </View>
        </ScrollView>

        {keyboardVisible && (
          <CodeKeyboard tokens={exercise.tokens} onInsert={handleInsert} />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  webviewWrap: {
    flex: 1,
    minHeight: 400,
    marginTop: spacing[2],
  },
  tabletContainer: {
    flex: 1,
  },
  tabletBody: {
    flex: 1,
    flexDirection: "row",
  },
  tabletSidebar: {
    width: 280,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  sidebarContent: {
    paddingBottom: spacing[4],
  },
  tabletMain: {
    flex: 1,
  },
});
