import { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, Switch, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter, useIsFocused } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import Header from "../../components/Header";
import TimePicker from "../../components/TimePicker";
import { useThemeContext } from "../../components/ThemeProvider";
import { Colors } from "../../constants/Colors";
import { DEFAULTS } from "../../constants/Defaults";
import { STORAGE_KEYS } from "../../constants/StorageKeys";
import { useShakeDetection } from "../../hooks/useShakeDetection";
import ReportErrorModal from "../../components/ReportErrorModal";

import { EDITOR_THEMES, getThemeSwatches } from "../../utils/editor/themes";
import { PROCESSING_COLOR_HEX } from "../../constants/ProcessingColors";

const SETTINGS_KEYS = {
  dailyReminder: STORAGE_KEYS.settingDailyReminder,
  notificationHour: STORAGE_KEYS.settingNotificationHour,
  notificationMinute: STORAGE_KEYS.settingNotificationMinute,
  codeFontSize: STORAGE_KEYS.settingCodeFontSize,
  codeBackground: STORAGE_KEYS.settingCodeBackground,
  keyboardHeight: STORAGE_KEYS.settingKeyboardHeight,
  editorTheme: STORAGE_KEYS.settingEditorTheme,
  wordWrap: STORAGE_KEYS.settingWordWrap,
  showDrawerFab: STORAGE_KEYS.settingShowDrawerFab,
  showStatusBar: STORAGE_KEYS.settingShowStatusBar,
  disableSystemKeyboard: STORAGE_KEYS.settingDisableSystemKeyboard,
};

const createStyles = (colors: Record<string, string>) =>
  StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 28,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    sectionIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionTitle: {
      fontFamily: "JetBrainsMono",
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 1,
      color: colors.textSecondary,
    },
    card: { borderRadius: 12, overflow: "hidden", backgroundColor: colors.surfaceDim },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    cardDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.surfaceContainerHighest },
    flexChild: { flex: 1 },
    settingTitle: { fontFamily: "JetBrainsMono", fontSize: 14, fontWeight: "700", color: colors.onSurface },
    settingDescription: { fontFamily: "JetBrainsMono", fontSize: 11, marginTop: 2, color: colors.textSecondary },
    nameInput: {
      fontFamily: "JetBrainsMono",
      fontSize: 14,
      borderBottomWidth: 1,
      paddingVertical: 6,
      minWidth: 140,
      marginLeft: 12,
      textAlign: "right",
    },
  });

