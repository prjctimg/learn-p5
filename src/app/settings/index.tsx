import { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, Switch, Pressable, ScrollView, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import Header from "../../components/Header";
import TimePicker from "../../components/TimePicker";
import Toast from "../../components/Toast";
import StreakToast from "../../components/StreakToast";
import { useThemeContext } from "../../components/ThemeProvider";
import { Colors } from "../../constants/Colors";
import { DEFAULTS } from "../../constants/Defaults";
import { STREAK_TIERS } from "../../hooks/useStreak";
import { EDITOR_THEMES, getThemeSwatches } from "../../utils/editor/themes";
import { loadAllCourses } from "../../utils/courseLoader";

const STREAK_KEYS = {
 count: "streak_count",
 lastVisit: "streak_last_visit",
 longest: "streak_longest",
 lastTier: "streak_last_tier",
 toastPending: "streak_toast_pending",
};

const SETTINGS_KEYS = {
 dailyReminder: "setting_dailyReminder",
 snippetAlternatives: "setting_snippetAlternatives",
 notificationHour: "setting_notificationHour",
 notificationMinute: "setting_notificationMinute",
 showDrawerFab: "setting_showDrawerFab",
 codeFontSize: "setting_codeFontSize",
 codeBackground: "setting_codeBackground",
 keyboardHeight: "setting_keyboardHeight",
 editorTheme: "setting_editorTheme",
 devMode: "setting_devMode",
};

const createStyles = (colors: Record<string, string>) =>
 StyleSheet.create({
 container: { flex: 1 },
 scrollContent: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
 sectionTitle: {
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
 settingTitle: { fontSize: 16, fontWeight: "700", color: colors.onSurface },
 settingDescription: { fontSize: 11, marginTop: 2, color: colors.textSecondary },
 nameInput: {
 fontSize: 16,
 borderBottomWidth: 1,
 paddingVertical: 8,
 flex: 1,
 },
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
 const [codeFontSize, setCodeFontSize] = useState(DEFAULTS.codeFontSize);
 const [codeBackground, setCodeBackgroundState] = useState<string>(DEFAULTS.codeBackground);
 const [keyboardHeight, setKeyboardHeightState] = useState<string>(DEFAULTS.keyboardHeight);
 const [editorTheme, setEditorTheme] = useState<string>("p5-learn");
 const [displayName, setDisplayName] = useState("");
 const [devMode, setDevMode] = useState(false);
 const [debugToastVisible, setDebugToastVisible] = useState(false);
 const [debugStreakToastVisible, setDebugStreakToastVisible] = useState(false);
 const [debugStreakCount, setDebugStreakCount] = useState("7");
 const [examsCompleteAllLabel, setExamsCompleteAllLabel] = useState("Complete All Exercises");

 useEffect(() => {
 AsyncStorage.multiGet([
 SETTINGS_KEYS.dailyReminder,
 SETTINGS_KEYS.snippetAlternatives,
 SETTINGS_KEYS.notificationHour,
 SETTINGS_KEYS.notificationMinute,
 SETTINGS_KEYS.showDrawerFab,
 SETTINGS_KEYS.codeFontSize,
 SETTINGS_KEYS.codeBackground,
 SETTINGS_KEYS.keyboardHeight,
 SETTINGS_KEYS.editorTheme,
 SETTINGS_KEYS.devMode,
 ]).then(([reminder, snippet, hour, minute, fab, fontSize, bg, kb, theme, dev]) => {
 setDailyReminder(reminder[1] === "true");
 setSnippetAlternatives(snippet[1] === "true");
 if (hour[1]) setNotificationHour(parseInt(hour[1], 10));
 if (minute[1]) setNotificationMinute(parseInt(minute[1], 10));
 setShowDrawerFab(fab[1] === "true");
 if (fontSize[1]) setCodeFontSize(parseInt(fontSize[1], 10));
 if (bg[1]) setCodeBackgroundState(bg[1]);
 if (kb[1]) setKeyboardHeightState(kb[1]);
 if (theme[1]) setEditorTheme(theme[1]);
 setDevMode(dev[1] === "true");
 });
 AsyncStorage.getItem("onboardingData").then((val) => {
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

 const toggleSnippetAlternatives = async (value: boolean) => {
 setSnippetAlternatives(value);
 await AsyncStorage.setItem(SETTINGS_KEYS.snippetAlternatives, value.toString());
 };

 const toggleShowDrawerFab = async (value: boolean) => {
 setShowDrawerFab(value);
 await AsyncStorage.setItem(SETTINGS_KEYS.showDrawerFab, value.toString());
 };

 const changeCodeFontSize = async (delta: number) => {
 const newSize = Math.min(DEFAULTS.codeFontSizeMax, Math.max(DEFAULTS.codeFontSizeMin, codeFontSize + delta));
 setCodeFontSize(newSize);
 await AsyncStorage.setItem(SETTINGS_KEYS.codeFontSize, newSize.toString());
 };

 const changeCodeBackground = async (value: string) => {
 setCodeBackgroundState(value);
 await AsyncStorage.setItem(SETTINGS_KEYS.codeBackground, value);
 };

 const changeKeyboardHeight = async (value: string) => {
 setKeyboardHeightState(value);
 await AsyncStorage.setItem(SETTINGS_KEYS.keyboardHeight, value);
 };

 const changeEditorTheme = async (value: string) => {
 setEditorTheme(value);
 await AsyncStorage.setItem(SETTINGS_KEYS.editorTheme, value);
 };

 const handleDisplayNameChange = useCallback(async (text: string) => {
 setDisplayName(text);
 AsyncStorage.getItem("onboardingData").then((val) => {
 const data = val ? JSON.parse(val) : {};
 data.displayName = text;
 AsyncStorage.setItem("onboardingData", JSON.stringify(data));
 });
 }, []);

 const toggleDevMode = async (value: boolean) => {
 setDevMode(value);
 await AsyncStorage.setItem(SETTINGS_KEYS.devMode, value.toString());
 };

 const handleCompleteAllExercises = async () => {
 const courses = await loadAllCourses();
 const allLessonKeys: string[] = [];
 for (const c of courses) {
 for (const l of c.lessons) {
 allLessonKeys.push(`${c.slug}/${l.id}`);
 }
 }
 await AsyncStorage.setItem("completedLessons", JSON.stringify(allLessonKeys));
 setExamsCompleteAllLabel("Done! Reload to see");
 setTimeout(() => setExamsCompleteAllLabel("Complete All Exercises"), 3000);
 };

 const handleResetAllProgress = async () => {
 await AsyncStorage.removeItem("completedLessons");
 await AsyncStorage.removeItem("completedCourses");
 setExamsCompleteAllLabel("Reset! Reload to see");
 setTimeout(() => setExamsCompleteAllLabel("Complete All Exercises"), 3000);
 };

 const handleSetStreak = async () => {
 const count = parseInt(debugStreakCount, 10);
 if (isNaN(count)) return;
 const today = new Date().toISOString().split("T")[0];
 await AsyncStorage.multiSet([
 [STREAK_KEYS.count, count.toString()],
 [STREAK_KEYS.lastVisit, today],
 ]);
 };

 const keyboardHeightPixels = DEFAULTS.keyboardHeightPixels;

 return (
 <View style={[styles.container, { backgroundColor: colors.surface }]}>
 <Header title="Settings" />
 <ScrollView
 style={styles.scrollContent}
 contentContainerStyle={{ paddingBottom: 32 }}
 >
 {/* Profile */}
 <Text style={styles.sectionTitle}>Profile</Text>
 <View style={styles.card}>
 <View style={styles.cardRow}>
 <View style={styles.flexChild}>
 <Text style={styles.settingTitle}>Display Name</Text>
 <Text style={styles.settingDescription}>
 Used in greetings and notifications
 </Text>
 </View>
 </View>
 <View style={[styles.cardRow, { borderTopWidth: 1, borderTopColor: colors.surfaceContainerHighest }]}>
 <TextInput
 style={[styles.nameInput, { color: colors.primary, borderColor: colors.outlineVariant }]}
 placeholder="Enter your name"
 placeholderTextColor={colors.textSecondary}
 value={displayName}
 onChangeText={handleDisplayNameChange}
 maxLength={30}
 />
 </View>
 </View>

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
 <TimePicker
 hour={notificationHour}
 minute={notificationMinute}
 onTimeChange={handleTimeChange}
 />
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
 <Text style={{ fontSize: 16, fontWeight: "700", color: colors.onSurface, minWidth: 32, textAlign: "center" }}>
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

 <View style={[styles.cardRow, { borderTopWidth: 1, borderTopColor: colors.surfaceContainerHighest }]}>
 <View style={styles.flexChild}>
 <Text style={styles.settingTitle}>Code Background</Text>
 <Text style={styles.settingDescription}>
 {codeBackground === "auto"
 ? "Follow system theme"
 : codeBackground === "#FFFFFF"
 ? "Light background"
 : "Dark background"}
 </Text>
 </View>
 <View style={{ flexDirection: "row", gap: 6 }}>
 {["auto", "#FFFFFF", "#0D0E12"].map((opt) => (
 <Pressable
 key={opt}
 onPress={() => changeCodeBackground(opt)}
 style={({ pressed }) => ({
 paddingHorizontal: 12,
 paddingVertical: 6,
 borderRadius: 6,
 backgroundColor:
 codeBackground === opt
 ? colors.primary
 : pressed
 ? colors.primaryContainer + "33"
 : colors.surfaceContainerHigh,
 })}
 accessibilityRole="button"
 accessibilityLabel={
 opt === "auto" ? "Auto" : opt === "#FFFFFF" ? "Light" : "Dark"
 }
 >
 <Text
 style={{
 fontSize: 11,
 fontWeight: "700",
 textTransform: "uppercase",
 letterSpacing: 0.5,
 color: codeBackground === opt ? colors.onPrimary : colors.onSurfaceVariant,
 }}
 >
 {opt === "auto" ? "Auto" : opt === "#FFFFFF" ? "Light" : "Dark"}
 </Text>
 </Pressable>
))}
 </View>
 </View>

 <View style={[styles.cardRow, { borderTopWidth: 1, borderTopColor: colors.surfaceContainerHighest, flexWrap: "wrap", gap: 6 }]}>
 <View style={{ width: "100%", marginBottom: 8 }}>
 <Text style={styles.settingTitle}>Editor Theme</Text>
 <Text style={styles.settingDescription}>
 Choose a color theme for the code editor
 </Text>
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
 backgroundColor:
 editorTheme === key
 ? colors.primary
 : pressed
 ? colors.primaryContainer + "33"
 : colors.surfaceContainerHigh,
 })}
 >
 <View style={{ flexDirection: "row", gap: 2 }}>
 {swatches.map((s, i) => (
 <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s }} />
))}
 </View>
 <Text
 style={{
 fontSize: 11,
 fontWeight: "700",
 textTransform: "uppercase",
 letterSpacing: 0.5,
 color: editorTheme === key ? colors.onPrimary : colors.onSurfaceVariant,
 }}
 >
 {theme.label}
 </Text>
 </Pressable>
);
 })}
 </View>
 </View>

 {/* Keyboard */}
 <Text style={[styles.sectionTitle, styles.sectionMargin]}>Keyboard</Text>
 <View style={styles.card}>
 <View style={styles.cardRow}>
 <View style={styles.flexChild}>
 <Text style={styles.settingTitle}>Keyboard Height</Text>
 <Text style={styles.settingDescription}>
 {keyboardHeight === "medium"
 ? "280px — default"
 : "360px — tall"}
 </Text>
 </View>
 <View style={{ flexDirection: "row", gap: 6 }}>
 {["small", "medium", "tall"].map((opt) => (
 <Pressable
 key={opt}
 onPress={() => changeKeyboardHeight(opt)}
 style={({ pressed }) => ({
 paddingHorizontal: 12,
 paddingVertical: 6,
 borderRadius: 6,
 minWidth: 42,
 alignItems: "center",
 backgroundColor:
 keyboardHeight === opt
 ? colors.primary
 : pressed
 ? colors.primaryContainer + "33"
 : colors.surfaceContainerHigh,
 })}
 accessibilityRole="button"
 accessibilityLabel={`${opt} keyboard`}
 >
 <Text
 style={{
 fontSize: 11,
 fontWeight: "700",
 textTransform: "uppercase",
 letterSpacing: 0.5,
 color: keyboardHeight === opt ? colors.onPrimary : colors.onSurfaceVariant,
 }}
 >
 {opt === "small" ? "S" : opt === "medium" ? "M" : "T"}
 </Text>
 </Pressable>
))}
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

 {/* Debugging */}
 <Text style={[styles.sectionTitle, styles.sectionMargin]}>Debugging</Text>
 <View style={styles.card}>
 <View style={styles.cardRow}>
 <View style={styles.flexChild}>
 <Text style={styles.settingTitle}>Dev Mode</Text>
 <Text style={styles.settingDescription}>
 Enable debug controls for testing
 </Text>
 </View>
 <Switch
 value={devMode}
 onValueChange={toggleDevMode}
 trackColor={{ false: "#767577", true: "#ED225D" }}
 thumbColor="#ffffff"
 />
 </View>
 </View>

 {devMode && (
 <>
 <Text style={[styles.sectionTitle, styles.sectionMargin]}>
 Component Triggers
 </Text>
 <View style={styles.card}>
 <View style={styles.cardRow}>
 <Text style={styles.settingTitle}>Show Toast</Text>
 <Pressable
 onPress={() => setDebugToastVisible(true)}
 style={({ pressed }) => ({
 paddingHorizontal: 14,
 paddingVertical: 8,
 borderRadius: 8,
 backgroundColor: pressed ? colors.primaryContainer : colors.primary,
 })}
 >
 <Text style={{ fontSize: 11, fontWeight: "700", color: colors.onPrimary, textTransform: "uppercase" }}>
 Trigger
 </Text>
 </Pressable>
 </View>
 <View style={[styles.cardRow, { borderTopWidth: 1, borderTopColor: colors.surfaceContainerHighest }]}>
 <Text style={styles.settingTitle}>Show Streak Toast</Text>
 <Pressable
 onPress={() => setDebugStreakToastVisible(true)}
 style={({ pressed }) => ({
 paddingHorizontal: 14,
 paddingVertical: 8,
 borderRadius: 8,
 backgroundColor: pressed ? colors.primaryContainer : colors.primary,
 })}
 >
 <Text style={{ fontSize: 11, fontWeight: "700", color: colors.onPrimary, textTransform: "uppercase" }}>
 Trigger
 </Text>
 </Pressable>
 </View>
 </View>

 <Text style={[styles.sectionTitle, styles.sectionMargin]}>
 Mock Exercise State
 </Text>
 <View style={styles.card}>
 <View style={styles.cardRow}>
 <View style={styles.flexChild}>
 <Text style={styles.settingTitle}>{examsCompleteAllLabel}</Text>
 <Text style={styles.settingDescription}>
 Mark every lesson as completed
 </Text>
 </View>
 <Pressable
 onPress={handleCompleteAllExercises}
 style={({ pressed }) => ({
 paddingHorizontal: 14,
 paddingVertical: 8,
 borderRadius: 8,
 backgroundColor: pressed ? colors.primaryContainer : colors.primary,
 })}
 >
 <Text style={{ fontSize: 11, fontWeight: "700", color: colors.onPrimary, textTransform: "uppercase" }}>
 Run
 </Text>
 </Pressable>
 </View>
 <View style={[styles.cardRow, { borderTopWidth: 1, borderTopColor: colors.surfaceContainerHighest }]}>
 <View style={styles.flexChild}>
 <Text style={styles.settingTitle}>Reset All Progress</Text>
 <Text style={styles.settingDescription}>
 Clear all completed lessons and courses
 </Text>
 </View>
 <Pressable
 onPress={handleResetAllProgress}
 style={({ pressed }) => ({
 paddingHorizontal: 14,
 paddingVertical: 8,
 borderRadius: 8,
 backgroundColor: pressed ? colors.errorContainer : colors.error,
 })}
 >
 <Text style={{ fontSize: 11, fontWeight: "700", color: colors.onError, textTransform: "uppercase" }}>
 Reset
 </Text>
 </Pressable>
 </View>
 <View style={[styles.cardRow, { borderTopWidth: 1, borderTopColor: colors.surfaceContainerHighest, flexWrap: "wrap", gap: 8 }]}>
 <View style={{ width: "100%", marginBottom: 4 }}>
 <Text style={styles.settingTitle}>Set Streak Count</Text>
 </View>
 <TextInput
 style={[styles.nameInput, { color: colors.primary, borderColor: colors.outlineVariant, flex: 0, minWidth: 80, maxWidth: 100 }]}
 value={debugStreakCount}
 onChangeText={setDebugStreakCount}
 keyboardType="number-pad"
 maxLength={4}
 />
 <Pressable
 onPress={handleSetStreak}
 style={({ pressed }) => ({
 paddingHorizontal: 14,
 paddingVertical: 8,
 borderRadius: 8,
 backgroundColor: pressed ? colors.primaryContainer : colors.primary,
 })}
 >
 <Text style={{ fontSize: 11, fontWeight: "700", color: colors.onPrimary, textTransform: "uppercase" }}>
 Set
 </Text>
 </Pressable>
 </View>
 </View>
 </>
)}
 </ScrollView>

 <Toast
 visible={debugToastVisible}
 message="Debug toast — component rendering works!"
 onDismiss={() => setDebugToastVisible(false)}
 />
 <StreakToast
 visible={debugStreakToastVisible}
 streakCount={7}
 tierProgress={0.5}
 nextTier={14}
 onDismiss={() => setDebugStreakToastVisible(false)}
 />
 </View>
);
}