import { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useThemeContext } from "../components/ThemeProvider";
import { Colors } from "../constants/Colors";
import Header from "../components/Header";

export default function Dashboard() {
  const router = useRouter();
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.surface,
        },
        inner: {
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 32,
        },
        title: {
          fontFamily: "SpaceGrotesk",
          fontSize: 30,
          fontWeight: "700",
          color: colors.onSurface,
        },
        subtitle: {
          fontFamily: "Inter",
          fontSize: 13,
          color: colors.textSecondary,
          marginTop: 4,
        },
        progressBarOuter: {
          height: 8,
          backgroundColor: colors.surfaceDim,
          borderRadius: 9999,
          marginTop: 16,
          overflow: "hidden",
        },
        progressBarInner: {
          height: "100%",
          width: "84%",
          backgroundColor: colors.primary,
          borderRadius: 9999,
        },
        statsRow: {
          flexDirection: "row",
          gap: 12,
          marginTop: 24,
        },
        statCard: {
          flex: 1,
          backgroundColor: colors.primary + "1A",
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 16,
          alignItems: "center",
        },
        statValue: {
          fontFamily: "SpaceGrotesk",
          fontSize: 24,
          fontWeight: "700",
          color: colors.primary,
        },
        statLabel: {
          fontFamily: "Inter",
          fontSize: 11,
          color: colors.textSecondary,
          marginTop: 4,
        },
        quickActionsSection: {
          marginTop: 40,
        },
        sectionTitle: {
          fontFamily: "SpaceGrotesk",
          fontSize: 24,
          fontWeight: "700",
          color: colors.onSurface,
          marginBottom: 16,
        },
        actionsContainer: {
          gap: 12,
        },
        actionCard: {
          backgroundColor: colors.surfaceDim,
          borderRadius: 12,
          paddingHorizontal: 20,
          paddingVertical: 16,
        },
        actionCardPressed: {
          opacity: 0.8,
        },
        actionCardTitle: {
          fontFamily: "SpaceGrotesk",
          fontSize: 18,
          fontWeight: "700",
          color: colors.onSurface,
        },
        actionCardSubtitle: {
          fontFamily: "Inter",
          fontSize: 13,
          color: colors.textSecondary,
          marginTop: 4,
        },
      }),
    [colorScheme]
  );

  return (
    <View style={styles.container}>
      <Header title="Dashboard" />
      <View style={styles.inner}>
        <Text style={styles.title}>
          Hello, Coder!
        </Text>
        <Text style={styles.subtitle}>
          Level 3 · 84% to next level
        </Text>

        <View style={styles.progressBarOuter}>
          <View style={styles.progressBarInner} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>
              Level
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              2.4k
            </Text>
            <Text style={styles.statLabel}>
              XP
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>7</Text>
            <Text style={styles.statLabel}>
              Streak
            </Text>
          </View>
        </View>

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.actionsContainer}>
            <Pressable
              onPress={() => router.push("/learn/shapes/exercise-1")}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Continue Learning"
            >
              <Text style={styles.actionCardTitle}>
                Continue Learning
              </Text>
              <Text style={styles.actionCardSubtitle}>
                Pick up where you left off
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/learn/shapes")}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Up next"
            >
              <Text style={styles.actionCardTitle}>
                Up next
              </Text>
              <Text style={styles.actionCardSubtitle}>
                Continue your next exercise
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
