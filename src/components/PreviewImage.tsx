import { View, Text, Image, StyleSheet } from "react-native";
import { useThemeColor } from "../hooks/useThemeColor";
import { fontFamily, fontSize, fontWeight } from "../styles/typography";
import { spacing, borderRadius } from "../styles/spacing";

interface PreviewImageProps {
  imageUrl?: string;
}

export default function PreviewImage({ imageUrl }: PreviewImageProps) {
  const outlineVariant = useThemeColor("outlineVariant");
  const onSurfaceVariant = useThemeColor("onSurfaceVariant");

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: onSurfaceVariant }]}>
        Preview
      </Text>
      <View
        style={[styles.frame, { borderColor: outlineVariant }]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: onSurfaceVariant }]}>
              No preview available
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing[4],
  },
  label: {
    fontFamily: fontFamily.label,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing[2],
  },
  frame: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    aspectRatio: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing[4],
  },
  emptyText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
  },
});
