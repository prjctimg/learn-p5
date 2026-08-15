import { useMemo, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
 useSharedValue,
 useAnimatedStyle,
 withTiming,
} from "react-native-reanimated";
import {
 experienceOptions,
 pathOptions,
 isLastSlide,
 isFirstSlide,
 getNextSlideId,
 getPrevSlideId,
} from "../../data/onboardingSlides";
import { useOnboarding } from "../../hooks/useOnboarding";
import { useThemeContext } from "../../components/ThemeProvider";
import { Colors } from "../../constants/Colors";

interface SlideData {
 title: string;
 subtitle?: string;
 tags?: string[];
 modules?: { name: string; desc: string }[];
}

const slideContent: Record<string, SlideData> = {
 "1": {
 title: "A new way to\ncreate with code",
 subtitle:
 "p5.js is a friendly library that makes creative coding accessible to everyone. Learn to create art and animations with JavaScript.",
 tags: ["Creative coding", "Visual Arts"],
 },
 "2": {
 title: "How much creative coding\nexperience do you have?",
 subtitle:
 "We'll tailor the sketches and challenges to match your current skill level.",
 },
 "3": {
 title: "Why do you want\nto learn p5.js?",
 },
 "4": {
 title: "What should we\ncall you?",
 subtitle:
 "This will be used in greetings and notifications — local only, never shared.",
 },
 "5": {
 title: "Your Path",
 subtitle:
 "Based on your goals, we've optimized a path for creative expression and logic.",
 modules: [
 { name: "The Canvas Basics", desc: "Master the coordinate system and draw your first primitive shapes." },
 { name: "Color & Motion", desc: "Unlock the power of color spaces and frame-based animation loops." },
 { name: "Interactivity", desc: "Bridge the gap between user and art with events and keyboard logic." },
 ],
 },
};

