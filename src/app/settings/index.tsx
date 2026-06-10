import { useState, useEffect } from "react";
import { View, Text, Switch, Pressable, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import * as Notifications from "expo-notifications";
import Header from "../../components/Header";
import { useThemeContext } from "../../components/ThemeProvider";

const SETTINGS_KEYS = {
  dailyReminder: "setting_dailyReminder",
  snippetAlternatives: "setting_snippetAlternatives",
};

export default function Settings() {
  const { colorScheme, toggleTheme } = useThemeContext();
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

  const openFeedback = () => {
    WebBrowser.openBrowserAsync(
      "https://github.com/anomalyco/learn-p5/issues/new"
    );
  };

  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark">
      <Header title="Settings" />
      <ScrollView
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Text className="font-label text-xs uppercase tracking-widest text-text-secondary dark:text-text-secondary-dark mb-3">
          Appearance
        </Text>
        <View className="bg-surface-dim dark:bg-surface-dim-dark rounded-xl overflow-hidden border-2 border-outline dark:border-outline-dark">
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-1">
              <Text className="font-headline text-base font-bold text-on-surface dark:text-on-surface-dark">
                Dark Mode
              </Text>
              <Text className="font-body text-xs text-text-secondary dark:text-text-secondary-dark mt-0.5">
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

        <Text className="font-label text-xs uppercase tracking-widest text-text-secondary dark:text-text-secondary-dark mt-8 mb-3">
          Learning
        </Text>
        <View className="bg-surface-dim dark:bg-surface-dim-dark rounded-xl overflow-hidden border-2 border-outline dark:border-outline-dark">
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-outline/20">
            <View className="flex-1">
              <Text className="font-headline text-base font-bold text-on-surface dark:text-on-surface-dark">
                Daily Reminder
              </Text>
              <Text className="font-body text-xs text-text-secondary dark:text-text-secondary-dark mt-0.5">
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
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-1">
              <Text className="font-headline text-base font-bold text-on-surface dark:text-on-surface-dark">
                Snippet Alternatives
              </Text>
              <Text className="font-body text-xs text-text-secondary dark:text-text-secondary-dark mt-0.5">
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

        <Text className="font-label text-xs uppercase tracking-widest text-text-secondary dark:text-text-secondary-dark mt-8 mb-3">
          Feedback
        </Text>
        <Pressable
          onPress={openFeedback}
          className="bg-surface-dim dark:bg-surface-dim-dark rounded-xl overflow-hidden border-2 border-outline dark:border-outline-dark px-4 py-4 active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="Send feedback"
        >
          <Text className="font-headline text-base font-bold text-on-surface dark:text-on-surface-dark">
            Send Feedback
          </Text>
          <Text className="font-body text-xs text-text-secondary dark:text-text-secondary-dark mt-0.5">
            Report bugs, suggest features, or share your thoughts
          </Text>
        </Pressable>

        <Text className="font-label text-xs uppercase tracking-widest text-text-secondary dark:text-text-secondary-dark mt-8 mb-3">
          About
        </Text>
        <View className="bg-surface-dim dark:bg-surface-dim-dark rounded-xl overflow-hidden border-2 border-outline dark:border-outline-dark px-4 py-4">
          <Text className="font-headline text-base font-bold text-on-surface dark:text-on-surface-dark">
            Learn p5.js
          </Text>
          <Text className="font-mono text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
            Version 0.2.5
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
