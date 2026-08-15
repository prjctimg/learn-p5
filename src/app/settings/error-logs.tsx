import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Header from "../../components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeContext } from "../../components/ThemeProvider";
import { Colors } from "../../constants/Colors";

interface ErrorLogEntry {
  timestamp: string;
  route: string;
  error: string;
  stack?: string;
}

export default function ErrorLogs() {
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const [logs, setLogs] = useState<ErrorLogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<ErrorLogEntry | null>(null);
  const [showStack, setShowStack] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("error_log").then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val);
          setLogs(parsed.reverse());
        } catch {}
      }
    });
  }, []);

  const handleClearLogs = async () => {
    await AsyncStorage.removeItem("error_log");
    setLogs([]);
  };

  const handleCopyStack = async () => {
    if (selectedLog?.stack) {
      await AsyncStorage.setItem("clipboard", selectedLog.stack);
    }
  };

  if (selectedLog) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Header title="Error Details" />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.card, { backgroundColor: colors.surfaceDim }]}>
            <Text style={[styles.logTitle, { color: colors.error }]}>
              {selectedLog.error}
            </Text>
            <Text style={[styles.logMeta, { color: colors.textSecondary, marginTop: 8 }]}>
              {selectedLog.route} · {new Date(selectedLog.timestamp).toLocaleString()}
            </Text>
            {selectedLog.stack && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.onSurface, marginTop: 16 }]}>
                  Stack Trace
                </Text>
                <Pressable
                  onPress={() => setShowStack(!showStack)}
                  style={[styles.stackToggle, { backgroundColor: derivedColors.primary + "1A" }]}
                >
                  <Text style={[styles.stackToggleText, { color: derivedColors.primary }]}>
                    {showStack ? "Hide" : "Show"} Stack
                  </Text>
                </Pressable>
                {showStack && selectedLog.stack && (
                  <View style={[styles.stackContainer, { backgroundColor: colors.surfaceContainerHighest }]}>
                    <Text style={[styles.stackText, { color: colors.onSurface }]}>
                      {selectedLog.stack}
                    </Text>
                    <Pressable
                      onPress={handleCopyStack}
                      style={[styles.copyButton, { backgroundColor: derivedColors.primary }]}
                    >
                      <Text style={styles.copyButtonText}>Copy Stack Trace</Text>
                    </Pressable>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Header title="Error Logs" />
      <FlatList
        style={styles.list}
        data={logs}
        keyExtractor={(item, index) => `${item.timestamp}-${index}`}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedLog(item)}
            style={({ pressed }) => [
              styles.logItem,
              pressed && { backgroundColor: colors.surfaceContainerHigh },
            ]}
          >
            <View style={styles.logHeader}>
              <Text style={[styles.logTitle, { color: colors.error }]}>
                {item.error}
              </Text>
              <Text style={[styles.logTime, { color: colors.textSecondary }]}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>
            <Text style={[styles.logRoute, { color: derivedColors.primary }]}>
              {item.route}
            </Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: colors.outlineVariant + "30" }} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="check-circle-outline" size={48} color={derivedColors.primary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: 16 }]}>
              No errors logged
            </Text>
          </View>
        }
        ListFooterComponent={
          logs.length > 0 ? (
            <Pressable
              onPress={handleClearLogs}
              style={({ pressed }) => [
                styles.clearButton,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.clearButtonText}>Clear All Logs</Text>
            </Pressable>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
  },
  logItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#1E1F23",
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  logTitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  logTime: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
    fontWeight: "400",
  },
  logRoute: {
    fontFamily: "JetBrainsMono",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  logMeta: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
    fontWeight: "400",
  },
  sectionTitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  stackToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  stackToggleText: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stackContainer: {
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  stackText: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
    lineHeight: 18,
  },
  copyButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  copyButtonText: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#FFFFFF",
  },
  clearButton: {
    alignSelf: "center",
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#FF6B6B",
  },
  clearButtonText: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#FFFFFF",
  },
});