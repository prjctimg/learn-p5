import { useState, useRef, useEffect, useReducer, useMemo, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Modal, Switch } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";
import { useThemeContext } from "../../../components/ThemeProvider";
import { Colors } from "../../../constants/Colors";
import { DEFAULTS } from "../../../constants/Defaults";
import ProgrammingKeyboard from "../../../components/ProgrammingKeyboard";
import QwertyKeyboard from "../../../components/QwertyKeyboard";

import Toast from "../../../components/Toast";
import Breadcrumbs from "../../../components/Breadcrumbs";
import StreakToast from "../../../components/StreakToast";
import ShakeModal from "../../../components/ShakeModal";
import { loadExercise, loadCourse } from "../../../utils/courseLoader";
import { Exercise as ExerciseType } from "../../../data/types";
import { P5_FUNCTION_NAMES, ONCE_ONLY_P5_FUNCTIONS } from "../../../data/reference";
import { getExerciseHtml } from "../../../utils/editor/exerciseHtml";
import { EDITOR_THEMES, getThemeSwatches } from "../../../utils/editor/themes";
import { useStreak } from "../../../hooks/useStreak";
import { useShakeDetection } from "../../../hooks/useShakeDetection";

const EXERCISE_CODE_PREFIX = "exerciseCode_";

function getExerciseCodeKey(course: string, id: string): string {
 return `${EXERCISE_CODE_PREFIX}${course}_${id}`;
}

interface ExerciseState {
 exercise: ExerciseType | null;
 loading: boolean;
 code: string;
 startingCode: string;
 isRunning: boolean;
 completed: boolean;
 error: string | null;
 currentTaskIndex: number;
 completedTasks: number[];
}

type ExerciseAction =
 | { type: "LOAD_START" }
 | { type: "LOAD_DONE"; exercise: ExerciseType | null; course: string; id: string }
 | { type: "LOAD_ERROR"; error: string }
 | { type: "SET_CODE"; code: string }
 | { type: "RESET_CODE"; course: string; id: string }
 | { type: "APPEND_CODE"; text: string; cursorOffset?: number }
 | { type: "RUN_START" }
 | { type: "RUN_DONE" }
 | { type: "EXERCISE_COMPLETE" }
 | { type: "TASK_COMPLETE"; taskIndex: number };

