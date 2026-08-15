import { useRef, useCallback, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 5;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

interface TimePickerProps {
  hour: number;
  minute: number;
  onTimeChange: (hour: number, minute: number) => void;
}

function SnapList({
  data,
  selectedValue,
  onSelect,
  formatValue,
}: {
  data: number[];
  selectedValue: number;
  onSelect: (value: number) => void;
  formatValue: (v: number) => string;
}) {
  const listRef = useRef<FlatList>(null);
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const selectedIndex = data.indexOf(selectedValue);

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      listRef.current.scrollToIndex({
        index: selectedIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [selectedIndex]);

  const handleMomentumEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      const offsetY = e.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
      onSelect(data[clampedIndex]);
    },
    [data, onSelect]
  );

  const getItemLayout = (_: unknown, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  const topPadding = (VISIBLE_ITEMS - 1) * ITEM_HEIGHT / 2;

  return (
    <View style={pickerStyles.column}>
      <View style={[pickerStyles.highlightBar, { backgroundColor: colors.primary + "20", borderColor: colors.primary }]} pointerEvents="none" />
      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => item.toString()}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: topPadding, paddingBottom: topPadding }}
        getItemLayout={getItemLayout}
        onMomentumScrollEnd={handleMomentumEnd}
        initialScrollIndex={Math.max(0, selectedIndex)}
        renderItem={({ item }) => {
          const isSelected = item === selectedValue;
          return (
            <View style={pickerStyles.item}>
              <Text
                style={[
                  pickerStyles.itemText,
                  {
                    color: isSelected ? colors.onSurface : colors.textSecondary,
                    fontFamily: "JetBrainsMono",
                    fontWeight: isSelected ? "700" : "400",
                    fontSize: isSelected ? 20 : 16,
                  },
                ]}
              >
                {formatValue(item)}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  column: {
    flex: 1,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: "relative",
  },
  highlightBar: {
    position: "absolute",
    top: (VISIBLE_ITEMS - 1) * ITEM_HEIGHT / 2,
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    fontFamily: "JetBrainsMono",
  },
});

export default function TimePicker({ hour, minute, onTimeChange }: TimePickerProps) {
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <View style={[styles.container, { borderTopColor: colors.outlineVariant + "40", borderTopWidth: 1 }]}>
      <View style={styles.pickerRow}>
        <View style={styles.snapContainer}>
          <SnapList
            data={HOURS}
            selectedValue={hour}
            onSelect={(h) => onTimeChange(h, minute)}
            formatValue={(v) => v.toString().padStart(2, "0")}
          />
        </View>
        <Text style={[styles.separator, { color: colors.onSurface }]}>:</Text>
        <View style={styles.snapContainer}>
          <SnapList
            data={MINUTES}
            selectedValue={minute}
            onSelect={(m) => onTimeChange(hour, m)}
            formatValue={(v) => v.toString().padStart(2, "0")}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  snapContainer: {
    flex: 1,
    maxWidth: 100,
    alignItems: "center",
  },
  separator: {
    fontFamily: "JetBrainsMono",
    fontSize: 24,
    fontWeight: "700",
    marginHorizontal: 8,
    marginTop: -ITEM_HEIGHT / 2,
  },
});