export default function OnboardingSlide() {
 const { slide } = useLocalSearchParams<{ slide: string }>();
 const router = useRouter();
 const insets = useSafeAreaInsets();
 const { data, updateData, completeOnboarding } = useOnboarding();
 const fadeAnim = useSharedValue(0);
 const slideAnim = useSharedValue(30);
 const { colorScheme, ctaColor, derivedColors } = useThemeContext();
 const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

 const animatedStyle = useAnimatedStyle(() => ({
 opacity: fadeAnim.value,
 transform: [{ translateY: slideAnim.value }],
 }));

 useEffect(() => {
 fadeAnim.value = 0;
 slideAnim.value = 30;
 fadeAnim.value = withTiming(1, { duration: 400 });
 slideAnim.value = withTiming(0, { duration: 400 });
 }, [slide]);

 const styles = useMemo(() => StyleSheet.create({
 flex1: { flex: 1 },
 flexRow: { flexDirection: "row" },
 flexWrap: { flexWrap: "wrap" },
 justifyCenter: { justifyContent: "center" },
 contentPadding: { paddingHorizontal: 24 },
 nameInput: {
 fontFamily: "JetBrainsMono",
 fontSize: 24,
 fontWeight: "700",
 borderBottomWidth: 2,
 paddingVertical: 12,
 marginTop: 32,
 borderColor: derivedColors.primary,
 color: colors.onSurface,
 },
 headerRow: {
 flexDirection: "row",
 alignItems: "center",
 paddingHorizontal: 16,
 paddingBottom: 12,
 },
 backButton: {
 width: 40,
 height: 40,
 alignItems: "center",
 justifyContent: "center",
  },
  welcomeTitle: {
 fontFamily: "JetBrainsMono",
 fontSize: 32,
 fontWeight: "700",
 lineHeight: 45,
 letterSpacing: -0.5,
 color: colors.onSurface,
 },
 welcomeSubtitle: {
 fontFamily: "JetBrainsMono",
 fontSize: 16,
 lineHeight: 24,
 color: colors.onSurfaceVariant,
 marginTop: 16,
 },
 tagItem: {
 alignItems: "center",
 paddingHorizontal: 16,
 paddingVertical: 8,
 borderRadius: 9999,
 backgroundColor: colors.surfaceContainer,
 },
 tagDot: {
 width: 12,
 height: 12,
 borderRadius: 9999,
 backgroundColor: derivedColors.primary,
 marginRight: 8,
 },
 tagLabel: {
 fontFamily: "JetBrainsMono",
 fontSize: 12,
 textTransform: "uppercase",
 letterSpacing: 0.5,
 color: colors.onSurfaceVariant,
 },
 codeBlock: {
 backgroundColor: colors.surfaceContainerLowest,
 padding: 16,
 borderRadius: 8,
 },
 codeBlockHeader: {
 justifyContent: "space-between",
 alignItems: "center",
 marginBottom: 8,
 paddingBottom: 8,
 },
 codeBlockLabel: {
 color: derivedColors.primary,
 fontWeight: "700",
 fontSize: 11,
 textTransform: "uppercase",
 },
 codeTextPink: {
 fontFamily: "JetBrainsMono",
 fontSize: 12,
 color: derivedColors.primary,
 },
 codeTextWhite: {
 fontFamily: "JetBrainsMono",
 fontSize: 12,
 color: colors.onSurface,
 paddingLeft: 16,
 },
 codeTextPink2: {
 fontFamily: "JetBrainsMono",
 fontSize: 12,
 color: derivedColors.primary,
 paddingLeft: 16,
 },
 slideTitle: {
 fontFamily: "JetBrainsMono",
 fontSize: 24,
 fontWeight: "700",
 color: colors.onSurface,
 },
 slideSubtitle: {
 fontFamily: "JetBrainsMono",
 fontSize: 16,
 color: colors.onSurfaceVariant,
 marginTop: 8,
 },
 optionCard: {
 padding: 16,
 borderRadius: 20,
 },
 optionTitle: {
 fontFamily: "JetBrainsMono",
 fontSize: 20,
 fontWeight: "700",
 },
 optionDesc: {
 fontFamily: "JetBrainsMono",
 fontSize: 16,
 marginTop: 4,
 },
 pathTitle: {
 fontFamily: "JetBrainsMono",
 fontSize: 20,
 fontWeight: "700",
 },
 pathDesc: {
 fontFamily: "JetBrainsMono",
 fontSize: 16,
 marginTop: 4,
 },
 readyTitle: {
 fontFamily: "JetBrainsMono",
 fontSize: 32,
 fontWeight: "700",
 color: colors.onSurface,
 },
 moduleCard: {
 padding: 16,
 borderRadius: 16,
 backgroundColor: colors.surfaceContainer,
 },
 moduleNumber: {
 width: 32,
 height: 32,
 borderRadius: 9999,
 backgroundColor: derivedColors.primary,
 alignItems: "center",
 justifyContent: "center",
 },
 moduleNumberText: {
 fontFamily: "JetBrainsMono",
 fontWeight: "700",
 color: colors.onPrimary,
 },
 moduleName: {
 fontFamily: "JetBrainsMono",
 fontSize: 20,
 fontWeight: "700",
 color: colors.onSurface,
 },
 moduleDesc: {
 fontFamily: "JetBrainsMono",
 fontSize: 16,
 color: colors.onSurfaceVariant,
 marginTop: 2,
 },
 readyCta: {
 fontFamily: "JetBrainsMono",
 fontSize: 20,
 fontWeight: "700",
 textAlign: "center",
 color: derivedColors.primary,
 },
 bottomBar: {
 position: "absolute",
 bottom: 0,
 left: 0,
 right: 0,
 paddingHorizontal: 24,
 paddingTop: 24,
 backgroundColor: colors.surface,
 },
 dot: {
 width: 8,
 height: 8,
 borderRadius: 9999,
 },
 ctaButton: {
 width: "100%",
 paddingVertical: 12,
 alignItems: "center",
 borderRadius: 14,
 },
 ctaButtonText: {
 fontFamily: "JetBrainsMono",
 fontWeight: "700",
 fontSize: 14,
 textTransform: "uppercase",
 letterSpacing: 1,
 color: colors.onPrimary,
 },
 headlineXl: {
 fontFamily: "JetBrainsMono",
 fontSize: 20,
 fontWeight: "700",
 },
}), [colors]);

 if (!slide || !(slide in slideContent)) {
 return (
 <View style={{ flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}>
 <Text style={[{ fontFamily: "JetBrainsMono", fontSize: 24, fontWeight: "900" }, { color: colors.onSurface }]}>
 Slide not found
 </Text>
 </View>
 );
 }

 const content = slideContent[slide as keyof typeof slideContent];

 const handleNext = () => {
 const nextId = getNextSlideId(slide);
 if (nextId) {
 router.replace(`/onboarding/${nextId}`);
 }
 };

 const handleBack = () => {
 const prevId = getPrevSlideId(slide);
 if (prevId) {
 router.replace(`/onboarding/${prevId}`);
 }
 };

 const handleGetStarted = async () => {
 await completeOnboarding();
 router.replace("/dashboard");
 };

 const isLast = isLastSlide(slide);
 const isFirst = isFirstSlide(slide);

 const needsSelection = slide === "2" || slide === "3";
 const hasSelection = slide === "2" ? !!data.experience : slide === "3" ? !!data.path : true;
 const canProceed = !needsSelection || hasSelection;

 return (
 <View style={[styles.flex1, { backgroundColor: colors.surface }]}>
 <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
 {!isFirst && (
 <Pressable
 onPress={handleBack}
 style={styles.backButton}
 accessibilityRole="button"
 accessibilityLabel="Go back"
 >
 <MaterialCommunityIcons
 name="arrow-left"
 size={24}
 color={colors.onSurfaceVariant}
 />
 </Pressable>
)}
  <View style={styles.flex1} />
 </View>

 <Animated.View
 style={[styles.flex1, styles.contentPadding, animatedStyle]}
 >
 <ScrollView
 style={styles.flex1}
 contentContainerStyle={{ paddingBottom: 120 }}
 showsVerticalScrollIndicator={false}
 >
 {slide === "1" && (
 <View style={[styles.flex1, styles.justifyCenter, { paddingTop: 32 }]}>
 <Text style={styles.welcomeTitle}>
 {content.title}
 </Text>
 <Text style={styles.welcomeSubtitle}>
 {content.subtitle}
 </Text>
 <View style={[styles.flexRow, styles.flexWrap, { gap: 12, marginTop: 24 }]}>
 {content.tags!.map((tag) => (
 <View
 key={tag}
 style={[styles.flexRow, styles.tagItem]}
 >
 <View style={styles.tagDot} />
 <Text style={styles.tagLabel}>
 {tag}
 </Text>
 </View>
))}
 </View>
 <View style={[styles.codeBlock, { marginTop: 40 }]}>
 <View style={[styles.flexRow, styles.codeBlockHeader]}>
 <Text style={styles.codeBlockLabel}>
 sketch.js
 </Text>
 </View>
 <Text style={styles.codeTextPink}>
 function draw() {"{"}
 </Text>
 <Text style={styles.codeTextWhite}>
 background(25);
 </Text>
 <Text style={styles.codeTextPink2}>
 ellipse(mouseX, mouseY, 50, 50);
 </Text>
 <Text style={styles.codeTextPink}>
 {"}"}
 </Text>
 </View>
 </View>
)}

 {slide === "2" && (
 <View style={[styles.flex1, { paddingTop: 32 }]}>
 <Text style={styles.slideTitle}>
 {content.title}
 </Text>
 <Text style={styles.slideSubtitle}>
 {content.subtitle}
 </Text>
 <View style={{ marginTop: 32, gap: 12 }}>
 {experienceOptions.map((opt) => {
 const selected = data.experience === opt.value;
 return (
 <Pressable
 key={opt.value}
 onPress={() => updateData({ experience: opt.value })}
style={[styles.optionCard, selected ? { backgroundColor: ctaColor } : { backgroundColor: colors.surfaceContainer }]}
 accessibilityRole="button"
 accessibilityLabel={opt.label}
 >
 <Text style={[styles.optionTitle, { color: selected ? colors.onPrimary : colors.onSurface }]}>
 {opt.label}
 </Text>
 <Text style={[styles.optionDesc, { color: selected ? colors.onPrimary : colors.onSurfaceVariant }]}>
 {opt.description}
 </Text>
 </Pressable>
 );
 })}
 </View>
 </View>
)}

 {slide === "3" && (
 <View style={[styles.flex1, { paddingTop: 32 }]}>
 <Text style={styles.slideTitle}>
 {content.title}
 </Text>
 <View style={{ marginTop: 32, gap: 16 }}>
 {pathOptions.map((opt) => {
 const selected = data.path === opt.value;
 return (
 <Pressable
 key={opt.value}
 onPress={() => updateData({ path: opt.value })}
 style={[styles.optionCard, selected ? { backgroundColor: ctaColor } : { backgroundColor: colors.surfaceContainer }]}
 accessibilityRole="button"
 accessibilityLabel={opt.title}
 >
 <Text style={[styles.pathTitle, { color: selected ? colors.onPrimary : colors.onSurface }]}>
 {opt.title}
 </Text>
 <Text style={[styles.pathDesc, { color: selected ? colors.onPrimary : colors.onSurfaceVariant }]}>
 {opt.description}
 </Text>
 </Pressable>
);
 })}
 </View>
 </View>
)}

 {slide === "4" && (
 <View style={[styles.flex1, { paddingTop: 32 }]}>
 <Text style={styles.slideTitle}>
 {content.title}
 </Text>
 <Text style={styles.slideSubtitle}>
 {content.subtitle}
 </Text>
 <TextInput
 style={styles.nameInput}
 placeholder="Enter your name"
 placeholderTextColor={colors.onSurfaceVariant}
 value={data.displayName}
 onChangeText={(text) => updateData({ displayName: text })}
 maxLength={30}
 />
 <Pressable
 onPress={() => handleNext()}
 style={({ pressed }) => ({
 marginTop: 16,
 paddingVertical: 12,
 alignItems: "center",
 opacity: pressed ? 0.6 : 1,
 })}
 accessibilityRole="button"
 accessibilityLabel="Skip entering name"
 >
 <Text style={[styles.slideSubtitle, { color: derivedColors.primary, fontWeight: "700" }]}>
 Skip →
 </Text>
 </Pressable>
 </View>
)}

 {slide === "5" && (
 <View style={[styles.flex1, { paddingTop: 32 }]}>
 <Text style={styles.readyTitle}>
 {content.title}
 </Text>
 <Text style={styles.slideSubtitle}>
 {content.subtitle}
 </Text>
 <View style={{ marginTop: 32, gap: 12 }}>
 {content.modules!.map((mod, i) => (
 <View
 key={mod.name}
 style={styles.moduleCard}
 >
 <View style={[styles.flexRow, { alignItems: "center", gap: 12 }]}>
 <View style={styles.moduleNumber}>
 <Text style={styles.moduleNumberText}>
 {i + 1}
 </Text>
 </View>
 <View style={styles.flex1}>
 <Text style={styles.moduleName}>
 {mod.name}
 </Text>
 <Text style={styles.moduleDesc}>
 {mod.desc}
 </Text>
 </View>
 </View>
 </View>
))}
 </View>
 <Text style={[styles.readyCta, { marginTop: 40 }]}>
 Ready to code?
 </Text>
 </View>
)}
 </ScrollView>
 </Animated.View>

 <View style={[{ paddingBottom: insets.bottom + 16 }, styles.bottomBar]}>
 <View style={[styles.flexRow, { justifyContent: "center", gap: 8, marginBottom: 16 }]}>
 {["1", "2", "3", "4", "5"].map((dot) => (
 <View
 key={dot}
 style={[styles.dot, { backgroundColor: dot === slide ? derivedColors.primary : colors.outlineVariant }]}
 />
))}
 </View>

 {isLast ? (
 <Pressable
 onPress={handleGetStarted}
 style={[styles.ctaButton, { backgroundColor: ctaColor }]}
 accessibilityRole="button"
 accessibilityLabel="Get Started"
 >
 <Text style={styles.ctaButtonText}>
 Start Learning
 </Text>
 </Pressable>
) : (
 <Pressable
 onPress={handleNext}
 disabled={!canProceed}
 style={({ pressed }) => [
 styles.ctaButton,
 { backgroundColor: ctaColor },
 !canProceed && { opacity: 0.4 },
 pressed && canProceed && { opacity: 0.8 },
 ]}
 accessibilityRole="button"
 accessibilityLabel="Next"
 accessibilityState={{ disabled: !canProceed }}
 >
 <Text style={styles.ctaButtonText}>
 Next
 </Text>
 </Pressable>
)}
 </View>
 </View>
);
}


