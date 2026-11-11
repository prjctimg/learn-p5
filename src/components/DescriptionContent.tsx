import { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { Colors, type ColorScheme } from "../constants/Colors";
import type { RuntimeAssetsState } from "../hooks/useRuntimeAssets";
import { parseDescription, parseDescriptionBlocks } from "../utils/referenceRender";
import ExamplePreview from "./ExamplePreview";

interface DescriptionContentProps {
  text: string;
  onSymbolPress: (name: string) => void;
  colorScheme: ColorScheme;
  assets: RuntimeAssetsState;
  accentColor?: string;
  textStyle?: StyleProp<TextStyle>;
  codeFontSize?: number;
  codeLineHeight?: number;
  previewHeight?: number;
  previewStyle?: StyleProp<ViewStyle>;
  codeBlockStyle?: StyleProp<ViewStyle>;
  /** Keep example fences as plain highlighted code (for property docs). */
  norender?: boolean;
}

/**
 * Reference descriptions can mix prose with fenced code. Fences tagged
 * `example` mount a live preview; all other fences only show highlighted code.
 */
export default function DescriptionContent({
  text,
  onSymbolPress,
  colorScheme,
  assets,
  accentColor,
  textStyle,
  codeFontSize = 13,
  codeLineHeight = 20,
  previewHeight = 220,
  previewStyle,
  codeBlockStyle,
  norender = false,
}: DescriptionContentProps) {
  const colors = Colors[colorScheme];
  const blocks = useMemo(() => parseDescriptionBlocks(text), [text]);
  let exampleIndex = 0;

  if (blocks.length === 0) return null;

  return (
    <View style={styles.container}>
      {blocks.map((block, index) => {
        if (block.type === "text") {
          return (
            <Text
              key={`text-${index}`}
              style={[styles.text, { color: colors.textSecondary }, textStyle]}
            >
              {parseDescription(block.text, onSymbolPress, colors, accentColor)}
            </Text>
          );
        }

        const shouldRender = block.example && !norender;
        const delayMs = shouldRender ? exampleIndex++ * 200 : 0;
        return (
          <ExamplePreview
            key={`code-${index}`}
            code={block.code}
            previewCode={block.code}
            colorScheme={colorScheme}
            assets={assets}
            norender={!shouldRender}
            previewHeight={previewHeight}
            delayMs={delayMs}
            codeFontSize={codeFontSize}
            codeLineHeight={codeLineHeight}
            previewStyle={previewStyle}
            codeBlockStyle={codeBlockStyle}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  text: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
    lineHeight: 24,
  },
});
