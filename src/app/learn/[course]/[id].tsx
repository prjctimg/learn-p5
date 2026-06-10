import { useRef, useState, useEffect, useReducer } from "react";
import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { useDrawerContext } from "../../../contexts/DrawerContext";
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
      <View className="flex-1 bg-surface dark:bg-surface-dark items-center justify-center">
        <MaterialCommunityIcons name="loading" size={32} color="#ED225D" />
      </View>
    );
  }

  if (!state.exercise) {
    return (
      <View className="flex-1 bg-surface dark:bg-surface-dark">
        <View className="flex-1 items-center justify-center px-6">
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ED225D" />
          <Text className="font-headline text-xl font-bold text-on-surface dark:text-on-surface-dark mt-4">
            Exercise not found
          </Text>
          <Text className="font-body text-sm text-text-secondary dark:text-text-secondary-dark mt-2 text-center">
            The exercise &ldquo;{id}&rdquo; doesn&apos;t exist yet.
          </Text>
          <View className="mt-6">
            <Pressable
              onPress={() => router.push(`/learn/${course}`)}
              className="bg-primary px-6 py-3 border-2 border-outline dark:border-outline-dark active:translate-y-0.5"
              accessibilityRole="button"
              accessibilityLabel="Back to course"
            >
              <Text className="font-headline font-black text-sm uppercase tracking-wider text-on-primary">
                Back to course
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark">
      <View
        style={{ paddingTop: insets.top + 4 }}
        className="flex-row items-center px-4 pb-3 bg-background dark:bg-surface-dark border-b border-outline-variant dark:border-outline-variant-dark"
      >
        <Pressable
          onPress={openDrawer}
          className="p-2"
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
        >
          <MaterialCommunityIcons name="menu" size={24} color="#FFB2BB" />
        </Pressable>
        <Text className="font-headline text-xl font-bold text-primary ml-2 uppercase tracking-tight">
          P5.LEARN
        </Text>
        <View className="flex-1" />
      </View>

      <View className="flex-1">
        <ExerciseDescription
          title={state.exercise.title}
          moduleName={state.exercise.module}
          instruction={state.exercise.instruction}
          exerciseNumber={parseInt(id?.replace("exercise-", "") ?? "1", 10)}
        />

        <View className="flex-row border-b border-outline-variant dark:border-outline-variant-dark bg-background dark:bg-surface-dark" style={{ height: 260 }}>
          <View className="flex-1 flex-col border-r border-outline-variant dark:border-outline-variant-dark">
            <View className="h-6 bg-surface-container-high dark:bg-surface-container-high-dark px-2 flex-row items-center">
              <Text className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-on-surface-variant-dark">
                Target Solution
              </Text>
            </View>
            <View className="flex-1 bg-surface-container-lowest dark:bg-surface-container-lowest-dark items-center justify-center overflow-hidden">
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
                <View className="w-12 h-12 rounded-full border-2 border-primary-container dark:border-primary-container opacity-50" />
              )}
            </View>
          </View>

          <View className="flex-1 flex-col">
            <View className="h-6 bg-surface-container-high dark:bg-surface-container-high-dark px-2 flex-row items-center">
              <Text className="text-[9px] font-bold uppercase tracking-widest text-primary">
                Your Output
              </Text>
            </View>
            <View className="flex-1 bg-black items-center justify-center overflow-hidden">
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
                <View className="w-10 h-10 rounded-full border-2 border-primary opacity-50" />
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
