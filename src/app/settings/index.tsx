import { useState, useEffect, useCallback } from "react";
import { View, Text, Switch, Pressable, ScrollView, StyleSheet, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import * as Notifications from "expo-notifications";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import Header from "../../components/Header";
import { useThemeContext } from "../../components/ThemeProvider";
import { Colors } from "../../constants/Colors";
import { APP_VERSION } from "../../constants/Version";

const SETTINGS_KEYS = {
  dailyReminder: "setting_dailyReminder",
  snippetAlternatives: "setting_snippetAlternatives",
  notificationHour: "setting_notificationHour",
  notificationMinute: "setting_notificationMinute",
};

const openFeedback = () => {
  WebBrowser.openBrowserAsync(
    "https://github.com/anomalyco/learn-p5/issues/new"
  );
};

function formatTime(hour: number, minute: number): string {
  const h = hour % 12 || 12;
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

export default function Settings() {
  const { colorScheme, toggleTheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const [dailyReminder, setDailyReminder] = useState(false);
  const [snippetAlternatives, setSnippetAlternatives] = useState(false);
  const [notificationHour, setNotificationHour] = useState(18);
  const [notificationMinute, setNotificationMinute] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet([
      SETTINGS_KEYS.dailyReminder,
      SETTINGS_KEYS.snippetAlternatives,
      SETTINGS_KEYS.notificationHour,
      SETTINGS_KEYS.notificationMinute,
    ]).then(([reminder, snippet, hour, minute]) => {
      setDailyReminder(reminder[1] === "true");
      setSnippetAlternatives(snippet[1] === "true");
      if (hour[1]) setNotificationHour(parseInt(hour[1], 10));
      if (minute[1]) setNotificationMinute(parseInt(minute[1], 10));
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
    await AsyncStorage.setItem(
      SETTINGS_KEYS.dailyReminder,
      value.toString()
    );

    if (value) {
      await scheduleNotification(notificationHour, notificationMinute);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const handleTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (!selectedDate) return;
    const hour = selectedDate.getHours();
    const minute = selectedDate.getMinutes();
    setNotificationHour(hour);
    setNotificationMinute(minute);
    AsyncStorage.multiSet([
      [SETTINGS_KEYS.notificationHour, hour.toString()],
      [SETTINGS_KEYS.notificationMinute, minute.toString()],
    ]);
    if (dailyReminder) {
      scheduleNotification(hour, minute);
    }
  };

  const toggleSnippetAlternatives = async (value: boolean) => {
    setSnippetAlternatives(value);
    await AsyncStorage.setItem(
      SETTINGS_KEYS.snippetAlternatives,
      value.toString()
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Header title="Settings" />
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Appearance
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surfaceDim }]}>
          <View style={styles.cardRow}>
            <View style={styles.flexChild}>
              <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
                Dark Mode
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
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

        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 32 }]}>
          Learning
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surfaceDim }]}>
          <View style={styles.cardRow}>
            <View style={styles.flexChild}>
              <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
                Daily Reminder
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
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
          <Pressable
            onPress={() => setShowTimePicker(true)}
            style={({ pressed }) => [
              styles.timeRow,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Change notification time"
          >
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Notification time
            </Text>
            <Text style={[styles.timeText, { color: colors.onSurface }]}>
              {formatTime(notificationHour, notificationMinute)}
            </Text>
          </Pressable>
          {showTimePicker && (
            <DateTimePicker
              value={new Date(0, 0, 0, notificationHour, notificationMinute)}
              mode="time"
              is24Hour={false}
              onChange={handleTimeChange}
            />
          )}
          <View style={styles.cardRow}>
            <View style={styles.flexChild}>
              <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
                Snippet Alternatives
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
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

        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 32 }]}>
          Feedback
        </Text>
        <Pressable
          onPress={openFeedback}
          style={({ pressed }) => [
            styles.feedbackButton,
            { backgroundColor: colors.surfaceDim },
            pressed && styles.feedbackButtonActive,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Send feedback"
        >
          <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
            Send Feedback
          </Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Report bugs, suggest features, or share your thoughts
          </Text>
        </Pressable>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 32 }]}>
          About
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surfaceDim }]}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
            <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
              Learn p5.js
            </Text>
            <Text style={[styles.versionText, { color: colors.textSecondary }]}>
              Version {APP_VERSION}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  flexChild: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
    fontWeight: "700",
  },
  settingDescription: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
    marginTop: 2,
  },
  feedbackButton: {
    borderRadius: 12,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  feedbackButtonActive: {
    opacity: 0.8,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "transparent",
  },
  timeText: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
    fontWeight: "700",
  },
  versionText: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
    marginTop: 4,
  },
});
