import { useState, useRef, useEffect, useReducer, useMemo, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Keyboard } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";
import { useDrawerContext } from "../../../contexts/DrawerContext";
import { useThemeContext } from "../../../components/ThemeProvider";
import { Colors } from "../../../constants/Colors";
import { DEFAULTS } from "../../../constants/Defaults";
import ProgrammingKeyboard from "../../../components/ProgrammingKeyboard";
import Toast from "../../../components/Toast";
import { loadExercise, loadCourse } from "../../../utils/courseLoader";
import { Lesson } from "../../../data/types";
import { P5_FUNCTION_NAMES, ONCE_ONLY_P5_FUNCTIONS } from "../../../data/p5Symbols";
import { getExerciseHtml } from "../../../utils/editor/exerciseHtml";

interface ExerciseState {
  exercise: Lesson | null;
  loading: boolean;
  code: string;
  isRunning: boolean;
  completed: boolean;
}

type ExerciseAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_DONE"; exercise: Lesson | null }
  | { type: "SET_CODE"; code: string }
  | { type: "APPEND_CODE"; text: string; cursorOffset?: number }
  | { type: "RUN_START" }
  | { type: "RUN_DONE" }
  | { type: "EXERCISE_COMPLETE" };

function exerciseReducer(state: ExerciseState, action: ExerciseAction): ExerciseState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true };
    case "LOAD_DONE": {
      const ex = action.exercise;
      let code = ex?.startingCode ?? "";
      const hasSetup = /function\s+setup\s*\(/.test(code);
      const hasDraw = /function\s+draw\s*\(/.test(code);
      if (!hasSetup || !hasDraw) {
        code = 'function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(20);\n}\n';
      }
      return {
        ...state,
        loading: false,
        exercise: ex ? { ...ex, startingCode: code } : null,
        code,
      };
    }
    case "SET_CODE":
      return { ...state, code: action.code };
    case "APPEND_CODE":
      return { ...state, code: state.code + action.text };
    case "RUN_START":
      return { ...state, isRunning: true };
    case "RUN_DONE":
      return { ...state, isRunning: false };
    case "EXERCISE_COMPLETE":
      return { ...state, completed: true };
    default:
      return state;
  }
}