export default function Settings() {
  const { colorScheme, toggleTheme, ctaColor, setCtaColor, derivedColors } = useThemeContext();
  const router = useRouter();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const styles = createStyles(colors);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [notificationHour, setNotificationHour] = useState(18);
  const [notificationMinute, setNotificationMinute] = useState(0);
  const [codeFontSize, setCodeFontSize] = useState(DEFAULTS.codeFontSize);
  const [codeBackground, setCodeBackground] = useState<string>(DEFAULTS.codeBackground);
  const [keyboardHeight, setKeyboardHeight] = useState<string>(DEFAULTS.keyboardHeight);
  const [editorTheme, setEditorTheme] = useState<string>("p5-learn");
  const [wordWrap, setWordWrap] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [showDrawerFab, setShowDrawerFab] = useState(true);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [disableSystemKeyboard, setDisableSystemKeyboard] = useState(false);
  const [shakeModalVisible, setShakeModalVisible] = useState(false);
  const isFocused = useIsFocused();

  useShakeDetection(
    useCallback(() => setShakeModalVisible(true), []),
    { enabled: isFocused }
  );

  useEffect(() => {
    AsyncStorage.multiGet([
      SETTINGS_KEYS.dailyReminder,
      SETTINGS_KEYS.notificationHour,
      SETTINGS_KEYS.notificationMinute,
      SETTINGS_KEYS.codeFontSize,
      SETTINGS_KEYS.codeBackground,
      SETTINGS_KEYS.keyboardHeight,
      SETTINGS_KEYS.editorTheme,
      SETTINGS_KEYS.wordWrap,
      SETTINGS_KEYS.showDrawerFab,
      SETTINGS_KEYS.showStatusBar,
      SETTINGS_KEYS.disableSystemKeyboard,
    ]).then(([reminder, hour, minute, fontSize, bg, kb, theme, wrap, drawerFab, statusBar, disableSysKb]) => {
      setDailyReminder(reminder[1] === "true");
      if (hour[1]) setNotificationHour(parseInt(hour[1], 10));
      if (minute[1]) setNotificationMinute(parseInt(minute[1], 10));
      if (fontSize[1]) setCodeFontSize(parseInt(fontSize[1], 10));
      if (bg[1]) setCodeBackground(bg[1]);
      if (kb[1]) setKeyboardHeight(kb[1]);
      if (theme[1]) setEditorTheme(theme[1]);
      setWordWrap(wrap[1] === "true");
      if (drawerFab[1] !== null) setShowDrawerFab(drawerFab[1] !== "false");
      if (statusBar[1] !== null) setShowStatusBar(statusBar[1] !== "false");
      setDisableSystemKeyboard(disableSysKb[1] === "true");
    });
    AsyncStorage.getItem(STORAGE_KEYS.onboardingData).then((val) => {
      if (val) {
        try {
          const data = JSON.parse(val);
          setDisplayName(data.displayName || "");
        } catch {}
      }
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

  const handleTimeChange = async (hour: number, minute: number) => {
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

  const changeCodeFontSize = async (delta: number) => {
    const newSize = Math.min(DEFAULTS.codeFontSizeMax, Math.max(DEFAULTS.codeFontSizeMin, codeFontSize + delta));
    setCodeFontSize(newSize);
    await AsyncStorage.setItem(SETTINGS_KEYS.codeFontSize, newSize.toString());
  };

  const changeCodeBackground = async (value: string) => {
    setCodeBackground(value);
    await AsyncStorage.setItem(SETTINGS_KEYS.codeBackground, value);
  };

  const changeKeyboardHeight = async (value: string) => {
    setKeyboardHeight(value);
    await AsyncStorage.setItem(SETTINGS_KEYS.keyboardHeight, value);
  };

  const changeEditorTheme = async (value: string) => {
    setEditorTheme(value);
    await AsyncStorage.setItem(SETTINGS_KEYS.editorTheme, value);
  };

  const changeWordWrap = async (value: boolean) => {
    setWordWrap(value);
    await AsyncStorage.setItem(SETTINGS_KEYS.wordWrap, value.toString());
  };

  const handleDisplayNameChange = useCallback(async (text: string) => {
    setDisplayName(text);
    AsyncStorage.getItem(STORAGE_KEYS.onboardingData).then((val) => {
      const data = val ? JSON.parse(val) : {};
      data.displayName = text;
      AsyncStorage.setItem(STORAGE_KEYS.onboardingData, JSON.stringify(data));
    });
  }, []);

  const toggleShowDrawerFab = async (value: boolean) => {
    setShowDrawerFab(value);
    await AsyncStorage.setItem(SETTINGS_KEYS.showDrawerFab, value.toString());
  };

  const toggleShowStatusBar = async (value: boolean) => {
    setShowStatusBar(value);
    await AsyncStorage.setItem(SETTINGS_KEYS.showStatusBar, value.toString());
  };

  const toggleDisableSystemKeyboard = async (value: boolean) => {
    setDisableSystemKeyboard(value);
    await AsyncStorage.setItem(SETTINGS_KEYS.disableSystemKeyboard, value.toString());
  };

  function SectionHeader({ icon, label, color }: { icon: string; label: string; color: string }) {
    return (
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: color + "20" }]}>
          <MaterialCommunityIcons name={icon as any} size={16} color={color} />
        </View>
        <Text style={styles.sectionTitle}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Header title="Settings" showBack={false} />
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Profile */}
        <SectionHeader icon="account-outline" label="Profile" color={derivedColors.primary} />
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.flexChild}>
              <Text style={styles.settingTitle}>Display Name</Text>
              <Text style={styles.settingDescription}>Used in greetings and notifications</Text>
            </View>
            <TextInput
              style={[styles.nameInput, { color: derivedColors.primary, borderColor: colors.outlineVariant }]}
              placeholder="Enter your name"
              placeholderTextColor={colors.textSecondary}
              value={displayName}
              onChangeText={handleDisplayNameChange}
              maxLength={30}
            />
          </View>
        </View>

        {/* Appearance */}
        <SectionHeader icon="palette-outline" label="Appearance" color={derivedColors.primary} />
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.flexChild}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Switch between light and dark themes</Text>
            </View>
            <Switch
              value={colorScheme === "dark"}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: ctaColor }}
              thumbColor="#ffffff"
            />
          </View>
          <View style={styles.cardDivider} />
          <View style={[styles.cardRow, { flexWrap: "wrap", gap: 8 }]}>
            <View style={{ width: "100%", marginBottom: 4 }}>
              <Text style={styles.settingTitle}>Accent Color</Text>
              <Text style={styles.settingDescription}>Choose a CTA color for buttons and highlights</Text>
            </View>
            {PROCESSING_COLOR_HEX.map((hex) => (
              <Pressable
                key={hex}
                onPress={() => setCtaColor(hex)}
                style={({ pressed }) => ({
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: hex,
                  borderWidth: ctaColor === hex ? 3 : 0,
                  borderColor: ctaColor === hex ? colors.onSurface : "transparent",
                  opacity: pressed ? 0.8 : 1,
                })}
                accessibilityRole="button"
                accessibilityLabel={`Set accent color to ${hex}`}
              />
            ))}
          </View>
        </View>
        <View style={[styles.card, { marginTop: 8 }]}>
          <View style={styles.cardRow}>
            <View style={styles.flexChild}>
              <Text style={styles.settingTitle}>Drawer FAB</Text>
              <Text style={styles.settingDescription}>Show the drawer shortcut on the left edge</Text>
            </View>
            <Switch
              value={showDrawerFab}
              onValueChange={toggleShowDrawerFab}
              trackColor={{ false: "#767577", true: ctaColor }}
              thumbColor="#ffffff"
            />
          </View>
        </View>
        <View style={[styles.card, { marginTop: 8 }]}>
          <View style={styles.cardRow}>
            <View style={styles.flexChild}>
              <Text style={styles.settingTitle}>Status Bar</Text>
              <Text style={styles.settingDescription}>Show the status bar at the top of the screen</Text>
            </View>
            <Switch
              value={showStatusBar}
              onValueChange={toggleShowStatusBar}
              trackColor={{ false: "#767577", true: ctaColor }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Learning */}
        <SectionHeader icon="school-outline" label="Learning" color={derivedColors.primary} />
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.flexChild}>
              <Text style={styles.settingTitle}>Daily Reminder</Text>
              <Text style={styles.settingDescription}>Get reminded to practice daily</Text>
            </View>
            <Switch
              value={dailyReminder}
              onValueChange={toggleDailyReminder}
              trackColor={{ false: "#767577", true: ctaColor }}
              thumbColor="#ffffff"
            />
          </View>

          {dailyReminder && (
            <TimePicker
              hour={notificationHour}
              minute={notificationMinute}
              onTimeChange={handleTimeChange}
            />
          )}

          <View style={styles.cardDivider} />
        </View>

        {/* Code Editor */}
        <SectionHeader icon="code-tags" label="Code Editor" color={derivedColors.primary} />
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.flexChild}>
              <Text style={styles.settingTitle}>Font Size</Text>
              <Text style={styles.settingDescription}>{codeFontSize}px — adjust code editor text size</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Pressable
                onPress={() => changeCodeFontSize(-2)}
                style={({ pressed }) => ({
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: pressed ? derivedColors.primaryContainer : colors.surfaceContainerHigh,
                  alignItems: "center",
                  justifyContent: "center",
                })}
                accessibilityRole="button"
                accessibilityLabel="Decrease font size"
              >
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.onSurface }}>−</Text>
              </Pressable>
              <Text style={{ fontFamily: "JetBrainsMono", fontSize: 14, fontWeight: "700", color: colors.onSurface, minWidth: 28, textAlign: "center" }}>
                {codeFontSize}
              </Text>
              <Pressable
                onPress={() => changeCodeFontSize(2)}
                style={({ pressed }) => ({
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: pressed ? derivedColors.primaryContainer : colors.surfaceContainerHigh,
                  alignItems: "center",
                  justifyContent: "center",
                })}
                accessibilityRole="button"
                accessibilityLabel="Increase font size"
              >
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.onSurface }}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.cardDivider} />
          <View style={styles.cardRow}>
            <View style={styles.flexChild}>
              <Text style={styles.settingTitle}>Code Background</Text>
              <Text style={styles.settingDescription}>
                {codeBackground === "auto" ? "Follow system theme" : codeBackground === "#FFFFFF" ? "Light background" : "Dark background"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {["auto", "#FFFFFF", "#0D0E12"].map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => changeCodeBackground(opt)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 6,
                    borderBottomWidth: codeBackground === opt ? 2 : 0,
                    borderBottomColor: codeBackground === opt ? derivedColors.primary : "transparent",
                    backgroundColor: pressed ? derivedColors.primaryContainer + "33" : colors.surfaceContainerHigh,
                  })}
                  accessibilityRole="button"
                  accessibilityLabel={opt === "auto" ? "Auto" : opt === "#FFFFFF" ? "Light" : "Dark"}
                >
                  <Text style={{ fontFamily: "JetBrainsMono", fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, color: colors.onSurfaceVariant }}>
                    {opt === "auto" ? "Auto" : opt === "#FFFFFF" ? "Light" : "Dark"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.cardDivider} />
          <View style={[styles.cardRow, { flexWrap: "wrap", gap: 6 }]}>
            <View style={{ width: "100%", marginBottom: 6 }}>
              <Text style={styles.settingTitle}>Editor Theme</Text>
              <Text style={styles.settingDescription}>Choose a color theme for the code editor</Text>
            </View>
            {Object.entries(EDITOR_THEMES).map(([key, theme]) => {
              const swatches = getThemeSwatches(key, colorScheme === "dark" ? "dark" : "light");
              return (
                <Pressable
                  key={key}
                  onPress={() => changeEditorTheme(key)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 6,
                    borderBottomWidth: editorTheme === key ? 2 : 0,
                    borderBottomColor: editorTheme === key ? derivedColors.primary : "transparent",
                    backgroundColor: pressed ? derivedColors.primaryContainer + "33" : colors.surfaceContainerHigh,
                  })}
                >
                  <View style={{ flexDirection: "row", gap: 2 }}>
                    {swatches.map((s, i) => (
                      <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s }} />
                    ))}
                  </View>
                  <Text style={{ fontFamily: "JetBrainsMono", fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, color: colors.onSurfaceVariant }}>
                    {theme.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.cardDivider} />
          <View style={styles.cardRow}>
            <View style={styles.flexChild}>
              <Text style={styles.settingTitle}>Word Wrap</Text>
              <Text style={styles.settingDescription}>Wrap long lines in the editor</Text>
            </View>
            <Switch
              value={wordWrap}
              onValueChange={changeWordWrap}
              trackColor={{ false: "#767577", true: ctaColor }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Keyboard */}
        <SectionHeader icon="keyboard" label="Keyboard" color={derivedColors.primary} />
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.flexChild}>
              <Text style={styles.settingTitle}>Keyboard Height</Text>
              <Text style={styles.settingDescription}>
                {keyboardHeight === "small" ? "230px — compact" : "280px — default"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {["small", "medium"].map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => changeKeyboardHeight(opt)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 6,
                    minWidth: 36,
                    alignItems: "center",
                    borderBottomWidth: keyboardHeight === opt ? 2 : 0,
                    borderBottomColor: keyboardHeight === opt ? derivedColors.primary : "transparent",
                    backgroundColor: pressed ? derivedColors.primaryContainer + "33" : colors.surfaceContainerHigh,
                  })}
                  accessibilityRole="button"
                  accessibilityLabel={`${opt} keyboard`}
                >
                  <Text style={{ fontFamily: "JetBrainsMono", fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, color: colors.onSurfaceVariant }}>
                    {opt === "small" ? "S" : "M"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={[styles.cardRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.outlineVariant }]}>
            <View style={styles.flexChild}>
              <Text style={styles.settingTitle}>Disable System Keyboard</Text>
              <Text style={styles.settingDescription}>Prevent the OS keyboard from appearing in the exercise editor</Text>
            </View>
            <Switch
              value={disableSystemKeyboard}
              onValueChange={toggleDisableSystemKeyboard}
              trackColor={{ false: "#767577", true: ctaColor }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* About */}
        <SectionHeader icon="information-outline" label="About" color={derivedColors.primary} />
        <View style={styles.card}>
          <Pressable
            onPress={() => router.push("/settings/about")}
            style={styles.cardRow}
          >
            <View style={styles.flexChild}>
              <Text style={styles.settingTitle}>About Learn p5.js</Text>
              <Text style={styles.settingDescription}>Learn about p5.js and Processing</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </ScrollView>
      <ReportErrorModal
        visible={shakeModalVisible}
        onDismiss={() => setShakeModalVisible(false)}
        route="/settings"
      />
    </View>
  );
}
