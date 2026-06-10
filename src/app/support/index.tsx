import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Header from "../../components/Header";

const faqs = [
  {
    q: "How do I reset my progress?",
    a: "Go to Settings and tap 'Reset Progress'. This will clear all your learning data and start the onboarding process again.",
  },
  {
    q: "Can I use this offline?",
    a: "Some features require an internet connection, especially the code execution preview. Course content may be cached for offline viewing in a future update.",
  },
  {
    q: "How do exercises work?",
    a: "Each exercise presents a coding challenge. Write your solution in the editor, then tap Run to see the output. Compare your result with the target solution.",
  },
  {
    q: "Where can I learn more about p5.js?",
    a: "Visit the official p5.js website at p5js.org for full documentation, examples, and a vibrant community of creative coders.",
  },
];

const openGitHubIssues = () => {
  WebBrowser.openBrowserAsync(
    "https://github.com/anomalyco/learn-p5/issues"
  );
};

export default function Support() {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark">
      <Header title="Support" />
      <ScrollView
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Text className="font-headline text-lg font-bold text-on-surface dark:text-on-surface-dark">
          How can we help?
        </Text>
        <Text className="font-body text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
          Find answers to common questions or report an issue.
        </Text>

        <Text className="font-label text-xs uppercase tracking-widest text-text-secondary dark:text-text-secondary-dark mt-8 mb-3">
          Report a Bug
        </Text>
        <Pressable
          onPress={openGitHubIssues}
          className="bg-surface-dim dark:bg-surface-dim-dark rounded-xl overflow-hidden border-2 border-outline dark:border-outline-dark px-4 py-5 active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="Report a bug"
        >
          <View className="flex-row items-center gap-3">
            <MaterialCommunityIcons
              name="bug-outline"
              size={28}
              color="#ED225D"
            />
            <View className="flex-1">
              <Text className="font-headline text-base font-bold text-on-surface dark:text-on-surface-dark">
                Open GitHub Issues
              </Text>
              <Text className="font-body text-xs text-text-secondary dark:text-text-secondary-dark mt-0.5">
                Check known issues or create a new bug report
              </Text>
            </View>
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color="#6B7280"
            />
          </View>
        </Pressable>

        <Text className="font-label text-xs uppercase tracking-widest text-text-secondary dark:text-text-secondary-dark mt-8 mb-3">
          Frequently Asked Questions
        </Text>
        <View className="bg-surface-dim dark:bg-surface-dim-dark rounded-xl overflow-hidden border-2 border-outline dark:border-outline-dark">
          {faqs.map((faq, i) => {
            const isExpanded = expandedFaq === faq.q;
            return (
              <Pressable
                key={faq.q}
                onPress={() => setExpandedFaq(isExpanded ? null : faq.q)}
                className={`px-4 py-4 ${
                  i < faqs.length - 1
                    ? "border-b border-outline/20"
                    : ""
                }`}
                accessibilityRole="button"
                accessibilityLabel={faq.q}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="font-headline text-sm font-bold text-on-surface dark:text-on-surface-dark flex-1 pr-2">
                    {faq.q}
                  </Text>
                  <MaterialCommunityIcons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#6B7280"
                  />
                </View>
                {isExpanded && (
                  <Text className="font-body text-sm text-text-secondary dark:text-text-secondary-dark mt-3 leading-5">
                    {faq.a}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <View className="mt-10 items-center">
          <Text className="font-mono text-xs text-text-secondary dark:text-text-secondary-dark">
            Learn p5.js v0.2.5
          </Text>
          <Text className="font-body text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
            Built with Expo & React Native
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
