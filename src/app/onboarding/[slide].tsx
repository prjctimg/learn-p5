import { View, Text, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import {
  experienceOptions,
  pathOptions,
  isLastSlide,
  isFirstSlide,
  getNextSlideId,
  getPrevSlideId,
} from "../../data/onboardingSlides";
import { useOnboarding } from "../../hooks/useOnboarding";

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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slide, fadeAnim, slideAnim]);

  if (!slide || !(slide in slideContent)) {
    return (
      <View className="flex-1 bg-surface dark:bg-surface-dark items-center justify-center">
        <Text className="font-headline text-xl text-on-surface dark:text-on-surface-dark">
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

  return (
    <View className="flex-1 bg-[#2a0516]">
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="flex-row items-center px-4 pb-3"
      >
        {!isFirst && (
          <Pressable
            onPress={handleBack}
            className="w-10 h-10 items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#ffb2bb"
            />
          </Pressable>
        )}
        <View className="flex-1" />
        <Text className="font-headline text-xl font-bold uppercase tracking-tighter text-[#ffb2bb]">
          LEARN P5.JS
        </Text>
        <View className="flex-1" />
      </View>

      <Animated.View
        className="flex-1 px-6"
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {slide === "1" && (
            <View className="flex-1 justify-center pt-8">
              <Text className="font-headline text-4xl md:text-5xl font-bold leading-tight tracking-tight text-[#ffd9e4]">
                {content.title}
              </Text>
              <Text className="font-body text-base text-[#e4bdc0] mt-4 leading-relaxed">
                {content.subtitle}
              </Text>
              <View className="flex-row flex-wrap gap-3 mt-6">
                {content.tags!.map((tag) => (
                  <View
                    key={tag}
                    className="flex-row items-center px-4 py-2 border-2 border-white rounded-full bg-[#340d1f]"
                  >
                    <View className="w-3 h-3 rounded-full bg-[#ff4f75] mr-2" />
                    <Text className="font-label text-xs uppercase tracking-wider text-[#ffd9e4]">
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
              <View className="mt-10 border-2 border-white bg-black rounded-lg p-4">
                <View className="flex-row justify-between items-center mb-2 border-b-2 border-white pb-2">
                  <Text className="text-[#ffb2bb] font-bold text-[10px] uppercase">
                    sketch.js
                  </Text>
                </View>
                <Text className="font-mono text-xs text-[#ffb2bb]">
                  function draw() {"{"}
                </Text>
                <Text className="font-mono text-xs text-white pl-4">
                  background(25);
                </Text>
                <Text className="font-mono text-xs text-[#ffb1c2] pl-4">
                  ellipse(mouseX, mouseY, 50, 50);
                </Text>
                <Text className="font-mono text-xs text-[#ffb2bb]">
                  {"}"}
                </Text>
              </View>
            </View>
          )}

          {slide === "2" && (
            <View className="flex-1 pt-8">
              <Text className="font-headline text-2xl font-bold text-[#ffd9e4]">
                {content.title}
              </Text>
              <Text className="font-body text-sm text-[#e4bdc0] mt-2">
                {content.subtitle}
              </Text>
              <View className="mt-8 gap-3">
                {experienceOptions.map((opt) => {
                  const selected = data.experience === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => updateData({ experience: opt.value })}
                      className={`p-4 border-2 rounded-lg ${
                        selected
                          ? "bg-[#ff4f75] border-white"
                          : "bg-[#340d1f] border-white/50"
                      }`}
                      accessibilityRole="button"
                      accessibilityLabel={opt.label}
                    >
                      <Text
                        className={`font-headline text-lg font-bold ${
                          selected ? "text-black" : "text-[#ffd9e4]"
                        }`}
                      >
                        {opt.label}
                      </Text>
                      <Text
                        className={`font-body text-sm mt-1 ${
                          selected ? "text-black/70" : "text-[#e4bdc0]"
                        }`}
                      >
                        {opt.description}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {slide === "3" && (
            <View className="flex-1 pt-8">
              <Text className="font-headline text-2xl font-bold text-[#ffd9e4]">
                {content.title}
              </Text>
              <View className="mt-8 gap-4">
                {pathOptions.map((opt) => {
                  const selected = data.path === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => updateData({ path: opt.value })}
                      className={`p-4 border-2 rounded-lg ${
                        selected
                          ? "bg-[#ff4f75] border-white"
                          : "bg-[#340d1f] border-white/50"
                      }`}
                      accessibilityRole="button"
                      accessibilityLabel={opt.title}
                    >
                      <Text
                        className={`font-headline text-base font-bold ${
                          selected ? "text-black" : "text-[#ffd9e4]"
                        }`}
                      >
                        {opt.title}
                      </Text>
                      <Text
                        className={`font-body text-xs mt-1 ${
                          selected ? "text-black/70" : "text-[#e4bdc0]"
                        }`}
                      >
                        {opt.description}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {slide === "4" && (
            <View className="flex-1 pt-8">
              <Text className="font-headline text-3xl font-bold text-[#ffd9e4]">
                {content.title}
              </Text>
              <Text className="font-body text-sm text-[#e4bdc0] mt-2">
                {content.subtitle}
              </Text>
              <View className="mt-8 gap-3">
                {content.modules!.map((mod, i) => (
                  <View
                    key={mod.name}
                    className="p-4 border-2 border-white bg-[#340d1f] rounded-lg"
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-8 h-8 rounded-full bg-[#ff4f75] items-center justify-center">
                        <Text className="font-headline font-bold text-black">
                          {i + 1}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-headline text-base font-bold text-[#ffd9e4]">
                          {mod.name}
                        </Text>
                        <Text className="font-body text-xs text-[#e4bdc0] mt-0.5">
                          {mod.desc}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
              <Text className="font-headline text-xl font-bold text-center text-[#ffb2bb] mt-10">
                Ready to code?
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      <View
        style={{ paddingBottom: insets.bottom + 16 }}
        className="absolute bottom-0 left-0 right-0 px-6 pt-6 bg-gradient-to-t from-[#2a0516] via-[#2a0516]/90 to-transparent"
      >
        <View className="flex-row justify-center gap-2 mb-4">
          {["1", "2", "3", "4"].map((dot) => (
            <View
              key={dot}
              className={`w-2 h-2 rounded-full ${
                dot === slide ? "bg-[#ED225D]" : "bg-white/30"
              }`}
            />
          ))}
        </View>

        {isLast ? (
          <Pressable
            onPress={handleGetStarted}
            className="w-full py-4 bg-[#ED225D] border-2 border-white rounded-lg items-center"
            accessibilityRole="button"
            accessibilityLabel="Get Started"
          >
            <Text className="font-headline font-bold text-lg uppercase tracking-widest text-black">
              Start Learning
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleNext}
            className="w-full py-4 bg-[#ED225D] border-2 border-white rounded-lg items-center"
            accessibilityRole="button"
            accessibilityLabel="Next"
          >
            <Text className="font-headline font-bold text-lg uppercase tracking-widest text-black">
              Next
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