export default function Exercise() {
  const { course, id } = useLocalSearchParams<{ course: string; id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { openDrawer } = useDrawerContext();
  const [state, dispatch] = useReducer(exerciseReducer, {
    exercise: null,
    loading: true,
    code: "",
    isRunning: false,
    completed: false,
  });
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const webViewRef = useRef<WebView>(null);
  const [webViewReady, setWebViewReady] = useState(false);
  const [editorViewReady, setEditorViewReady] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(true);
  const [systemKeyboardVisible, setSystemKeyboardVisible] = useState(false);
  const [systemKeyboardHeight, setSystemKeyboardHeight] = useState(0);
  const [codeBackground, setCodeBackground] = useState<string | undefined>(undefined);
  const [codeFontSize, setCodeFontSize] = useState<number>(DEFAULTS.codeFontSize);
  const [keyboardHeight, setKeyboardHeight] = useState<string>(DEFAULTS.keyboardHeight);
  const [toastKey, setToastKey] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastActionLabel, setToastActionLabel] = useState<string | undefined>(undefined);
  const toastActionRef = useRef<(() => void) | undefined>(undefined);

  const showToast = useCallback((message: string, actionLabel?: string, onAction?: () => void) => {
    setToastMessage(message);
    setToastActionLabel(actionLabel);
    toastActionRef.current = onAction;
    setToastKey((k) => k + 1);
    setToastVisible(true);
  }, []);

  const exerciseHtml = useMemo(() => {
    if (!state.exercise) return null;
    return getExerciseHtml({
      title: state.exercise.title,
      moduleName: state.exercise.module,
      instruction: state.exercise.instruction,
      exerciseNumber: parseInt(id?.replace("exercise-", "") ?? "1", 10),
      startingCode: state.exercise.startingCode ?? "",
      solution: state.exercise.solution ?? "",
      colorScheme: colorScheme === "dark" ? "dark" : "light",
      codeBackground,
      codeFontSize,
    });
  }, [state.exercise, colorScheme, id, codeBackground, codeFontSize]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        loadingContainer: {
          flex: 1,
          backgroundColor: colors.surface,
          alignItems: "center",
          justifyContent: "center",
        },
        notFoundContainer: {
          flex: 1,
          backgroundColor: colors.surface,
        },
        notFoundInner: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        },
        notFoundTitle: {
          fontFamily: "JetBrainsMono",
          fontSize: 20,
          fontWeight: "700",
          color: colors.onSurface,
          marginTop: 16,
        },
        notFoundSubtitle: {
          fontFamily: "JetBrainsMono",
          fontSize: 16,
          color: colors.textSecondary,
          marginTop: 8,
          textAlign: "center",
        },
        notFoundButtonWrapper: {
          marginTop: 24,
        },
        backButton: {
          backgroundColor: colors.primary,
          paddingHorizontal: 24,
          paddingVertical: 12,
        },
        backButtonPressed: {
          transform: [{ translateY: 2 }],
        },
        backButtonText: {
          fontFamily: "JetBrainsMono",
          fontWeight: "900",
          fontSize: 13,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          color: colors.onPrimary,
        },
        container: {
          flex: 1,
          backgroundColor: colors.surface,
        },
        header: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingBottom: 12,
          backgroundColor: colors.surface,
        },
        menuButton: {
          padding: 8,
        },
        logoText: {
          fontFamily: "JetBrainsMono",
          fontSize: 20,
          fontWeight: "700",
          color: colors.primary,
          marginLeft: 8,
          textTransform: "uppercase",
          letterSpacing: -0.5,
        },
        spacer: {
          flex: 1,
        },
        webview: {
          flex: 1,
        },
        showKeyboardFab: {
          position: "absolute",
          left: 24,
          bottom: 32,
          width: 48,
          height: 48,
          borderRadius: 9999,
          backgroundColor: colors.surfaceContainerHigh,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 8,
          borderWidth: 1,
          borderColor: colors.outlineVariant,
        },
        showKeyboardFabPressed: {
          transform: [{ scale: 0.9 }],
        },
        runButtonContainer: {
          position: "absolute",
          right: 16,
          zIndex: 100,
          alignItems: "center",
          justifyContent: "center",
        },
        runButton: {
          width: 68,
          height: 68,
          borderRadius: 9999,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.3,
          shadowRadius: 25,
          elevation: 16,
        },
        runButtonPressed: {
          transform: [{ scale: 0.9 }],
        },
      }),
    [colorScheme]
  );

  useEffect(() => {
    const load = async () => {
      if (!course || !id) return;
      dispatch({ type: "LOAD_START" });
      const ex = await loadExercise(course, id);
      dispatch({ type: "LOAD_DONE", exercise: ex });
    };
    load();
  }, [course, id]);

  useEffect(() => {
    if (editorViewReady && webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({ type: "setCode", code: state.code })
      );
    }
  }, [state.code, editorViewReady]);

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);
        switch (msg.type) {
          case "codeChange":
            dispatch({ type: "SET_CODE", code: msg.code });
            break;
          case "ready":
            setWebViewReady(true);
            break;
          case "editorReady":
            setEditorViewReady(msg.ready);
            break;
          case "editorTapped":
            setKeyboardVisible(true);
            break;
          case "openRef":
            router.push(`/ref?symbol=${msg.symbol}`);
            break;
          case "exerciseComplete":
            dispatch({ type: "EXERCISE_COMPLETE" });
            break;
          case "goToNextLesson":
            loadCourse(course).then((courseData) => {
              if (!courseData) return;
              const currentIndex = courseData.lessons.findIndex((l) => l.id === id);
              if (currentIndex >= 0 && currentIndex < courseData.lessons.length - 1) {
                const nextLesson = courseData.lessons[currentIndex + 1];
                router.replace(`/learn/${course}/${nextLesson.id}`);
              } else {
                router.replace(`/learn/${course}`);
              }
            });
            break;
        }
      } catch {}
    },
    [router, course, id]
  );

  const pendingInserts = useRef<{ text: string; cursorOffset?: number }[]>([]);

  const handleInsert = (text: string, cursorOffset?: number) => {
    if (webViewRef.current && editorViewReady) {
      webViewRef.current.postMessage(
        JSON.stringify({ type: "insert", text, cursorOffset })
      );
    } else if (webViewRef.current && webViewReady) {
      pendingInserts.current.push({ text, cursorOffset });
      webViewRef.current.postMessage(
        JSON.stringify({ type: "editorReady" })
      );
    } else {
      pendingInserts.current.push({ text, cursorOffset });
    }
  };

  useEffect(() => {
    if (editorViewReady && pendingInserts.current.length > 0) {
      for (const item of pendingInserts.current) {
        if (webViewRef.current) {
          webViewRef.current.postMessage(
            JSON.stringify({ type: "insert", text: item.text, cursorOffset: item.cursorOffset })
          );
        }
      }
      pendingInserts.current = [];
    }
  }, [editorViewReady]);

  const handleToggleKeyboard = useCallback(() => {
    setKeyboardVisible((prev) => !prev);
    if (webViewRef.current && editorViewReady) {
      webViewRef.current.postMessage(JSON.stringify({ type: "useCustomKeyboard" }));
    }
  }, [editorViewReady]);

  const handleRequestSystemKeyboard = useCallback(() => {
    if (systemKeyboardVisible) {
      setKeyboardVisible(true);
      setSystemKeyboardVisible(false);
      if (webViewRef.current && editorViewReady) {
        webViewRef.current.postMessage(JSON.stringify({ type: "useCustomKeyboard" }));
      }
    } else {
      setKeyboardVisible(false);
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({ type: "focus" }));
      }
    }
  }, [systemKeyboardVisible, editorViewReady]);

  const handleBackspace = useCallback(() => {
    if (webViewRef.current && editorViewReady) {
      webViewRef.current.postMessage(JSON.stringify({ type: "backspace" }));
    }
  }, [editorViewReady]);

  const handleNewline = useCallback(() => {
    if (webViewRef.current && editorViewReady) {
      webViewRef.current.postMessage(JSON.stringify({ type: "insert", text: "\n" }));
    }
  }, [editorViewReady]);

  const handleRun = useCallback(() => {
    if (!state.exercise) return;
    dispatch({ type: "RUN_START" });
    if (webViewRef.current && editorViewReady) {
      webViewRef.current.postMessage(JSON.stringify({ type: "runSketch" }));
    }
    setTimeout(() => dispatch({ type: "RUN_DONE" }), 500);
  }, [state.exercise, editorViewReady]);

  const handleFormat = useCallback(() => {
    if (webViewRef.current && editorViewReady) {
      webViewRef.current.postMessage(JSON.stringify({ type: "format" }));
    }
  }, [editorViewReady]);

  const handleCursorMove = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (webViewRef.current && editorViewReady) {
      webViewRef.current.postMessage(JSON.stringify({ type: "cursorMove", direction }));
    }
  }, [editorViewReady]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setSystemKeyboardVisible(true);
      setSystemKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setSystemKeyboardVisible(false);
      setSystemKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("setting_codeBackground").then((val) => {
        setCodeBackground(val || undefined);
      });
      AsyncStorage.getItem("setting_codeFontSize").then((val) => {
        setCodeFontSize(val ? parseInt(val, 10) : DEFAULTS.codeFontSize);
      });
      AsyncStorage.getItem("setting_keyboardHeight").then((val) => {
        setKeyboardHeight(val || "medium");
      });
    }, [])
  );

  useEffect(() => {
    if (!state.completed || !state.exercise) return;

    const key = `${course}/${state.exercise.id}`;

    AsyncStorage.getItem("completedLessons").then((val) => {
      const arr: string[] = val ? JSON.parse(val) : [];
      if (!arr.includes(key)) {
        arr.push(key);
        AsyncStorage.setItem("completedLessons", JSON.stringify(arr));
      }
    });

    showToast("✓ Exercise completed!", "Next →", handleToastNext);

    loadCourse(course).then((courseData) => {
      if (!courseData) return;
      AsyncStorage.getItem("completedLessons").then((val) => {
        const completed: string[] = val ? JSON.parse(val) : [];
        const allDone = courseData.lessons.every((l) =>
          completed.includes(`${course}/${l.id}`)
        );
        if (allDone) {
          AsyncStorage.getItem("completedCourses").then((prev) => {
            const arr: string[] = prev ? JSON.parse(prev) : [];
            if (!arr.includes(course)) {
              arr.push(course);
              AsyncStorage.setItem("completedCourses", JSON.stringify(arr));
            }
          });
        }
      });
    });
  }, [state.completed, state.exercise, course, webViewReady]);

  const handleToastNext = useCallback(() => {
    setToastVisible(false);
    if (!state.exercise) return;
    loadCourse(course).then((courseData) => {
      if (!courseData) return;
      const currentIndex = courseData.lessons.findIndex((l) => l.id === id);
      if (currentIndex >= 0 && currentIndex < courseData.lessons.length - 1) {
        const nextLesson = courseData.lessons[currentIndex + 1];
        router.replace(`/learn/${course}/${nextLesson.id}`);
      } else {
        router.replace(`/learn/${course}`);
      }
    });
  }, [state.exercise, course, id, router]);

  const exerciseSymbols = useMemo(() => {
    if (!state.exercise) return [];
    const code = (state.exercise.startingCode + " " + (state.exercise.solution ?? "")).toLowerCase();
    return P5_FUNCTION_NAMES.filter((fn) => code.includes(fn.toLowerCase()));
  }, [state.exercise]);

  const usedFunctions = useMemo(() => {
    return ONCE_ONLY_P5_FUNCTIONS.filter((fn) => {
      const re = new RegExp(`function\\s+${fn}\\s*\\(`);
      return re.test(state.code);
    });
  }, [state.code]);

  const runButtonBottom = useMemo(() => {
    if (keyboardVisible) {
      return (DEFAULTS.keyboardHeightPixels[keyboardHeight] ?? DEFAULTS.keyboardHeightPixels.medium) + 16;
    }
    if (systemKeyboardVisible) {
      return systemKeyboardHeight + 16;
    }
    return 16;
  }, [keyboardVisible, keyboardHeight, systemKeyboardVisible, systemKeyboardHeight]);

  if (state.loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="loading" size={32} color={colors.primary} />
      </View>
    );
  }

  if (!state.exercise) {
    return (
      <View style={styles.notFoundContainer}>
        <View style={styles.notFoundInner}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.primary} />
          <Text style={styles.notFoundTitle}>
            Exercise not found
          </Text>
          <Text style={styles.notFoundSubtitle}>
            The exercise &ldquo;{id}&rdquo; doesn&apos;t exist yet.
          </Text>
          <View style={styles.notFoundButtonWrapper}>
            <Pressable
              onPress={() => router.push(`/learn/${course}`)}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Back to course"
            >
              <Text style={styles.backButtonText}>
                Back to course
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[styles.header, { paddingTop: insets.top + 4 }]}
      >
        <Pressable
          onPress={openDrawer}
          style={styles.menuButton}
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
        >
          <MaterialCommunityIcons name="menu" size={24} color={colors.onSurfaceVariant} />
        </Pressable>
        <Text style={styles.logoText}>
          P5.LEARN
        </Text>
        <View style={styles.spacer} />
      </View>

      {exerciseHtml && (
        <WebView
          ref={webViewRef}
          source={{ html: exerciseHtml }}
          style={styles.webview}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={["*"]}
          scrollEnabled={true}
          bounces={false}
        />
      )}

      <View
        style={[
          styles.runButtonContainer,
          { bottom: runButtonBottom },
        ]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={handleRun}
          disabled={state.isRunning}
          style={({ pressed }) => [
            styles.runButton,
            { backgroundColor: colors.primary },
            pressed && styles.runButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Run sketch"
          accessibilityState={{ disabled: state.isRunning }}
        >
          <MaterialCommunityIcons
            name={state.isRunning ? "reload" : "play"}
            size={36}
            color="#FFFFFF"
          />
        </Pressable>
      </View>

      <Toast
        key={toastKey}
        visible={toastVisible}
        message={toastMessage}
        actionLabel={toastActionLabel}
        onAction={toastActionRef.current}
        onDismiss={() => setToastVisible(false)}
      />

      {keyboardVisible && (
        <ProgrammingKeyboard
          onInsert={handleInsert}
          exerciseSymbols={exerciseSymbols}
          onToggleKeyboard={handleToggleKeyboard}
          onRequestSystemKeyboard={handleRequestSystemKeyboard}
          onBackspace={handleBackspace}
          onNewline={handleNewline}
          onFormat={handleFormat}
          onCursorMove={handleCursorMove}
          keyboardVisible={keyboardVisible}
          usedFunctions={usedFunctions}
          height={DEFAULTS.keyboardHeightPixels[keyboardHeight] ?? DEFAULTS.keyboardHeightPixels.medium}
        />
      )}

      {!keyboardVisible && !systemKeyboardVisible && (
        <Pressable
          onPress={handleToggleKeyboard}
          style={({ pressed }) => [
            styles.showKeyboardFab,
            pressed && styles.showKeyboardFabPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Show custom keyboard"
        >
          <MaterialCommunityIcons name="keyboard-variant" size={24} color={colors.onSurface} />
        </Pressable>
      )}
    </View>
  );
}
