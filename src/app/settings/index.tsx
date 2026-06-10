import { useState, useEffect } from "react";
import { View, Text, Switch, Pressable, ScrollView, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import * as Notifications from "expo-notifications";
import Header from "../../components/Header";
import { useThemeContext } from "../../components/ThemeProvider";
import { Colors } from "../../constants/Colors";

const SETTINGS_KEYS = {
  dailyReminder: "setting_dailyReminder",
  snippetAlternatives: "setting_snippetAlternatives",
};

const openFeedback = () => {
  WebBrowser.openBrowserAsync(
    "https://github.com/anomalyco/learn-p5/issues/new"
  );
};

export default function Settings() {
  const { colorScheme, toggleTheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const [dailyReminder, setDailyReminder] = useState(false);
  const [snippetAlternatives, setSnippetAlternatives] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet([
      SETTINGS_KEYS.dailyReminder,
      SETTINGS_KEYS.snippetAlternatives,
    ]).then(([reminder, snippet]) => {
      setDailyReminder(reminder[1] === "true");
      setSnippetAlternatives(snippet[1] === "true");
    });
  }, []);

  const toggleDailyReminder = async (value: boolean) => {
    setDailyReminder(value);
    await AsyncStorage.setItem(
      SETTINGS_KEYS.dailyReminder,
      value.toString()
    );

    if (value) {
      await Notifications.requestPermissionsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to code!",
          body: "Keep your streak alive — practice your p5.js skills today.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 18,
          minute: 0,
        },
      });
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
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
        <View style={[styles.card, { backgroundColor: colors.surfaceDim, borderColor: colors.outline }]}>
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
        <View style={[styles.card, { backgroundColor: colors.surfaceDim, borderColor: colors.outline }]}>
          <View style={[styles.cardRow, { borderBottomWidth: 1, borderColor: colors.outline + "33" }]}>
            <View style={styles.flexChild}>
              <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
                Daily Reminder
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Get reminded to practice at 6:00 PM
              </Text>
            </View>
            <Switch
              value={dailyReminder}
              onValueChange={toggleDailyReminder}
              trackColor={{ false: "#767577", true: "#ED225D" }}
              thumbColor="#ffffff"
            />
          </View>
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
            { backgroundColor: colors.surfaceDim, borderColor: colors.outline },
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
        <View style={[styles.card, { backgroundColor: colors.surfaceDim, borderColor: colors.outline, paddingHorizontal: 16, paddingVertical: 16 }]}>
          <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
            Learn p5.js
          </Text>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Version 0.2.5
          </Text>
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
    fontFamily: "Inter",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
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
    fontFamily: "SpaceGrotesk",
    fontSize: 16,
    fontWeight: "700",
  },
  settingDescription: {
    fontFamily: "Inter",
    fontSize: 11,
    marginTop: 2,
  },
  feedbackButton: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  feedbackButtonActive: {
    opacity: 0.8,
  },
  versionText: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
    marginTop: 4,
  },
});