function exerciseReducer(state: ExerciseState, action: ExerciseAction): ExerciseState {
 switch (action.type) {
 case "LOAD_START":
 return { ...state, loading: true, error: null };
 case "LOAD_DONE": {
 const ex = action.exercise;
 const baseCode = ex?.startingCode ?? "";
 const hasSetup = /function\s+setup\s*\(/.test(baseCode);
 const hasDraw = /function\s+draw\s*\(/.test(baseCode);
 const startingCode = !hasSetup || !hasDraw
 ? 'function setup() {\n createCanvas(400, 400);\n}\n\nfunction draw() {\n background(20);\n}\n'
 : baseCode;
 return {
 ...state,
 loading: false,
 exercise: ex ? { ...ex, startingCode } : null,
 startingCode,
 code: startingCode,
 error: null,
 };
 }
 case "LOAD_ERROR":
 return { ...state, loading: false, error: action.error };
 case "SET_CODE":
 return { ...state, code: action.code };
 case "RESET_CODE":
 return { ...state, code: state.startingCode };
 case "APPEND_CODE":
 return { ...state, code: state.code + action.text };
 case "RUN_START":
 return { ...state, isRunning: true };
 case "RUN_DONE":
 return { ...state, isRunning: false };
 case "EXERCISE_COMPLETE":
 return { ...state, completed: true };
 case "TASK_COMPLETE": {
 const completedTasks = [...state.completedTasks, action.taskIndex];
 const hasMoreTasks = state.exercise?.tasks && action.taskIndex < state.exercise.tasks.length - 1;
 return {
 ...state,
 completedTasks,
 currentTaskIndex: hasMoreTasks ? action.taskIndex + 1 : state.currentTaskIndex,
 completed: !hasMoreTasks,
 };
 }
 default:
 return state;
 }
}

export default function Exercise() {
 const { course, id } = useLocalSearchParams<{ course: string; id: string }>();
 const router = useRouter();
 const insets = useSafeAreaInsets();
 const [state, dispatch] = useReducer(exerciseReducer, {
 exercise: null,
 loading: true,
 code: "",
 startingCode: "",
 isRunning: false,
 completed: false,
 error: null,
 currentTaskIndex: 0,
 completedTasks: [],
 });
 const { colorScheme, toggleTheme, ctaColor, derivedColors } = useThemeContext();
 const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
 const webViewRef = useRef<WebView>(null);
 const [webViewReady, setWebViewReady] = useState(false);
 const [editorViewReady, setEditorViewReady] = useState(false);
 const [keyboardVisible, setKeyboardVisible] = useState(true);

 const [keyboardMode, setKeyboardMode] = useState<"programming" | "qwerty">("programming");
 const [codeSyncKey, setCodeSyncKey] = useState(0);
 const codeRef = useRef(state.code);
 codeRef.current = state.code;
 const [editorTheme, setEditorTheme] = useState<string>("p5-learn");
 const [codeFontSize, setCodeFontSize] = useState<number>(DEFAULTS.codeFontSize);
 const [keyboardHeight, setKeyboardHeight] = useState<string>(DEFAULTS.keyboardHeight);
 const [settingsMenuVisible, setSettingsMenuVisible] = useState(false);
 const [wordWrap, setWordWrap] = useState(false);
 const [toastKey, setToastKey] = useState(0);
 const [toastVisible, setToastVisible] = useState(false);
 const [toastMessage, setToastMessage] = useState("");
  const [toastActionLabel, setToastActionLabel] = useState<string | undefined>(undefined);
  const toastActionRef = useRef<(() => void) | undefined>(undefined);
  const [courseTitle, setCourseTitle] = useState<string>("");
  const streak = useStreak();
  const [streakToastVisible, setStreakToastVisible] = useState(false);
  const [shakeModalVisible, setShakeModalVisible] = useState(false);

  const [toastIcon, setToastIcon] = useState<string>("check-circle");
  const [toastIconColor, setToastIconColor] = useState<string>("#22C55E");

  const showToast = useCallback((message: string, actionLabel?: string, onAction?: () => void, type?: "success" | "failure") => {
    setToastMessage(message);
    setToastActionLabel(actionLabel);
    toastActionRef.current = onAction;
    setToastIcon(type === "failure" ? "alert-circle" : "check-circle");
    setToastIconColor(type === "failure" ? colors.error : "#22C55E");
    setToastKey((k) => k + 1);
    setToastVisible(true);
  }, [colors.error]);

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
      editorTheme,
      codeFontSize,
      ctaColor,
      wordWrap,
      tasks: state.exercise.tasks,
      activeTaskIndex: state.currentTaskIndex,
    });
  }, [state.exercise, colorScheme, id, editorTheme, codeFontSize, ctaColor, wordWrap]);

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
 backgroundColor: derivedColors.primary,
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
    color: colors.onSurface,
    marginLeft: 8,
    letterSpacing: -0.5,
  },
 spacer: {
 flex: 1,
 },
 webview: {
 flex: 1,
 },
 keyboardFab: {
 position: "absolute",
 right: 16,
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
 keyboardFabPressed: {
 transform: [{ scale: 0.9 }],
 },
 fabWrapper: {
 position: "absolute",
 right: 16,
 zIndex: 100,
 alignItems: "center",
 justifyContent: "center",
 },
 runButtonContainer: {
 position: "absolute",
 right: 16,
 zIndex: 100,
 alignItems: "center",
 justifyContent: "center",
 },
 runButton: {
 width: 52,
 height: 52,
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
 modalOverlay: {
 flex: 1,
 backgroundColor: "rgba(0,0,0,0.5)",
 justifyContent: "center",
 alignItems: "center",
 padding: 24,
 },
 modalCard: {
 width: "100%",
 maxWidth: 360,
 borderRadius: 16,
 padding: 24,
 },
 modalHeader: {
 flexDirection: "row",
 alignItems: "center",
 justifyContent: "space-between",
 marginBottom: 20,
 },
 modalTitle: {
 fontFamily: "JetBrainsMono",
 fontSize: 18,
 fontWeight: "700",
 },
 modalSection: {
 marginBottom: 16,
 },
 modalSectionTitle: {
 fontFamily: "JetBrainsMono",
 fontSize: 11,
 letterSpacing: 1,
 marginBottom: 8,
 },
 modalRow: {
 flexDirection: "row",
 alignItems: "center",
 justifyContent: "space-between",
 gap: 8,
 },
 }),
 [colorScheme]
);

  useEffect(() => {
    const load = async () => {
      if (!course || !id) return;
      dispatch({ type: "LOAD_START" });
      try {
        const [ex, courseData] = await Promise.all([
          loadExercise(course, id),
          loadCourse(course),
        ]);
        dispatch({ type: "LOAD_DONE", exercise: ex, course, id });
        if (courseData) setCourseTitle(courseData.title);
        const saved = await AsyncStorage.getItem(getExerciseCodeKey(course, id));
 if (saved) {
 dispatch({ type: "SET_CODE", code: saved });
 }
 } catch (e: unknown) {
 const errMsg = e instanceof Error ? e.message : String(e);
 const errStack = e instanceof Error ? e.stack : "";
 const logEntry = {
 timestamp: new Date().toISOString(),
 route: `/learn/${course}/${id}`,
 error: errMsg,
 stack: errStack,
 };
 const existing = await AsyncStorage.getItem("error_log");
 const logs = existing ? JSON.parse(existing) : [];
 logs.push(logEntry);
 await AsyncStorage.setItem("error_log", JSON.stringify(logs.slice(-20)));
 dispatch({ type: "LOAD_ERROR", error: errMsg });
 }
 };
 load();
 }, [course, id]);

 useEffect(() => {
 if (editorViewReady && webViewRef.current) {
 webViewRef.current.postMessage(
 JSON.stringify({ type: "setCode", code: codeRef.current })
);
 }
 }, [editorViewReady, codeSyncKey]);

 useEffect(() => {
 if (!state.loading && course && id) {
 AsyncStorage.setItem(getExerciseCodeKey(course, id), state.code);
 }
 }, [state.code, state.loading, course, id]);

 const handleReset = useCallback(() => {
 if (course && id) {
 AsyncStorage.removeItem(getExerciseCodeKey(course, id));
 dispatch({ type: "RESET_CODE", course, id });
 if (webViewRef.current && editorViewReady) {
 webViewRef.current.postMessage(
 JSON.stringify({ type: "setCode", code: state.startingCode })
);
 }
 }
 }, [course, id, editorViewReady, state.startingCode]);

 const handleMessage = useCallback(
 (event: { nativeEvent: { data: string } }) => {
 try {
 const msg = JSON.parse(event.nativeEvent.data);
 switch (msg.type) {
 case "codeChange":
 dispatch({ type: "SET_CODE", code: msg.code });
 break;
 case "resetCode":
 handleReset();
 break;
 case "ready":
 setWebViewReady(true);
 setCodeSyncKey((k) => k + 1);
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
      dispatch({ type: "RUN_DONE" });
      dispatch({ type: "EXERCISE_COMPLETE" });
      break;
    case "taskComplete":
      dispatch({ type: "RUN_DONE" });
      dispatch({ type: "TASK_COMPLETE", taskIndex: msg.taskIndex });
      break;
    case "validationFailed":
      dispatch({ type: "RUN_DONE" });
      showToast(msg.reason || "Not quite right — check the instructions", undefined, undefined, "failure");
      break;
    case "sketchError":
      if (msg.error) {
        (async () => {
          const logEntry = {
            timestamp: new Date().toISOString(),
            route: `/learn/${course}/${id}`,
            error: `[Sketch] ${msg.error}`,
            context: msg.container || "unknown",
          };
          const existing = await AsyncStorage.getItem("error_log");
          const logs = existing ? JSON.parse(existing) : [];
          logs.push(logEntry);
          await AsyncStorage.setItem("error_log", JSON.stringify(logs.slice(-20)));
        })();
      }
      break;
  case "goToNextLesson":
  loadCourse(course).then((courseData) => {
  if (!courseData) return;
  const currentIndex = courseData.exercises.findIndex((l) => l.id === id);
  if (currentIndex >= 0 && currentIndex < courseData.exercises.length - 1) {
  const nextLesson = courseData.exercises[currentIndex + 1];
  router.replace(`/learn/${course}/${nextLesson.id}`);
  } else {
  router.replace(`/learn/${course}`);
  }
  });
  break;
 }
 } catch {}
 },
 [router, course, id, handleReset]
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
 }, []);

 const handleToggleKeyboardMode = useCallback(() => {
 setKeyboardMode((prev) => (prev === "programming" ? "qwerty" : "programming"));
 }, []);

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
    streak.consumePendingToast().then((data) => {
      if (data) {
        setStreakToastVisible(true);
      }
    });
  }, []);

  const handleShake = useCallback(() => {
    setShakeModalVisible(true);
  }, []);

  useShakeDetection(handleShake, { enabled: !state.loading && !!state.exercise });

  useEffect(() => {
    if (editorViewReady && webViewRef.current && state.exercise?.tasks) {
      const task = state.exercise.tasks[state.currentTaskIndex];
      if (task) {
        const instructionHtml = task.instruction
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        webViewRef.current.postMessage(
          JSON.stringify({
            type: "setActiveTask",
            taskIndex: state.currentTaskIndex,
            instructionHtml,
          })
        );
      }
    }
  }, [state.currentTaskIndex, editorViewReady, state.exercise]);

  useFocusEffect(
 useCallback(() => {
 AsyncStorage.getItem("setting_editorTheme").then((val) => {
 setEditorTheme(val || "p5-learn");
 });
 AsyncStorage.getItem("setting_codeFontSize").then((val) => {
 setCodeFontSize(val ? parseInt(val, 10) : DEFAULTS.codeFontSize);
 });
  AsyncStorage.getItem("setting_keyboardHeight").then((val) => {
  setKeyboardHeight(val || "medium");
  });
  AsyncStorage.getItem("setting_wordWrap").then((val) => {
  setWordWrap(val === "true");
  });
  }, [])
);

 const changeCodeFontSize = useCallback((delta: number) => {
 setCodeFontSize((prev) => {
 const newSize = Math.min(DEFAULTS.codeFontSizeMax, Math.max(DEFAULTS.codeFontSizeMin, prev + delta));
 AsyncStorage.setItem("setting_codeFontSize", newSize.toString());
 if (webViewRef.current && editorViewReady) {
 webViewRef.current.postMessage(JSON.stringify({ type: "setFontSize", fontSize: newSize }));
 }
 return newSize;
 });
 }, [editorViewReady]);

 const changeEditorTheme = useCallback((value: string) => {
 setEditorTheme(value);
 AsyncStorage.setItem("setting_editorTheme", value);
 setToastKey((k) => k + 1);
 setToastMessage("Editor theme updated");
 setToastVisible(true);
 }, []);

 const changeKeyboardHeight = useCallback((value: string) => {
  setKeyboardHeight(value);
  AsyncStorage.setItem("setting_keyboardHeight", value);
  }, []);

 const changeWordWrap = useCallback((value: boolean) => {
  setWordWrap(value);
  AsyncStorage.setItem("setting_wordWrap", value.toString());
  }, []);

 const handleToastNext = useCallback(() => {
  setToastVisible(false);
  if (!state.exercise) return;
  loadCourse(course).then((courseData) => {
  if (!courseData) return;
  const currentIndex = courseData.exercises.findIndex((l) => l.id === id);
  if (currentIndex >= 0 && currentIndex < courseData.exercises.length - 1) {
  const nextLesson = courseData.exercises[currentIndex + 1];
  router.replace(`/learn/${course}/${nextLesson.id}`);
  } else {
  router.replace(`/learn/${course}`);
  }
  });
  }, [state.exercise, course, id, router]);

 useEffect(() => {
  if (!state.completed || !state.exercise) return;

  const key = `${course}/${state.exercise.id}`;

  showToast("✓ Exercise completed!", "Next →", handleToastNext, "success");

  (async () => {
  const val = await AsyncStorage.getItem("completedLessons");
  const arr: string[] = val ? JSON.parse(val) : [];
  if (!arr.includes(key)) {
  arr.push(key);
  await AsyncStorage.setItem("completedLessons", JSON.stringify(arr));
  }

  const courseData = await loadCourse(course);
  if (!courseData) return;

  const allDone = courseData.exercises.every((l) =>
  arr.includes(`${course}/${l.id}`)
  );
  if (allDone) {
  const prev = await AsyncStorage.getItem("completedCourses");
  const courses: string[] = prev ? JSON.parse(prev) : [];
  if (!courses.includes(course)) {
  courses.push(course);
  await AsyncStorage.setItem("completedCourses", JSON.stringify(courses));
  }
  }
  })();
  }, [state.completed, state.exercise, course, webViewReady, handleToastNext]);

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
 return 16;
 }, [keyboardVisible, keyboardHeight]);

 const keyboardFabBottom = useMemo(() => {
 return runButtonBottom + 60;
 }, [runButtonBottom]);

