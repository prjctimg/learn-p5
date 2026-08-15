import { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "../../../components/Button";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { loadCourse } from "../../../utils/courseLoader";
import { Course } from "../../../data/types";
import { useThemeContext } from "../../../components/ThemeProvider";
import { Colors } from "../../../constants/Colors";
import { STORAGE_KEYS } from "../../../constants/StorageKeys";
import { isExerciseLocked } from "../../../utils/isExerciseLocked";

export default function CourseDetail() {
 const { course } = useLocalSearchParams<{ course: string }>();
 const router = useRouter();
 const [courseData, setCourseData] = useState<Course | null>(null);
 const [loading, setLoading] = useState(true);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
 const [error, setError] = useState<string | null>(null);
 const { colorScheme, derivedColors } = useThemeContext();
 const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

 const loadData = useCallback(async () => {
 if (!course) return;
 setError(null);
 try {
 const data = await loadCourse(course);
 setCourseData(data);
 try {
 const val = await AsyncStorage.getItem(STORAGE_KEYS.completedLessons);
  if (val) setCompletedExercises(JSON.parse(val));
 } catch {}
 } catch (e) {
 setError(e instanceof Error ? e.message : "Failed to load course");
 } finally {
 setLoading(false);
 }
 }, [course]);

 useEffect(() => {
 loadData();
 }, [loadData]);

 const nextExerciseIdx = useMemo(() => {
 if (!courseData || !course) return -1;
 return courseData.exercises.findIndex(
  (_, i) => !completedExercises.includes(`${course}/${courseData.exercises[i].id}`)
 );
 }, [courseData, completedExercises, course]);

 const nextExercise = useMemo(() => {
 if (!courseData || nextExerciseIdx < 0) return null;
 return courseData.exercises[nextExerciseIdx];
 }, [courseData, nextExerciseIdx]);

 const upNextExercises = useMemo(() => {
 if (!courseData || nextExerciseIdx < 0) return [];
 return courseData.exercises.slice(nextExerciseIdx + 1);
 }, [courseData, nextExerciseIdx]);

 const completedExerciseItems = useMemo(() => {
 if (!courseData || !course) return [];
 return courseData.exercises.filter(
  (l) => completedExercises.includes(`${course}/${l.id}`)
 );
 }, [courseData, completedExercises, course]);

 const progress = useMemo(() => {
 if (!courseData || courseData.exercises.length === 0) return 0;
  const courseCompleted = completedExercises.filter((id) =>
 id.startsWith(`${course}/`)
 ).length;
 return courseCompleted / courseData.exercises.length;
 }, [courseData, completedExercises, course]);

  function isLocked(index: number) {
    if (!course || !courseData) return true;
    return isExerciseLocked(completedExercises, course, courseData.exercises[index].id, courseData.exercises);
  }

if (loading) {
 return (
 <View style={[styles.container, { backgroundColor: colors.surface }]}>
 <View
 style={[
 styles.header,
 { backgroundColor: colors.surface },
 ]}
 >
 <View style={{ width: 40 }} />
 <Text style={[styles.headerTitle, { color: derivedColors.primary }]}>
 Course
 </Text>
 <View style={{ width: 40 }} />
 </View>
 <View style={styles.centeredContainer}>
 <ActivityIndicator size="large" color={derivedColors.primary} />
 </View>
 </View>
 );
 }

if (error) {
  return (
  <View style={[styles.container, { backgroundColor: colors.surface }]}>
  <View
  style={[
    styles.header,
    { backgroundColor: colors.surface },
  ]}
  >
  <Pressable onPress={() => router.back()} style={styles.backButton}>
 <MaterialCommunityIcons
 name="arrow-left"
 size={24}
 color={derivedColors.primary}
 />
 </Pressable>
 <Text style={[styles.headerTitle, { color: derivedColors.primary }]}>
 Course
 </Text>
 <View style={{ width: 40 }} />
 </View>
 <View style={styles.notFoundContainer}>
 <Text style={[styles.notFoundTitle, { color: colors.onSurface }]}>
 Load Error
 </Text>
 <Text
 style={[styles.notFoundSubtitle, { color: colors.textSecondary }]}
 >
 {error}
 </Text>
 <View style={styles.notFoundButtonWrapper}>
<Pressable
  onPress={() => router.back()}
  style={({ pressed }) => [
 styles.backButton,
 pressed && styles.backButtonPressed,
 ]}
 accessibilityRole="button"
 accessibilityLabel="Back to courses"
 >
 <Text style={styles.backButtonText}>
 Back to courses
 </Text>
 </Pressable>
 </View>
 </View>
 </View>
 );
 }

if (!courseData) {
  return (
  <View style={[styles.container, { backgroundColor: colors.surface }]}>
  <View
  style={[
    styles.header,
    { backgroundColor: colors.surface },
  ]}
  >
  <Pressable onPress={() => router.back()} style={styles.backButton}>
 <MaterialCommunityIcons
 name="arrow-left"
 size={24}
 color={derivedColors.primary}
 />
 </Pressable>
 <Text style={[styles.headerTitle, { color: derivedColors.primary }]}>
 Course
 </Text>
 <View style={{ width: 40 }} />
 </View>
 <View style={styles.notFoundContainer}>
 <Text style={[styles.notFoundTitle, { color: colors.onSurface }]}>
 Course not found
 </Text>
 <Text
 style={[styles.notFoundSubtitle, { color: colors.textSecondary }]}
 >
 The course &ldquo;{course}&rdquo; doesn&apos;t exist yet.
 </Text>
 </View>
 </View>
);
 }

 return (
 <View style={[styles.container, { backgroundColor: colors.surface }]}>
    <View
      style={[
        styles.header,
        { backgroundColor: colors.surface },
      ]}
      >
<Pressable onPress={() => router.back()} style={styles.backButton}>
        <MaterialCommunityIcons
          name="arrow-left"
          size={24}
          color={derivedColors.primary}
        />
        </Pressable>
      <View style={{ flex: 1 }} />
      </View>

      <Breadcrumbs
        segments={[
          { label: "Learn", href: "/learn" },
          { label: courseData.title },
        ]}
      />

      <ScrollView
 style={styles.scrollView}
 contentContainerStyle={styles.scrollContent}
 >
 {nextExercise && (
 <View
 style={[
 styles.heroSection,
 { backgroundColor: colors.surfaceContainerLow },
 ]}
 >
  <Text style={[styles.heroLabel, { color: derivedColors.primary }]}>
  Next exercise
  </Text>
 <Text style={[styles.heroTitle, { color: colors.onSurface }]}>
 {nextExercise.title}
 </Text>
 <View style={styles.heroDescriptionRow}>
 <View
 style={[
 styles.heroAccent,
 { backgroundColor: derivedColors.primary },
 ]}
 />
 <Text
 style={[
 styles.heroDescription,
 { color: colors.textSecondary },
 ]}
 >
 {nextExercise.description}
 </Text>
 </View>
 <Button
 title="START"
 variant="primary"
 onPress={() =>
 router.push(`/learn/${course}/${nextExercise.id}`)
 }
 />
 <View
 style={[
 styles.progressTrack,
 { backgroundColor: colors.surfaceContainerHigh },
 ]}
 >
 <View
 style={{
 flex: progress,
 backgroundColor: derivedColors.primary,
 }}
 />
 <View style={{ flex: 1 - progress }} />
 </View>
 </View>
)}

 {upNextExercises.length > 0 && (
 <View style={styles.section}>
 <View style={styles.sectionHeader}>
 <Text style={[styles.sectionTitle, { color: derivedColors.primary }]}>
 Up Next
 </Text>
 <Text
 style={[
 styles.sectionSubtitle,
 { color: colors.textSecondary },
 ]}
 >
 {courseData.moduleName}
 </Text>
 </View>
 <View style={styles.exerciseList}>
  {upNextExercises.map((exercise, index) => {
 const globalIdx = nextExerciseIdx + 1 + index;
 const locked = isLocked(globalIdx);
 const isLast = index === upNextExercises.length - 1;
 return (
 <Pressable
 key={exercise.id}
 disabled={locked}
 onPress={() =>
 router.push(`/learn/${course}/${exercise.id}`)
 }
 style={({ pressed }) => [
  styles.exerciseRow,
  isLast && styles.exerciseRowLast,
  { borderColor: locked ? "transparent" : colors.outlineVariant },
  pressed &&
  !locked && {
  backgroundColor: colors.surfaceContainerHigh,
  },
  ]}
  >
  <View
  style={[
  styles.exerciseIcon,
  { borderColor: locked ? "transparent" : colors.outlineVariant },
  ]}
 >
 {locked || isLast ? (
 <MaterialCommunityIcons
 name={isLast ? "trophy" : "lock"}
 size={20}
 color={isLast ? derivedColors.primary : colors.textSecondary}
 />
) : (
 <MaterialCommunityIcons
 name="play-circle-outline"
 size={20}
 color={derivedColors.primary}
 />
)}
 </View>
 <View style={styles.exerciseInfo}>
 <Text
 style={[
 styles.exerciseTitle,
 {
 color: locked
 ? colors.textSecondary
 : colors.onSurface,
 },
 ]}
 >
 {exercise.title}
 </Text>
 <Text
 style={[
 styles.exerciseModule,
 { color: colors.textSecondary },
 ]}
 >
 {isLast
 ? `Earn ${courseData.moduleName} Badge`
  : exercise.module}
 </Text>
 </View>
 <MaterialCommunityIcons
 name="chevron-right"
 size={20}
 color={colors.textSecondary}
 />
 </Pressable>
);
 })}
 </View>
 </View>
)}

 {completedExerciseItems.length > 0 && (
 <View
 style={[
 styles.completedSection,
 {
 borderTopColor: colors.onSurface + "1A",
 },
 ]}
 >
  <Text style={[styles.completedLabel, { color: colors.onSurface }]}>
  Completed
  </Text>
  {completedExerciseItems.map((exercise) => (
 <Pressable
 key={exercise.id}
 onPress={() => router.push(`/learn/${course}/${exercise.id}`)}
 style={({ pressed }) => [
 styles.completedRow,
 pressed && { backgroundColor: colors.surfaceContainerHigh },
 ]}
 >
 <MaterialCommunityIcons
 name="check-circle"
 size={18}
 color={derivedColors.primary}
 />
 <Text
 style={[
 styles.completedTitle,
 { color: colors.onSurface },
 ]}
 >
 {exercise.title}
 </Text>
 <MaterialCommunityIcons
 name="chevron-right"
 size={16}
 color={colors.textSecondary}
 />
 </Pressable>
 ))}
 </View>
)}
 </ScrollView>
 </View>
);
}

const styles = StyleSheet.create({
 container: {
 flex: 1,
 },
 centeredContainer: {
 flex: 1,
 alignItems: "center",
 justifyContent: "center",
 },
 notFoundContainer: {
 flex: 1,
 alignItems: "center",
 justifyContent: "center",
 paddingHorizontal: 24,
 },
  notFoundTitle: {
 fontFamily: "JetBrainsMono",
 fontSize: 20,
 fontWeight: "700",
 },
 notFoundSubtitle: {
 fontFamily: "JetBrainsMono",
 fontSize: 16,
 marginTop: 8,
 textAlign: "center",
 },
 notFoundButtonWrapper: {
 marginTop: 24,
 },
 header: {
 flexDirection: "row",
 alignItems: "center",
 justifyContent: "space-between",
 paddingHorizontal: 16,
 height: 64,

 },
 backButton: {
 width: 40,
 height: 40,
 alignItems: "center",
 justifyContent: "center",
 },
 backButtonPressed: {
 opacity: 0.5,
 },
  backButtonText: {
  fontFamily: "JetBrainsMono",
  fontSize: 14,
  },
   headerTitle: {
   fontFamily: "JetBrainsMono",
   fontSize: 24,
   fontWeight: "900",
   fontStyle: "italic",
   },
  scrollView: {
 flex: 1,
 },
 scrollContent: {
 paddingBottom: 32,
 },
 heroSection: {
 paddingHorizontal: 24,
 paddingVertical: 32,
 gap: 16,
 },
 heroLabel: {
 fontFamily: "JetBrainsMono",
 fontSize: 14,
 fontWeight: "700",
 letterSpacing: 1,
 },
 heroTitle: {
 fontFamily: "JetBrainsMono",
 fontSize: 28,
 fontWeight: "700",
 letterSpacing: -0.3,
 lineHeight: 34,
 },
 heroDescriptionRow: {
 flexDirection: "row",
 gap: 16,
 alignItems: "flex-start",
 },
 heroAccent: {
 width: 2,
 alignSelf: "stretch",
 },
 heroDescription: {
 fontFamily: "JetBrainsMono",
 fontSize: 16,
 fontWeight: "400",
 lineHeight: 24,
 flex: 1,
 },
 progressTrack: {
 height: 4,
 flexDirection: "row",
 borderRadius: 2,
 overflow: "hidden",
 },
 section: {
 paddingHorizontal: 24,
 paddingTop: 32,
 },
sectionHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-end",
  marginBottom: 24,
  flexWrap: "wrap",
  gap: 8,
},
sectionTitle: {
  fontFamily: "JetBrainsMono",
  fontSize: 24,
  fontWeight: "700",
  fontStyle: "italic",
  flexShrink: 1,
},
sectionSubtitle: {
  fontFamily: "JetBrainsMono",
  fontSize: 13,
  fontWeight: "400",
  flexShrink: 1,
},
 exerciseList: {
 gap: 4,
 },
 exerciseRow: {
 flexDirection: "row",
 alignItems: "center",
 gap: 16,
 padding: 16,
 borderWidth: 1,
 },
 exerciseRowLast: {
 marginTop: 16,
 borderStyle: "dashed",
 borderWidth: 2,
 opacity: 0.6,
 },
 exerciseIcon: {
 width: 48,
 height: 48,
 alignItems: "center",
 justifyContent: "center",
 borderWidth: 1,
 },
 exerciseInfo: {
 flex: 1,
 },
 exerciseTitle: {
 fontFamily: "JetBrainsMono",
 fontSize: 18,
 fontWeight: "700",
 },
 exerciseModule: {
 fontFamily: "JetBrainsMono",
 fontSize: 11,
 fontWeight: "700",
 marginTop: 4,
 },
 completedSection: {
 paddingHorizontal: 24,
 paddingTop: 48,
 marginTop: 32,
 borderTopWidth: 1,
 opacity: 0.3,
 },
 completedLabel: {
 fontFamily: "JetBrainsMono",
 fontSize: 11,
 fontWeight: "700",
 letterSpacing: 2,
 marginBottom: 16,
 },
 completedRow: {
 flexDirection: "row",
 alignItems: "center",
 gap: 12,
 paddingVertical: 8,
 },
 completedTitle: {
 fontFamily: "JetBrainsMono",
 fontSize: 16,
 fontWeight: "400",
 },
});
