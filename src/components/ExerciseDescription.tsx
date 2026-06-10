import { useState, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { P5_FUNCTION_NAMES } from "../data/p5Symbols";

interface ExerciseDescriptionProps {
  title: string;
  moduleName: string;
  instruction: string;
  exerciseNumber?: number;
}

function parseInstruction(
  text: string,
  symbolNames: string[]
): { text: string; isSymbol: boolean }[] {
  if (!text) return [{ text: "", isSymbol: false }];

  const symbolPattern = new RegExp(
    `\\b(${symbolNames
      .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")})\\b`,
    "g"
  );

  const parts: { text: string; isSymbol: boolean }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = symbolPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), isSymbol: false });
    }
    parts.push({ text: match[0], isSymbol: true });
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
}: ExerciseDescriptionProps) {
  const [expanded, setExpanded] = useState(true);
  const router = useRouter();

  const parts = useMemo(
    () => parseInstruction(instruction, P5_FUNCTION_NAMES),
    [instruction]
  );

  const displayParts =
    expanded ? parts : parseInstruction(
        `${instruction.slice(0, 60)}...`,
        P5_FUNCTION_NAMES
      ).slice(0, 10);

  const handleSymbolPress = (name: string) => {
    router.push(`/ref?symbol=${name}`);
  };

  return (
    <View className="bg-surface-container dark:bg-surface-container-dark px-4 py-3 border-b border-outline-variant dark:border-outline-variant-dark">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-2">
          <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-1">
            Exercise {exerciseNumber}: {title}
          </Text>
          <Text className="text-on-surface-variant dark:text-on-surface-variant-dark text-sm leading-relaxed">
            {displayParts.map((part, i) =>
              part.isSymbol ? (
                <Text
                  key={i}
                  className="text-primary font-bold underline"
                  onPress={() => handleSymbolPress(part.text)}
                >
                  {part.text}
                </Text>
              ) : (
                <Text key={i}>{part.text}</Text>
              )
            )}
          </Text>
        </View>
        <Pressable
          onPress={() => setExpanded((p) => !p)}
          className="p-1"
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Collapse description" : "Expand description"}
        >
          <MaterialCommunityIcons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#E4BDC0"
          />
        </Pressable>
      </View>
    </View>
  );
}