if (state.loading) {
 return (
 <View style={styles.loadingContainer}>
 <MaterialCommunityIcons name="loading" size={32} color={derivedColors.primary} />
 </View>
 );
 }

 if (state.error) {
 return (
 <View style={styles.notFoundContainer}>
 <View style={styles.notFoundInner}>
 <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.error} />
 <Text style={styles.notFoundTitle}>
 Load Error
 </Text>
 <Text style={styles.notFoundSubtitle}>
 {state.error}
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

 if (!state.exercise) {
 return (
 <View style={styles.notFoundContainer}>
 <View style={styles.notFoundInner}>
 <MaterialCommunityIcons name="alert-circle-outline" size={48} color={derivedColors.primary} />
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
  onPress={() => router.push(`/learn/${course}`)}
  style={styles.menuButton}
  accessibilityRole="button"
  accessibilityLabel="Go back"
  >
  <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurfaceVariant} />
  </Pressable>
  <Text style={styles.logoText} numberOfLines={1}>
  {state.exercise?.title ?? ""}
  </Text>
  <View style={styles.spacer} />
  <Pressable
  onPress={() => setSettingsMenuVisible(true)}
  style={styles.menuButton}
  accessibilityRole="button"
  accessibilityLabel="Editor settings"
  >
  <MaterialCommunityIcons name="dots-vertical" size={24} color={colors.onSurfaceVariant} />
  </Pressable>
  </View>

  {courseTitle && (
  <Breadcrumbs
  segments={[
    { label: "Learn", href: "/learn" },
    { label: courseTitle, href: `/learn/${course}` },
    { label: state.exercise?.title ?? "" },
  ]}
  />
  )}

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
  {...({
    hideKeyboardAccessoryView: true,
    keyboardDisplayRequiresUserAction: true,
  } as Record<string, boolean>)}
 />
)}

 <View
 style={[
 styles.fabWrapper,
 { bottom: runButtonBottom },
 ]}
 pointerEvents="box-none"
 >
 <Pressable
 onPress={handleRun}
 disabled={state.isRunning}
  style={({ pressed }) => [
  styles.runButton,
  { backgroundColor: ctaColor },
  pressed && styles.runButtonPressed,
  ]}
 accessibilityRole="button"
 accessibilityLabel="Run sketch"
 accessibilityState={{ disabled: state.isRunning }}
 >
 <MaterialCommunityIcons
 name={state.isRunning ? "reload" : "play"}
 size={28}
 color="#FFFFFF"
 />
 </Pressable>
 </View>

  <StreakToast
  visible={streakToastVisible}
  streakCount={streak.count}
  tierProgress={streak.tierProgress}
  nextTier={streak.nextTier}
  onDismiss={() => setStreakToastVisible(false)}
  />

  <ShakeModal
  visible={shakeModalVisible}
  onDismiss={() => setShakeModalVisible(false)}
  title="Exercise"
  subtitle="What would you like to do?"
  actions={[
    {
      icon: "lightbulb-outline",
      label: "Get Hint",
      variant: "primary",
      onPress: () => {
        setShakeModalVisible(false);
        const hint = "Read the instructions above and check the reference for function syntax.";
        showToast(hint, "Open Ref", () => {
          if (exerciseSymbols.length > 0) {
            router.push(`/ref?symbol=${exerciseSymbols[0]}`);
          }
        });
      },
    },
    {
      icon: "restart",
      label: "Reset Code",
      variant: "secondary",
      onPress: () => {
        setShakeModalVisible(false);
        handleReset();
      },
    },
    {
      icon: "book-open-variant",
      label: "View Reference",
      variant: "secondary",
      onPress: () => {
        setShakeModalVisible(false);
        if (exerciseSymbols.length > 0) {
          router.push(`/ref?symbol=${exerciseSymbols[0]}`);
        } else {
          router.push("/ref");
        }
      },
    },
    {
      icon: "close",
      label: "Dismiss",
      variant: "ghost",
      onPress: () => setShakeModalVisible(false),
    },
  ]}
  />

  <Toast
    key={toastKey}
    visible={toastVisible}
    message={toastMessage}
    actionLabel={toastActionLabel}
    onAction={toastActionRef.current}
    onDismiss={() => setToastVisible(false)}
    icon={toastIcon}
    iconColor={toastIconColor}
  />

 {keyboardVisible && keyboardMode === "programming" && (
 <ProgrammingKeyboard
 onInsert={handleInsert}
 exerciseSymbols={exerciseSymbols}
 onToggleKeyboard={handleToggleKeyboard}
 onToggleQwerty={handleToggleKeyboardMode}
 onBackspace={handleBackspace}
 onNewline={handleNewline}
 onFormat={handleFormat}
 onCursorMove={handleCursorMove}
 onOpenReference={(symbol) => router.push(`/ref?symbol=${symbol}`)}
 keyboardVisible={keyboardVisible}
 usedFunctions={usedFunctions}
 height={DEFAULTS.keyboardHeightPixels[keyboardHeight] ?? DEFAULTS.keyboardHeightPixels.medium}
 />
)}

 {keyboardVisible && keyboardMode === "qwerty" && (
 <QwertyKeyboard
 onInsert={handleInsert}
 onBackspace={handleBackspace}
 onNewline={handleNewline}
 onCursorMove={handleCursorMove}
 onToggleProgramming={handleToggleKeyboardMode}
 height={DEFAULTS.keyboardHeightPixels[keyboardHeight] ?? DEFAULTS.keyboardHeightPixels.medium}
 />
)}

 {!keyboardVisible && (
 <Pressable
 onPress={handleToggleKeyboard}
 style={({ pressed }) => [
 styles.keyboardFab,
 { bottom: keyboardFabBottom },
 pressed && styles.keyboardFabPressed,
 ]}
 accessibilityRole="button"
 accessibilityLabel="Show custom keyboard"
 >
  <MaterialCommunityIcons name="keyboard-variant" size={24} color={derivedColors.primary} />
 </Pressable>
)}

 <Modal
 visible={settingsMenuVisible}
 transparent
 animationType="fade"
 onRequestClose={() => setSettingsMenuVisible(false)}
 >
 <Pressable
 style={styles.modalOverlay}
 onPress={() => setSettingsMenuVisible(false)}
 >
 <Pressable
 style={[styles.modalCard, { backgroundColor: colors.surfaceContainerHigh }]}
 onPress={() => {}}
 >
 <View style={styles.modalHeader}>
 <Text style={[styles.modalTitle, { color: colors.onSurface }]}>Editor Settings</Text>
 <Pressable
 onPress={() => setSettingsMenuVisible(false)}
 accessibilityRole="button"
 accessibilityLabel="Close settings"
 >
 <MaterialCommunityIcons name="close" size={24} color={colors.onSurfaceVariant} />
 </Pressable>
 </View>

 <View style={styles.modalSection}>
 <Text style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>Font Size</Text>
 <View style={styles.modalRow}>
 <Pressable
 onPress={() => changeCodeFontSize(-2)}
 style={({ pressed }) => ({
 width: 36,
 height: 36,
 borderRadius: 8,
 backgroundColor: pressed ? derivedColors.primaryContainer : colors.surfaceContainer,
 alignItems: "center",
 justifyContent: "center",
 })}
 >
 <Text style={{ fontSize: 18, fontWeight: "700", color: colors.onSurface }}>−</Text>
 </Pressable>
 <Text style={{ fontFamily: "JetBrainsMono", fontSize: 16, fontWeight: "700", color: colors.onSurface, minWidth: 32, textAlign: "center" }}>
 {codeFontSize}
 </Text>
 <Pressable
 onPress={() => changeCodeFontSize(2)}
 style={({ pressed }) => ({
 width: 36,
 height: 36,
 borderRadius: 8,
 backgroundColor: pressed ? derivedColors.primaryContainer : colors.surfaceContainer,
 alignItems: "center",
 justifyContent: "center",
 })}
 >
 <Text style={{ fontSize: 18, fontWeight: "700", color: colors.onSurface }}>+</Text>
 </Pressable>
 </View>
 </View>

 <View style={styles.modalSection}>
 <Text style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>Theme</Text>
 <View style={styles.modalRow}>
 <Text style={{ fontFamily: "JetBrainsMono", fontSize: 14, color: colors.onSurface }}>
 {colorScheme === "dark" ? "Dark Mode" : "Light Mode"}
 </Text>
  <Switch
  value={colorScheme === "dark"}
  onValueChange={toggleTheme}
   trackColor={{ false: "#767577", true: ctaColor }}
  thumbColor="#ffffff"
  />
 </View>
 </View>

 <View style={styles.modalSection}>
 <Text style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>Editor Theme</Text>
 <View style={[styles.modalRow, { flexWrap: "wrap", gap: 6 }]}>
 {Object.entries(EDITOR_THEMES).map(([key, theme]) => {
 const swatches = getThemeSwatches(key, colorScheme === "dark" ? "dark" : "light");
 return (
 <Pressable
 key={key}
 onPress={() => changeEditorTheme(key)}
 style={({ pressed }) => ({
 flexDirection: "row",
 alignItems: "center",
 gap: 6,
 paddingHorizontal: 10,
 paddingVertical: 5,
 borderRadius: 6,
  borderBottomWidth: editorTheme === key ? 2 : 0,
  borderBottomColor: editorTheme === key ? derivedColors.primary : "transparent",
  backgroundColor: pressed ? derivedColors.primaryContainer + "33" : colors.surfaceContainer,
  })}
  >
  <View style={{ flexDirection: "row", gap: 2 }}>
  {swatches.map((s, i) => (
  <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s }} />
  ))}
  </View>
  <Text style={{
  fontFamily: "JetBrainsMono",
  fontSize: 11,
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  color: colors.onSurfaceVariant,
 }}>
 {theme.label}
 </Text>
 </Pressable>
);
 })}
 </View>
 </View>

  <View style={styles.modalSection}>
  <Text style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>Keyboard Height</Text>
  <View style={styles.modalRow}>
  {["small", "medium", "tall"].map((opt) => (
  <Pressable
  key={opt}
  onPress={() => changeKeyboardHeight(opt)}
  style={({ pressed }) => ({
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 6,
  minWidth: 42,
  alignItems: "center",
  borderBottomWidth: keyboardHeight === opt ? 2 : 0,
  borderBottomColor: keyboardHeight === opt ? derivedColors.primary : "transparent",
  backgroundColor: pressed ? derivedColors.primaryContainer + "33" : colors.surfaceContainer,
  })}
  >
  <Text style={{
  fontFamily: "JetBrainsMono",
  fontSize: 11,
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  color: colors.onSurfaceVariant,
  }}>
  {opt === "small" ? "S" : opt === "medium" ? "M" : "T"}
  </Text>
  </Pressable>
))}
  </View>
  </View>

  <View style={styles.modalSection}>
  <Text style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>Word Wrap</Text>
  <View style={styles.modalRow}>
  {[
    { label: "Off", value: false },
    { label: "On", value: true },
  ].map((opt) => (
  <Pressable
  key={opt.label}
  onPress={() => changeWordWrap(opt.value)}
  style={({ pressed }) => ({
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 6,
  minWidth: 42,
  alignItems: "center",
  borderBottomWidth: wordWrap === opt.value ? 2 : 0,
  borderBottomColor: wordWrap === opt.value ? derivedColors.primary : "transparent",
  backgroundColor: pressed ? derivedColors.primaryContainer + "33" : colors.surfaceContainer,
  })}
  >
  <Text style={{
  fontFamily: "JetBrainsMono",
  fontSize: 11,
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  color: colors.onSurfaceVariant,
  }}>
  {opt.label}
  </Text>
  </Pressable>
))}
  </View>
  </View>
 </Pressable>
 </Pressable>
 </Modal>
 </View>
);
}
