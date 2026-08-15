import { useRef, useMemo, useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, TextInput, Modal, Keyboard } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";
import { P5_SYMBOLS } from "../data/reference";
import Fuse from "fuse.js";

interface SearchOverlayProps {
  visible: boolean;
  onClose: () => void;
  onSelectSymbol: (name: string) => void;
}

export default function SearchOverlay({ visible, onClose, onSelectSymbol }: SearchOverlayProps) {
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const [query, setQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  const fuse = useMemo(
    () =>
      new Fuse(P5_SYMBOLS, {
        keys: [
          { name: "name", weight: 2 },
          { name: "description", weight: 1 },
          { name: "module", weight: 1 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    []
  );

  const results = useMemo(() => {
    if (!query.trim()) return P5_SYMBOLS.slice(0, 20);
    return fuse.search(query.trim()).map((r) => r.item);
  }, [query, fuse]);

  const handleClose = useCallback(() => {
    setQuery("");
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={[styles.card, { backgroundColor: colors.surfaceContainerHigh }]} onPress={() => {}}>
          <View style={styles.header}>
            <View style={[styles.searchBar, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}>
              <MaterialCommunityIcons name="magnify" size={18} color={colors.onSurfaceVariant} />
              <TextInput
                ref={inputRef}
                value={query}
                onChangeText={setQuery}
                placeholder="Search symbols..."
                placeholderTextColor={colors.onSurfaceVariant}
                style={[styles.searchInput, { color: colors.onSurface }]}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery("")} accessibilityRole="button" accessibilityLabel="Clear search">
                  <MaterialCommunityIcons name="close-circle" size={18} color={colors.onSurfaceVariant} />
                </Pressable>
              )}
            </View>
            <Pressable onPress={handleClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close search">
              <MaterialCommunityIcons name="close" size={22} color={colors.onSurfaceVariant} />
            </Pressable>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />
          <FlatList
            data={results}
            keyExtractor={(item) => item.name}
            style={styles.resultsList}
            contentContainerStyle={{ paddingBottom: 8 }}
            renderItem={({ item: sym }) => (
              <Pressable
                onPress={() => { handleClose(); onSelectSymbol(sym.name); }}
                style={({ pressed }) => [
                  styles.resultRow,
                  pressed && { backgroundColor: colors.surfaceContainer },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`View reference for ${sym.name}`}
              >
                <View style={styles.flex1}>
                  <Text style={[styles.resultName, { color: derivedColors.primary }]}>
                    {sym.name}()
                  </Text>
                  <Text style={[styles.resultModule, { color: colors.textSecondary }]}>
                    {sym.module}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "70%",
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: 44,
    padding: 0,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 12,
    marginBottom: 4,
  },
  resultsList: {
    marginTop: 4,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  resultName: {
    fontFamily: "JetBrainsMono",
    fontSize: 15,
    fontWeight: "700",
  },
  resultModule: {
    fontFamily: "JetBrainsMono",
    fontSize: 12,
    marginTop: 2,
  },
  flex1: { flex: 1 },
});
