import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Minigame } from "../data/types";
import { Colors } from "../constants/Colors";
import { useThemeContext } from "./ThemeProvider";

interface MinigameCardProps {
  minigame: Minigame;
  unlocked: boolean;
  onPlay?: () => void;
}

export default function MinigameCard({ minigame, unlocked, onPlay }: MinigameCardProps) {
  const router = useRouter();
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const handlePress = () => {
    if (unlocked) {
      if (onPlay) {
        onPlay();
      } else {
        router.push(`/learn/${minigame.courseSlug}/minigame`);
      }
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surfaceDim, borderColor: colors.outlineVariant }, !unlocked && styles.locked]}
      onPress={handlePress}
      disabled={!unlocked}
      activeOpacity={unlocked ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + "20" }]}>
          <Text style={styles.icon}>🎮</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.onSurface }]}>{minigame.title}</Text>
          <Text style={[styles.gameType, { color: colors.primary }]}>{minigame.gameType.toUpperCase()}</Text>
        </View>
        {!unlocked && (
          <View style={[styles.lockBadge, { backgroundColor: colors.error + "20" }]}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
      </View>

      <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
        {minigame.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.targetContainer}>
          <Text style={[styles.targetLabel, { color: colors.textSecondary }]}>Target Score</Text>
          <Text style={[styles.targetValue, { color: colors.primary }]}>{minigame.targetScore}</Text>
        </View>
        
        {unlocked ? (
          <TouchableOpacity style={[styles.playButton, { backgroundColor: colors.primary }]} onPress={handlePress}>
            <Text style={styles.playButtonText}>Play</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.lockedText, { color: colors.textSecondary }]}>
            Complete {minigame.courseSlug} course to unlock
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  locked: {
    opacity: 0.7,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  gameType: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  lockBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  lockIcon: {
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  targetContainer: {
    alignItems: "center",
  },
  targetLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  targetValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  playButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  lockedText: {
    fontSize: 12,
    textAlign: "right",
    maxWidth: 120,
  },
});
