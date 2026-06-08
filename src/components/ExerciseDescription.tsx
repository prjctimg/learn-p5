import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ExerciseDescriptionProps {
  title: string;
  moduleName: string;
  instruction: string;
  exerciseNumber?: number;
}

export default function ExerciseDescription({
  title,
  moduleName,
  instruction,
  exerciseNumber = 1,
}: ExerciseDescriptionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View className="bg-surface-container dark:bg-surface-container-dark px-4 py-3 border-b border-outline-variant dark:border-outline-variant-dark">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-2">
          <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-1">
            Exercise {exerciseNumber}: {title}
          </Text>
          <Text className="text-on-surface-variant dark:text-on-surface-variant-dark text-sm leading-relaxed">
            {expanded ? instruction : `${instruction.slice(0, 60)}...`}
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
