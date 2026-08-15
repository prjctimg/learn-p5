import { useState } from "react";
import { View, Text, Pressable, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";
import { P5_FUNCTION_NAMES, P5_SYMBOLS_BY_NAME } from "../data/reference";
import { useModuleProgress } from "../hooks/useModuleProgress";

const SYMBOL_PATTERN = new RegExp(
  `\\b(${P5_FUNCTION_NAMES.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b(?=\\()`,
  "g"
);

interface ExerciseDescriptionProps {
  title: string;
  moduleName: string;
  instruction: string;
  exerciseNumber?: number;
  course?: string;
}

function parseInstruction(
  text: string
): { text: string; isSymbol: boolean }[] {
  if (!text) return [{ text: "", isSymbol: false }];

  const parts: { text: string; isSymbol: boolean }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const seenSymbols = new Set<string>();

  SYMBOL_PATTERN.lastIndex = 0;

  while ((match = SYMBOL_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), isSymbol: false });
    }
    const isFirst = !seenSymbols.has(match[0]);
    seenSymbols.add(match[0]);
    parts.push({ text: match[0], isSymbol: isFirst });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isSymbol: false });
  }

  return parts.length > 0 ? parts : [{ text, isSymbol: false }];
}

export default function ExerciseDescription({
  title,
  moduleName,
  instruction,
  exerciseNumber = 1,
  course,
}: ExerciseDescriptionProps) {
  const [expanded, setExpanded] = useState(true);
  const router = useRouter();
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { getLockedCourseName } = useModuleProgress();

  const parts = parseInstruction(instruction);

  const displayParts =
    expanded ? parts : parseInstruction(
        `${instruction.slice(0, 60)}...`
      ).slice(0, 10);

  const handleSymbolPress = (name: string) => {
    const lockedCourse = getLockedCourseName(P5_SYMBOLS_BY_NAME[name]?.module ?? "", course);
    if (lockedCourse) {
      Alert.alert(
        "Module Locked",
        `Complete the "${lockedCourse}" course to unlock this reference.`
      );
      return;
    }
    router.push(`/ref?symbol=${name}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainer }]}>
      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.primary }]}>
            Exercise {exerciseNumber}: {title}
          </Text>
          <Text style={[styles.instruction, { color: colors.onSurfaceVariant }]}>
            {displayParts.map((part, i) =>
              part.isSymbol ? (
                <Text
                  key={`sym-${part.text}`}
                  style={[styles.symbol, { color: colors.primary }]}
                  onPress={() => handleSymbolPress(part.text)}
                >
                  {part.text}
                </Text>
              ) : (
                <Text key={`txt-${part.text}-${i}`}>{part.text}</Text>
              )
            )}
          </Text>
        </View>
        <Pressable
          onPress={() => setExpanded((p) => !p)}
          style={styles.chevronButton}
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Collapse description" : "Expand description"}
        >
          <MaterialCommunityIcons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.onSurfaceVariant}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontFamily: "JetBrainsMono",
    fontWeight: "700",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  instruction: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
    lineHeight: 24,
  },
  symbol: {
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  chevronButton: {
    padding: 4,
  },
});
