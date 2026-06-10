import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDrawerContext } from "../contexts/DrawerContext";
import { useThemeColor } from "../hooks/useThemeColor";
import { fontFamily, fontSize, fontWeight } from "../styles/typography";
import { spacing, borderRadius } from "../styles/spacing";

interface ExerciseAppBarProps {
  title: string;
}

export default function ExerciseAppBar({ title }: ExerciseAppBarProps) {
  const insets = useSafeAreaInsets();
  const { openDrawer } = useDrawerContext();
  const surface = useThemeColor("surface");
  const onSurface = useThemeColor("onSurface");
  const surfaceDim = useThemeColor("surfaceDim");

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 4, backgroundColor: surface },
      ]}
    >
      <View style={styles.inner}>
        <Pressable
          onPress={openDrawer}
          style={[styles.menuButton, { backgroundColor: surfaceDim }]}
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
        >
          <Text style={[styles.menuIcon, { color: onSurface }]}>☰</Text>
        </Pressable>
        <Text
          style={[styles.title, { color: onSurface }]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  menuButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.full,
  },
  menuIcon: {
    fontSize: fontSize.xl,
  },
  title: {
    fontFamily: fontFamily.headline,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    flex: 1,
  },
});
