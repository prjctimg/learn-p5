import { useRef, useState, useCallback } from "react";
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
import { buildSketchHTML, DEFAULT_SKETCH, EXERCISE_SOLUTIONS } from "../../../utils/sketchTemplate";

const exercises: Record<string, { title: string; module: string; instruction: string }> = {
  "exercise-1": {
    title: "The First Circle",
    module: "Shapes",
    instruction:
      'Modify the circle() function parameters to draw a circle at the exact center of the canvas.',
  },
};

export default function Exercise() {
  const { course, id } = useLocalSearchParams<{ course: string; id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { openDrawer } = useDrawerContext();

  const exercise = exercises[id ?? ""];

  const [code, setCode] = useState(DEFAULT_SKETCH);
  const [solutionHTML, setSolutionHTML] = useState("");
  const [userHTML, setUserHTML] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const runCounter = useRef(0);

  const handleRun = useCallback(() => {
    if (!exercise) return;
    runCounter.current += 1;
    const counter = runCounter.current;

    setIsRunning(true);

    const userHtml = buildSketchHTML(code);
    setUserHTML(userHtml);

    const solution = EXERCISE_SOLUTIONS[id ?? ""];
    if (solution) {
      setSolutionHTML(buildSketchHTML(solution));
      setShowSolution(true);
    }

    setTimeout(() => {
      if (counter === runCounter.current) {
        setIsRunning(false);
      }
    }, 600);
  }, [code, id, exercise]);

  const handleInsert = useCallback(
    (text: string) => {
      setCode((prev) => prev + text);
    },
    []
  );

  if (!exercise) {
    return (
      <View className="flex-1 bg-surface dark:bg-surface-dark">
        <View className="flex-1 items-center justify-center px-6">
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ED225D" />
          <Text className="font-headline text-xl font-bold text-on-surface dark:text-on-surface-dark mt-4">
            Exercise not found
          </Text>
          <Text className="font-body text-sm text-text-secondary dark:text-text-secondary-dark mt-2 text-center">
            The exercise "{id}" doesn't exist yet.
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
          title={exercise.title}
          moduleName={exercise.module}
          instruction={exercise.instruction}
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
              {solutionHTML && showSolution ? (
                <WebView
                  source={{ html: solutionHTML }}
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
              {userHTML ? (
                <WebView
                  source={{ html: userHTML }}
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
          code={code}
          onChange={setCode}
          onRun={handleRun}
          isRunning={isRunning}
        />

        <ProgrammingKeyboard onInsert={handleInsert} />

        <BottomNavBar />
      </View>
    </View>
  );
}
