import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Header from "../../components/Header";
import { useThemeContext } from "../../components/ThemeProvider";
import { Colors } from "../../constants/Colors";

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
 "https://github.com/prjctimg/learn-p5/issues"
);
};

const createStyles = (colors: Record<string, string>) =>
 StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: colors.surface,
 },
 scrollView: {
 flex: 1,
 paddingHorizontal: 16,
 paddingTop: 24,
 },
  heading: {
    fontFamily: "JetBrainsMono",
    fontSize: 18,
 fontWeight: "700",
 color: colors.onSurface,
 },
  subtitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
 color: colors.textSecondary,
 marginTop: 4,
 },
  sectionLabel: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
 textTransform: "uppercase",
 letterSpacing: 1,
 color: colors.textSecondary,
 marginTop: 32,
 marginBottom: 12,
 },
 bugReportButton: {
 backgroundColor: colors.surfaceDim,
 borderRadius: 12,
 overflow: "hidden",
 paddingHorizontal: 16,
 paddingVertical: 20,
 },
 bugReportButtonPressed: {
 opacity: 0.8,
 },
 bugReportRow: {
 flexDirection: "row",
 alignItems: "center",
 gap: 12,
 },
 flex1: {
 flex: 1,
 },
  cardTitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
 fontWeight: "700",
 color: colors.onSurface,
 },
  cardSubtitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
 color: colors.textSecondary,
 marginTop: 2,
 },
 faqContainer: {
 backgroundColor: colors.surfaceDim,
 borderRadius: 12,
 overflow: "hidden",
 },
 faqItem: {
 paddingHorizontal: 16,
 paddingVertical: 16,
 },
 faqHeader: {
 flexDirection: "row",
 alignItems: "center",
 justifyContent: "space-between",
 },
  faqQuestion: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
 fontWeight: "700",
 color: colors.onSurface,
 flex: 1,
 paddingRight: 8,
 },
  faqAnswer: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
 color: colors.textSecondary,
 marginTop: 12,
 lineHeight: 20,
 },
 footer: {
 marginTop: 40,
 alignItems: "center",
 },
  footerInfo: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
 color: colors.textSecondary,
 marginTop: 4,
 },
 });

export default function Support() {
 const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
 const { colorScheme } = useThemeContext();
 const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
 const styles = createStyles(colors);

 return (
 <View style={styles.container}>
 <Header title="Support" />
 <ScrollView
 style={styles.scrollView}
 contentContainerStyle={{ paddingBottom: 32 }}
 >
 <Text style={styles.heading}>
 How can we help?
 </Text>
 <Text style={styles.subtitle}>
 Find answers to common questions or report an issue.
 </Text>

 <Text style={styles.sectionLabel}>
 Report a Bug
 </Text>
 <Pressable
 onPress={openGitHubIssues}
 style={({ pressed }) => [
 styles.bugReportButton,
 pressed && styles.bugReportButtonPressed,
 ]}
 accessibilityRole="button"
 accessibilityLabel="Report a bug"
 >
 <View style={styles.bugReportRow}>
 <MaterialCommunityIcons
 name="bug-outline"
 size={28}
  color={colors.cta}
 />
 <View style={styles.flex1}>
 <Text style={styles.cardTitle}>
 Open GitHub Issues
 </Text>
 <Text style={styles.cardSubtitle}>
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

 <Text style={styles.sectionLabel}>
 Frequently Asked Questions
 </Text>
 <View style={styles.faqContainer}>
 {faqs.map((faq, i) => {
 const isExpanded = expandedFaq === faq.q;
 return (
 <Pressable
 key={faq.q}
 onPress={() => setExpandedFaq(isExpanded ? null : faq.q)}
 style={styles.faqItem}
 accessibilityRole="button"
 accessibilityLabel={faq.q}
 >
 <View style={styles.faqHeader}>
 <Text style={styles.faqQuestion}>
 {faq.q}
 </Text>
 <MaterialCommunityIcons
 name={isExpanded ? "chevron-up" : "chevron-down"}
 size={20}
 color="#6B7280"
 />
 </View>
 {isExpanded && (
 <Text style={styles.faqAnswer}>
 {faq.a}
 </Text>
)}
 </Pressable>
);
 })}
 </View>

 <View style={styles.footer}>
 <Text style={styles.footerInfo}>
 p5.js is a JS client-side library for creative coding
 </Text>
 </View>
 </ScrollView>
 </View>
);
}
