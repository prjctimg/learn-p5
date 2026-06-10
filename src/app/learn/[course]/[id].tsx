import { useRef, useState, useEffect, useReducer, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { useDrawerContext } from "../../../contexts/DrawerContext";
import { useThemeContext } from "../../../components/ThemeProvider";
import { Colors } from "../../../constants/Colors";
import ExerciseDescription from "../../../components/ExerciseDescription";
import CodeEditor from "../../../components/CodeEditor";
import ProgrammingKeyboard from "../../../components/ProgrammingKeyboard";
import BottomNavBar from "../../../components/BottomNavBar";
import { buildSketchHTML, DEFAULT_SKETCH } from "../../../utils/sketchTemplate";
import { loadExercise } from "../../../utils/courseLoader";
import { Lesson } from "../../../data/types";

interface ExerciseState {
  exercise: Lesson | null;
  loading: boolean;
  code: string;
  solutionHTML: string;
  userHTML: string;
  isRunning: boolean;
  showSolution: boolean;
}

type ExerciseAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_DONE"; exercise: Lesson | null }
  | { type: "SET_CODE"; code: string }
  | { type: "APPEND_CODE"; text: string }
  | { type: "RUN_START" }
  | { type: "RUN_DONE" };

function exerciseReducer(state: ExerciseState, action: ExerciseAction): ExerciseState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true };
    case "LOAD_DONE":
      return {
        ...state,
        loading: false,
        exercise: action.exercise,
        code: action.exercise?.startingCode ?? state.code,
      };
    case "SET_CODE":
      return { ...state, code: action.code };
    case "APPEND_CODE":
      return { ...state, code: state.code + action.text };
    case "RUN_START":
      return {
        ...state,
        isRunning: true,
        userHTML: buildSketchHTML(state.code),
        solutionHTML: state.exercise?.solution ? buildSketchHTML(state.exercise.solution) : "",
        showSolution: !!state.exercise?.solution,
      };
    case "RUN_DONE":
      return { ...state, isRunning: false };
    default:
      return state;
  }
}

const INITIAL_STATE: ExerciseState = {
  exercise: null,
  loading: true,
  code: DEFAULT_SKETCH,
  solutionHTML: "",
  userHTML: "",
  isRunning: false,
  showSolution: false,
};

export default function Exercise() {
  const { course, id } = useLocalSearchParams<{ course: string; id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { openDrawer } = useDrawerContext();
  const [state, dispatch] = useReducer(exerciseReducer, INITIAL_STATE);
  const runCounter = useRef(0);
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

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
          fontFamily: "SpaceGrotesk",
          fontSize: 20,
          fontWeight: "700",
          color: colors.onSurface,
          marginTop: 16,
        },
        notFoundSubtitle: {
          fontFamily: "Inter",
          fontSize: 13,
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
          borderWidth: 2,
          borderColor: colors.outline,
        },
        backButtonPressed: {
          transform: [{ translateY: 2 }],
        },
        backButtonText: {
          fontFamily: "SpaceGrotesk",
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
          borderBottomWidth: 1,
          borderBottomColor: colors.outlineVariant,
        },
        menuButton: {
          padding: 8,
        },
        logoText: {
          fontFamily: "SpaceGrotesk",
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
        codeAreaContainer: {
          flex: 1,
        },
        splitContainer: {
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: colors.outlineVariant,
          backgroundColor: colors.surface,
        },
        targetSolutionColumn: {
          flex: 1,
          flexDirection: "column",
          borderRightWidth: 1,
          borderRightColor: colors.outlineVariant,
        },
        panelHeader: {
          height: 24,
          backgroundColor: colors.surfaceContainerHigh,
          paddingHorizontal: 8,
          flexDirection: "row",
          alignItems: "center",
        },
        targetHeaderText: {
          fontSize: 9,
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: 1,
          color: colors.onSurfaceVariant,
        },
        yourOutputHeaderText: {
          fontSize: 9,
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: 1,
          color: colors.primary,
        },
        targetPreview: {
          flex: 1,
          backgroundColor: colors.surfaceContainerLowest,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        },
        solutionPlaceholder: {
          width: 48,
          height: 48,
          borderRadius: 9999,
          borderWidth: 2,
          borderColor: colors.primaryContainer,
          opacity: 0.5,
        },
        yourOutputColumn: {
          flex: 1,
          flexDirection: "column",
        },
        yourOutputPreview: {
          flex: 1,
          backgroundColor: "#000000",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        },
        outputPlaceholder: {
          width: 40,
          height: 40,
          borderRadius: 9999,
          borderWidth: 2,
          borderColor: colors.primary,
          opacity: 0.5,
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

  const handleRun = () => {
    if (!state.exercise) return;
    runCounter.current += 1;
    const counter = runCounter.current;

    dispatch({ type: "RUN_START" });

    setTimeout(() => {
      if (counter === runCounter.current) {
        dispatch({ type: "RUN_DONE" });
      }
    }, 600);
  };

  const handleInsert = (text: string) => {
    dispatch({ type: "APPEND_CODE", text });
  };

  if (state.loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="loading" size={32} color="#ED225D" />
      </View>
    );
  }

  if (!state.exercise) {
    return (
      <View style={styles.notFoundContainer}>
        <View style={styles.notFoundInner}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ED225D" />
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
          <MaterialCommunityIcons name="menu" size={24} color="#FFB2BB" />
        </Pressable>
        <Text style={styles.logoText}>
          P5.LEARN
        </Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.codeAreaContainer}>
        <ExerciseDescription
          title={state.exercise.title}
          moduleName={state.exercise.module}
          instruction={state.exercise.instruction}
          exerciseNumber={parseInt(id?.replace("exercise-", "") ?? "1", 10)}
        />

        <View style={[styles.splitContainer, { height: 260 }]}>
          <View style={styles.targetSolutionColumn}>
            <View style={styles.panelHeader}>
              <Text style={styles.targetHeaderText}>
                Target Solution
              </Text>
            </View>
            <View style={styles.targetPreview}>
              {state.solutionHTML && state.showSolution ? (
                <WebView
                  source={{ html: state.solutionHTML }}
                  style={{ flex: 1, width: "100%" }}
                  scrollEnabled={false}
                  bounces={false}
                  javaScriptEnabled
                  domStorageEnabled
                  originWhitelist={["*"]}
                />
              ) : (
                <View style={styles.solutionPlaceholder} />
              )}
            </View>
          </View>

          <View style={styles.yourOutputColumn}>
            <View style={styles.panelHeader}>
              <Text style={styles.yourOutputHeaderText}>
                Your Output
              </Text>
            </View>
            <View style={styles.yourOutputPreview}>
              {state.userHTML ? (
                <WebView
                  source={{ html: state.userHTML }}
                  style={{ flex: 1, width: "100%" }}
                  scrollEnabled={false}
                  bounces={false}
                  javaScriptEnabled
                  domStorageEnabled
                  originWhitelist={["*"]}
                />
              ) : (
                <View style={styles.outputPlaceholder} />
              )}
            </View>
          </View>
        </View>

        <CodeEditor
          code={state.code}
          onChange={(c) => dispatch({ type: "SET_CODE", code: c })}
          onRun={handleRun}
          isRunning={state.isRunning}
        />

        <ProgrammingKeyboard onInsert={handleInsert} />

        <BottomNavBar />
      </View>
    </View>
  );
}
