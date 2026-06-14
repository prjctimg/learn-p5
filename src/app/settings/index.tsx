import { useState, useEffect, useCallback } from "react";
import { View, Text, Switch, Pressable, ScrollView, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import Header from "../../components/Header";
import { useThemeContext } from "../../components/ThemeProvider";
import { Colors } from "../../constants/Colors";

const SETTINGS_KEYS = {
  dailyReminder: "setting_dailyReminder",
  snippetAlternatives: "setting_snippetAlternatives",
  notificationHour: "setting_notificationHour",
  notificationMinute: "setting_notificationMinute",
  showDrawerFab: "setting_showDrawerFab",
  codeFontSize: "setting_codeFontSize",
};

const TIME_PRESETS = [
  { label: "Morning", hour: 8, minute: 0 },
  { label: "Afternoon", hour: 12, minute: 0 },
  { label: "Evening", hour: 18, minute: 0 },
  { label: "Night", hour: 21, minute: 0 },
];

function formatTime(hour: number, minute: number): string {
  const h = hour % 12 || 12;
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

const createStyles = (colors: Record<string, string>) =>
  StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
    sectionTitle: {
      fontFamily: "JetBrainsMono",
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 12,
      color: colors.textSecondary,
    },
    card: { borderRadius: 12, overflow: "hidden", backgroundColor: colors.surfaceDim },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    flexChild: { flex: 1 },
    settingTitle: { fontFamily: "JetBrainsMono", fontSize: 16, fontWeight: "700", color: colors.onSurface },
    settingDescription: { fontFamily: "JetBrainsMono", fontSize: 11, marginTop: 2, color: colors.textSecondary },
    timeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant + "40",
    },
    timeText: { fontFamily: "JetBrainsMono", fontSize: 16, fontWeight: "700", color: colors.onSurface },
    presetsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant + "40",
    },
    presetChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    presetChipActive: { backgroundColor: colors.primary },
    presetChipInactive: { backgroundColor: colors.surfaceContainerHigh },
    presetChipText: { fontFamily: "JetBrainsMono", fontSize: 13, fontWeight: "700" },
    presetChipTextActive: { color: colors.onPrimary },
    presetChipTextInactive: { color: colors.onSurfaceVariant },
    sectionMargin: { marginTop: 32 },
  });

