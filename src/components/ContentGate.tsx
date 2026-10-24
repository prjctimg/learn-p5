import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";
import { Typography } from "../constants/Typography";

interface ContentGateProps {
  status: "loading" | "error";
  progress?: number;
  error?: string;
  onRetry?: () => void;
}

export default function ContentGate({
  status,
  progress = 0,
  error,
  onRetry,
}: ContentGateProps) {
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View
        style={[
          styles.logo,
          { backgroundColor: derivedColors.primary + "20" },
        ]}
      >
        <MaterialCommunityIcons
          name={status === "error" ? "cloud-off-outline" : "book-open-page-variant-outline"}
          size={36}
          color={derivedColors.primary}
        />
      </View>

      <Text style={[styles.title, { color: colors.onSurface }]}>
        {status === "error" ? "Content unavailable" : "Loading course content"}
      </Text>

      <Text style={[styles.body, { color: colors.textSecondary }]}>
        {status === "error"
          ? error
          : "Courses, reference material and the p5.js runtime are downloaded once, then kept offline."}
      </Text>

      {status === "loading" ? (
        <>
          <ActivityIndicator
            color={derivedColors.primary}
            size="large"
            style={styles.spinner}
          />
          {percent > 0 && (
            <>
              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: colors.surfaceContainerHigh },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: derivedColors.primary,
                      width: `${percent}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {percent}%
              </Text>
            </>
          )}
        </>
      ) : (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry content download"
          style={({ pressed }) => [
            styles.retryButton,
            {
              backgroundColor: pressed
                ? derivedColors.primaryContainer
                : derivedColors.primary,
            },
          ]}
        >
          <Text style={[styles.retryText, { color: colors.onPrimary }]}>
            Try again
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontFamily: "JetBrainsMono",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  body: {
    ...Typography.body,
    fontFamily: "JetBrainsMono",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
  },
  spinner: {
    marginTop: 28,
  },
  progressTrack: {
    width: "80%",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 24,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontFamily: "JetBrainsMono",
    fontSize: 12,
    marginTop: 8,
  },
  retryButton: {
    marginTop: 28,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    fontFamily: "JetBrainsMono",
    fontSize: 14,
    fontWeight: "700",
  },
});
