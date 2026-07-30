import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Modal, Pressable, StyleSheet, FlatList, useWindowDimensions } from "react-native";
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
  const { width: screenWidth } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const pageWidth = screenWidth - 48;

  const items = useMemo<Achievement[]>(() => {
    return unlocked
      .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
      .filter((a): a is Achievement => Boolean(a));
  }, [unlocked]);

  useEffect(() => {
    if (!visible) return;
    const idx = Math.max(0, Math.min(startIndex, items.length - 1));
    setCurrentIndex(idx);
    const t = setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: idx,
        animated: false,
        viewOffset: 0,
      });
    }, 60);
    return () => clearTimeout(t);
  }, [visible, startIndex, items.length]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable style={[styles.card, { backgroundColor: colors.surfaceContainerHigh, width: pageWidth }]} onPress={() => {}}>
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
                  const idx = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
                  setCurrentIndex(Math.max(0, Math.min(idx, items.length - 1)));
                }}
                getItemLayout={(_, index) => ({
                  length: pageWidth,
                  offset: pageWidth * index,
                  index,
                })}
                renderItem={({ item }) => {
                  const earnedAt = unlockedAt[item.id];
                  return (
                    <View style={[styles.page, { width: pageWidth }]}>
                      <View style={[styles.badgeCircle, { backgroundColor: derivedColors.primary, borderColor: colors.surface }]}>
                        <MaterialCommunityIcons name={item.icon as any} size={56} color={colors.onPrimary} />
                      </View>
                      <Text style={[styles.badgeTitle, { color: colors.onSurface }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.badgeSubtitle, { color: derivedColors.primary }]}>
                        {item.subtitle}
                      </Text>
                      <Text style={[styles.earnedDate, { color: colors.textSecondary }]}>
                        Earned {formatDate(earnedAt)}
                      </Text>
                    </View>
                  );
                }}
              />
              <View style={styles.footerRow}>
                <View style={styles.dotsContainer}>
                  {items.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        {
                          backgroundColor: i === currentIndex ? derivedColors.primary : colors.textSecondary + "40",
                          width: i === currentIndex ? 8 : 6,
                          height: i === currentIndex ? 8 : 6,
                          borderRadius: i === currentIndex ? 4 : 3,
                        },
                      ]}
                    />
                  ))}
                </View>
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
    maxWidth: 420,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 0,
  },
  emptyWrap: { paddingVertical: 40, alignItems: "center" },
  emptyText: { fontFamily: "JetBrainsMono", fontSize: 14 },
  page: { alignItems: "center", paddingHorizontal: 24, paddingVertical: 8 },
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
  earnedDate: {
    fontFamily: "JetBrainsMono",
    fontSize: 12,
    marginTop: 18,
    textAlign: "center",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 16,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    borderRadius: 3,
  },
});