export default function Settings() {
  const { colorScheme, toggleTheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const styles = createStyles(colors);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [snippetAlternatives, setSnippetAlternatives] = useState(false);
  const [notificationHour, setNotificationHour] = useState(18);
  const [notificationMinute, setNotificationMinute] = useState(0);
  const [showDrawerFab, setShowDrawerFab] = useState(false);
  const [codeFontSize, setCodeFontSize] = useState(22);

  useEffect(() => {
    AsyncStorage.multiGet([
      SETTINGS_KEYS.dailyReminder,
      SETTINGS_KEYS.snippetAlternatives,
      SETTINGS_KEYS.notificationHour,
      SETTINGS_KEYS.notificationMinute,
      SETTINGS_KEYS.showDrawerFab,
      SETTINGS_KEYS.codeFontSize,
    ]).then(([reminder, snippet, hour, minute, fab, fontSize]) => {
      setDailyReminder(reminder[1] === "true");
      setSnippetAlternatives(snippet[1] === "true");
      if (hour[1]) setNotificationHour(parseInt(hour[1], 10));
      if (minute[1]) setNotificationMinute(parseInt(minute[1], 10));
      setShowDrawerFab(fab[1] === "true");
      if (fontSize[1]) setCodeFontSize(parseInt(fontSize[1], 10));
    });
  }, []);

  const scheduleNotification = useCallback(async (hour: number, minute: number) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.requestPermissionsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to code!",
        body: "Keep your streak alive — practice your p5.js skills today.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }, []);

  const toggleDailyReminder = async (value: boolean) => {
    setDailyReminder(value);
    await AsyncStorage.setItem(SETTINGS_KEYS.dailyReminder, value.toString());
    if (value) {
      await scheduleNotification(notificationHour, notificationMinute);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const setPresetTime = async (hour: number, minute: number) => {
    setNotificationHour(hour);
    setNotificationMinute(minute);
    await AsyncStorage.multiSet([
      [SETTINGS_KEYS.notificationHour, hour.toString()],
      [SETTINGS_KEYS.notificationMinute, minute.toString()],
    ]);
    if (dailyReminder) {
      await scheduleNotification(hour, minute);
    }
  };

  const toggleSnippetAlternatives = async (value: boolean) => {
    setSnippetAlternatives(value);
    await AsyncStorage.setItem(SETTINGS_KEYS.snippetAlternatives, value.toString());
  };

  const toggleShowDrawerFab = async (value: boolean) => {
    setShowDrawerFab(value);
    await AsyncStorage.setItem(SETTINGS_KEYS.showDrawerFab, value.toString());
  };

  const changeCodeFontSize = async (delta: number) => {
    const newSize = Math.min(32, Math.max(14, codeFontSize + delta));
    setCodeFontSize(newSize);
    await AsyncStorage.setItem(SETTINGS_KEYS.codeFontSize, newSize.toString());
  };

  const isCurrentPreset = (h: number, m: number) => notificationHour === h && notificationMinute === m;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Header title="Settings" />
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Appearance */}
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.flexChild}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Switch between light and dark themes
              </Text>
            </View>
            <Switch
              value={colorScheme === "dark"}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: "#ED225D" }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Learning */}
        <Text style={[styles.sectionTitle, styles.sectionMargin]}>Learning</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.flexChild}>
              <Text style={styles.settingTitle}>Daily Reminder</Text>
              <Text style={styles.settingDescription}>
                Get reminded to practice daily
              </Text>
            </View>
            <Switch
              value={dailyReminder}
              onValueChange={toggleDailyReminder}
              trackColor={{ false: "#767577", true: "#ED225D" }}
              thumbColor="#ffffff"
            />
          </View>

          {dailyReminder && (
            <>
              <View style={styles.timeRow}>
                <Text style={styles.settingDescription}>Notification time</Text>
                <Text style={styles.timeText}>
                  {formatTime(notificationHour, notificationMinute)}
                </Text>
              </View>
              <View style={styles.presetsRow}>
                {TIME_PRESETS.map((preset) => {
                  const active = isCurrentPreset(preset.hour, preset.minute);
                  return (
                    <Pressable
                      key={preset.label}
                      onPress={() => setPresetTime(preset.hour, preset.minute)}
                      style={[
                        styles.presetChip,
                        active ? styles.presetChipActive : styles.presetChipInactive,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Set time to ${preset.label}`}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          active ? styles.presetChipTextActive : styles.presetChipTextInactive,
                        ]}
                      >
                        {preset.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          <View style={styles.cardRow}>
            <View style={styles.flexChild}>
              <Text style={styles.settingTitle}>Snippet Alternatives</Text>
              <Text style={styles.settingDescription}>
                Show p5.js variants in other languages
              </Text>
            </View>
            <Switch
              value={snippetAlternatives}
              onValueChange={toggleSnippetAlternatives}
              trackColor={{ false: "#767577", true: "#ED225D" }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Code Editor */}
        <Text style={[styles.sectionTitle, styles.sectionMargin]}>Code Editor</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.flexChild}>
              <Text style={styles.settingTitle}>Font Size</Text>
              <Text style={styles.settingDescription}>
                {codeFontSize}px — adjust code editor text size
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Pressable
                onPress={() => changeCodeFontSize(-2)}
                style={({ pressed }) => ({
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: pressed ? colors.primaryContainer : colors.surfaceContainerHigh,
                  alignItems: "center",
                  justifyContent: "center",
                })}
                accessibilityRole="button"
                accessibilityLabel="Decrease font size"
              >
                <Text style={{ fontSize: 18, fontWeight: "700", color: colors.onSurface }}>−</Text>
              </Pressable>
              <Text style={[styles.timeText, { minWidth: 32, textAlign: "center" }]}>
                {codeFontSize}
              </Text>
              <Pressable
                onPress={() => changeCodeFontSize(2)}
                style={({ pressed }) => ({
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: pressed ? colors.primaryContainer : colors.surfaceContainerHigh,
                  alignItems: "center",
                  justifyContent: "center",
                })}
                accessibilityRole="button"
                accessibilityLabel="Increase font size"
              >
                <Text style={{ fontSize: 18, fontWeight: "700", color: colors.onSurface }}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Accessibility */}
        <Text style={[styles.sectionTitle, styles.sectionMargin]}>Accessibility</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.flexChild}>
              <Text style={styles.settingTitle}>Drawer FAB</Text>
              <Text style={styles.settingDescription}>
                Show a floating button to open the navigation drawer
              </Text>
            </View>
            <Switch
              value={showDrawerFab}
              onValueChange={toggleShowDrawerFab}
              trackColor={{ false: "#767577", true: "#ED225D" }}
              thumbColor="#ffffff"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}