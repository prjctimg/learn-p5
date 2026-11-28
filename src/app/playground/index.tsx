import { useCallback, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, Alert, TextInput } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Header from "../../components/Header";
import { useThemeContext } from "../../components/ThemeProvider";
import { Colors } from "../../constants/Colors";
import type { Sketch } from "../../types";
import { loadSketchspaceIndex, createSketch, deleteSketch, renameSketch } from "../../utils/playground/sketchspace";

export default function PlaygroundIndex() {
  const router = useRouter();
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme];
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [loading, setLoading] = useState(true);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const index = await loadSketchspaceIndex();
      setSketches(index.sketches);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const handleCreate = async () => {
    const sketch = await createSketch();
    await refresh();
    router.push(`/playground/${sketch.id}`);
  };

  const handleDelete = (sketch: Sketch) => {
    Alert.alert("Delete sketch", `Delete "${sketch.name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteSketch(sketch.id);
          await refresh();
        },
      },
    ]);
  };

  const handleRename = async (sketch: Sketch) => {
    if (renamingId === sketch.id) {
      await renameSketch(sketch.id, renameValue);
      setRenamingId(null);
      setRenameValue("");
      await refresh();
    } else {
      setRenamingId(sketch.id);
      setRenameValue(sketch.name);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Header title="Playground" showBack={false} />
      <View style={styles.toolbar}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Sketchspace - your local p5.js sketches
        </Text>
        <Pressable
          onPress={handleCreate}
          style={({ pressed }) => [styles.createBtn, { backgroundColor: derivedColors.primary }, pressed && { opacity: 0.8 }]}
          accessibilityRole="button"
          accessibilityLabel="Create new sketch"
        >
          <MaterialCommunityIcons name="plus" size={18} color={colors.onPrimary} />
          <Text style={[styles.createBtnText, { color: colors.onPrimary }]}>New Sketch</Text>
        </Pressable>
      </View>
      <FlatList
        data={sketches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="code-braces-box" size={48} color={derivedColors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No sketches yet</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Create a sketch to start coding with p5.js, import assets, add addons, and sync to GitHub.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/playground/${item.id}`)}
            style={({ pressed }) => [styles.card, { backgroundColor: colors.surfaceDim }, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel={`Open sketch ${item.name}`}
          >
            <View style={{ flex: 1 }}>
              {renamingId === item.id ? (
                <TextInput
                  value={renameValue}
                  onChangeText={setRenameValue}
                  style={[styles.renameInput, { color: colors.onSurface, borderColor: colors.outlineVariant }]}
                  autoFocus
                  onSubmitEditing={() => handleRename(item)}
                />
              ) : (
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{item.name}</Text>
              )}
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
                {item.files.length} file{item.files.length === 1 ? "" : "s"} · Updated {new Date(item.updatedAt).toLocaleDateString()}
              </Text>
              {item.gistId ? (
                <Text style={[styles.cardMeta, { color: derivedColors.primary }]}>Synced to GitHub Gist</Text>
              ) : null}
            </View>
            <View style={styles.actions}>
              <Pressable onPress={() => handleRename(item)} accessibilityRole="button" accessibilityLabel="Rename sketch" style={styles.iconBtn}>
                <MaterialCommunityIcons name={renamingId === item.id ? "check" : "pencil-outline"} size={20} color={colors.textSecondary} />
              </Pressable>
              <Pressable onPress={() => handleDelete(item)} accessibilityRole="button" accessibilityLabel="Delete sketch" style={styles.iconBtn}>
                <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 12 },
  subtitle: { fontFamily: "JetBrainsMono", fontSize: 13 },
  createBtn: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  createBtnText: { fontFamily: "JetBrainsMono", fontSize: 13, fontWeight: "700" },
  card: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, marginBottom: 12 },
  cardTitle: { fontFamily: "JetBrainsMono", fontSize: 16, fontWeight: "700" },
  cardMeta: { fontFamily: "JetBrainsMono", fontSize: 12, marginTop: 4 },
  actions: { flexDirection: "row", gap: 4 },
  iconBtn: { padding: 8 },
  empty: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 },
  emptyTitle: { fontFamily: "JetBrainsMono", fontSize: 18, fontWeight: "700", marginTop: 12 },
  emptyText: { fontFamily: "JetBrainsMono", fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 22 },
  renameInput: { fontFamily: "JetBrainsMono", fontSize: 16, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
});
