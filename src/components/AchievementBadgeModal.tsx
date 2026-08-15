import { useEffect, useMemo, useRef } from "react";
import { View, Text, Modal, Pressable, StyleSheet, FlatList, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";
import { Achievement, ACHIEVEMENTS } from "../hooks/useAchievements";

interface Props {
  visible: boolean;
  startIndex: number;
  unlocked: string[];
  unlockedAt: Record<string, string>;
  onDismiss: () => void;
}

const SCREEN_WIDTH = Dimensions.get("window").width;

function formatDate(iso?: string): string {
  if (!iso) return "Previously unlocked";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Previously unlocked";
  }
}

export default function AchievementBadgeModal({
  visible,
  startIndex,
  unlocked,
  unlockedAt,
  onDismiss,
}: Props) {
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const listRef = useRef<FlatList>(null);
  const indexRef = useRef(startIndex);

  // The unlocked order ( oldest unlock first ), mapped to full achievement
  // objects. Tapping a badge on the dashboard opens this at that badge's
  // position; swipe left/right moves to the next/prev unlocked badge.
  const items = useMemo<Achievement[]>(() => {
    return unlocked
      .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
      .filter((a): a is Achievement => Boolean(a));
  }, [unlocked]);

  useEffect(() => {
    if (!visible) return;
    indexRef.current = Math.max(0, Math.min(startIndex, items.length - 1));
    const t = setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: indexRef.current,
        animated: false,
      });
    }, 60);
    return () => clearTimeout(t);
  }, [visible, startIndex, items.length]);

  const currentIndex = indexRef.current;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable style={[styles.card, { backgroundColor: colors.surfaceContainerHigh }]} onPress={() => {}}>
          {items.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No achievements unlocked yet.
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                ref={listRef}
                data={items}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onScrollToIndexFailed={(info) => {
                  listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
                }}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                  indexRef.current = Math.max(0, Math.min(idx, items.length - 1));
                }}
                getItemLayout={(_, index) => ({
                  length: SCREEN_WIDTH,
                  offset: SCREEN_WIDTH * index,
                  index,
                })}
                renderItem={({ item }) => {
                  const earnedAt = unlockedAt[item.id];
                  return (
                    <View style={[styles.page, { width: SCREEN_WIDTH }]}>
                      <View style={[styles.badgeCircle, { backgroundColor: derivedColors.primary, borderColor: colors.surface }]}>
                        <MaterialCommunityIcons name={item.icon as any} size={56} color={colors.onPrimary} />
                      </View>
                      <Text style={[styles.badgeTitle, { color: colors.onSurface }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.badgeSubtitle, { color: derivedColors.primary }]}>
                        {item.subtitle}
                      </Text>
                      <View style={[styles.ruleBox, { backgroundColor: colors.surfaceDim, borderLeftColor: derivedColors.primary }]}>
                        <Text style={[styles.ruleLabel, { color: colors.textSecondary }]}>
                          HOW TO EARN
                        </Text>
                        <Text style={[styles.ruleText, { color: colors.onSurface }]}>
                          {item.rule}
                        </Text>
                      </View>
                      <Text style={[styles.earnedDate, { color: colors.textSecondary }]}>
                        Earned {formatDate(earnedAt)}
                      </Text>
                    </View>
                  );
                }}
              />
              <View style={styles.footerRow}>
                <Text style={[styles.counter, { color: colors.textSecondary }]}>
                  {Math.min(currentIndex + 1, items.length)} / {items.length}
                </Text>
                <Text style={[styles.swipeHint, { color: colors.textSecondary }]}>
                  Swipe ← / →
                </Text>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 420,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyWrap: { paddingVertical: 40, alignItems: "center" },
  emptyText: { fontFamily: "JetBrainsMono", fontSize: 14 },
  page: { alignItems: "center", paddingHorizontal: 16, paddingVertical: 8 },
  badgeCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  badgeTitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  badgeSubtitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
  ruleBox: {
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    marginTop: 20,
    width: "100%",
  },
  ruleLabel: {
    fontFamily: "JetBrainsMono",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  ruleText: {
    fontFamily: "JetBrainsMono",
    fontSize: 13,
    lineHeight: 20,
  },
  earnedDate: {
    fontFamily: "JetBrainsMono",
    fontSize: 12,
    marginTop: 18,
    textAlign: "center",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 8,
  },
  counter: { fontFamily: "JetBrainsMono", fontSize: 12, fontWeight: "700" },
  swipeHint: { fontFamily: "JetBrainsMono", fontSize: 11 },
});