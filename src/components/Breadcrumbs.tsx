import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  segments: BreadcrumbSegment[];
}

export default function Breadcrumbs({ segments }: BreadcrumbsProps) {
  const router = useRouter();
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <View style={styles.container}>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const isClickable = !!segment.href && !isLast;

        return (
          <View key={index} style={styles.segmentRow}>
            {index > 0 && (
              <MaterialCommunityIcons
                name="chevron-right"
                size={14}
                color={colors.textSecondary}
                style={styles.separator}
              />
            )}
            {isClickable ? (
              <Pressable
                onPress={() => router.push(segment.href!)}
                style={styles.segmentButton}
                accessibilityRole="button"
                accessibilityLabel={`Go to ${segment.label}`}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: colors.primary },
                  ]}
                >
                  {segment.label}
                </Text>
              </Pressable>
            ) : (
              <Text
                style={[
                  styles.segmentText,
                  isLast
                    ? [styles.currentSegment, { color: colors.onSurface }]
                    : { color: colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {segment.label}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexWrap: "wrap",
    gap: 2,
  },
  segmentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  separator: {
    marginHorizontal: 2,
  },
  segmentButton: {
    paddingVertical: 2,
  },
  segmentText: {
    fontFamily: "JetBrainsMono",
    fontSize: 12,
    fontWeight: "500",
  },
  currentSegment: {
    fontWeight: "700",
  },
});
