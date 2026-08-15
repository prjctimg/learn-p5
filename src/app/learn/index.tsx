import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import ChallengeCard from "../../components/ChallengeCard";
import { loadAllCourses } from "../../utils/courseLoader";
import { Course } from "../../data/types";
import { useThemeContext } from "../../components/ThemeProvider";
import { Colors } from "../../constants/Colors";

export default function Learn() {
 const router = useRouter();
 const [courses, setCourses] = useState<Course[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const { colorScheme } = useThemeContext();
 const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

 useEffect(() => {
 loadAllCourses()
 .then(setCourses)
 .catch((e) => setError(e.message))
 .finally(() => setLoading(false));
 }, []);

 return (
 <View style={[styles.container, { backgroundColor: colors.surface }]}>
 <Header title="p5.js Learn" />
 <FlatList
 style={styles.flatList}
 contentContainerStyle={{ paddingBottom: 32 }}
 ListHeaderComponent={
 <>
 <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
 Choose a course to begin your creative coding journey.
 </Text>
 <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
 Available Courses
 </Text>
 </>
 }
 data={loading ? [] : courses}
 keyExtractor={(item) => item.slug}
 renderItem={({ item }) => (
 <View style={styles.cardWrapper}>
 <ChallengeCard
 title={item.title}
 moduleName={item.moduleName}
 description={`${item.lessons.length} lesson${item.lessons.length > 1 ? "s" : ""} · ${item.description}`}
 onContinue={() => router.push(`/learn/${item.slug}`)}
 />
 </View>
)}
 ListEmptyComponent={
 loading ? (
 <View style={styles.emptyContainer}>
 <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
 Loading...
 </Text>
 </View>
) : error ? (
 <View style={[styles.errorContainer, { backgroundColor: colors.error + "1A" }]}>
 <Text style={[styles.errorText, { color: colors.error }]}>
 Couldn&apos;t load courses: {error}
 </Text>
 </View>
) : null
 }
 />
 </View>
);
}

const styles = StyleSheet.create({
 container: {
 flex: 1,
 },
 flatList: {
 flex: 1,
 paddingHorizontal: 16,
 paddingTop: 24,
 },
 subtitle: {
 fontSize: 16,
 marginTop: 8,
 },
 sectionTitle: {
 fontSize: 24,
 fontWeight: "700",
 marginTop: 32,
 marginBottom: 16,
 },
 cardWrapper: {
 marginBottom: 16,
 },
 emptyContainer: {
 alignItems: "center",
 paddingVertical: 48,
 },
 emptyText: {
 fontSize: 16,
 },
 errorContainer: {
 borderRadius: 12,
 paddingHorizontal: 16,
 paddingVertical: 24,
 alignItems: "center",
 },
 errorText: {
 fontSize: 16,
 textAlign: "center",
 },
});
