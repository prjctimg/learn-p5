import { useMemo } from "react";
import { View, Text, Pressable, Linking, StyleSheet, ScrollView } from "react-native";
import { WebView } from "react-native-webview";
import { Svg, Path } from "react-native-svg";
import { Colors } from "../../constants/Colors";
import { Spacing } from "../../constants/Spacing";
import { Typography } from "../../constants/Typography";
import Header from "../../components/Header";
import { useThemeContext } from "../../components/ThemeProvider";
import { APP_VERSION } from "../../constants/Version";
import { p5Source } from "../../utils/p5Source";
import { GENERATED_REFERENCE } from "../../data/reference";

const p5LogoPaths = [
 "M16.254,27.631v7.998h0.359c0.715-1.113,1.65-2.248,2.805-3.402c1.153-1.154,2.567-2.188,4.239-3.105c1.671-0.912,3.561-1.67,5.671-2.268c2.107-0.596,4.477-0.896,7.103-0.896c4.06,0,7.8,0.777,11.223,2.328c3.422,1.555,6.368,3.684,8.836,6.389c2.466,2.707,4.376,5.891,5.73,9.551c1.353,3.662,2.03,7.602,2.03,11.82s-0.657,8.178-1.971,11.879c-1.312,3.701-3.185,6.924-5.611,9.67c-2.429,2.746-5.372,4.938-8.835,6.566c-3.463,1.631-7.384,2.447-11.76,2.447c-4.06,0-7.781-0.836-11.163-2.506c-3.385-1.672-5.99-3.939-7.82-6.807h-0.238v36.295H2.525V27.631H16.254z M49.684,56.045c0-2.229-0.339-4.438-1.015-6.627c-0.678-2.188-1.692-4.158-3.045-5.91c-1.354-1.748-3.064-3.162-5.134-4.238c-2.07-1.074-4.497-1.611-7.282-1.611c-2.627,0-4.976,0.557-7.044,1.672c-2.07,1.115-3.842,2.549-5.313,4.297c-1.474,1.752-2.587,3.742-3.343,5.971c-0.758,2.229-1.134,4.459-1.134,6.686c0,2.229,0.376,4.438,1.134,6.625c0.756,2.191,1.869,4.16,3.343,5.912c1.472,1.75,3.243,3.164,5.313,4.236c2.068,1.076,4.417,1.611,7.044,1.611c2.785,0,5.212-0.555,7.282-1.67c2.069-1.115,3.78-2.547,5.134-4.299c1.353-1.75,2.367-3.74,3.045-5.969C49.345,60.502,49.684,58.273,49.684,56.045z",
 "M189.333,24.893v63.506c0,3.422-0.279,6.666-0.836,9.73c-0.559,3.064-1.611,5.73-3.164,8c-1.551,2.27-3.662,4.078-6.328,5.432c-2.668,1.354-6.148,2.029-10.447,2.029c-1.193,0-2.387-0.08-3.582-0.238c-1.193-0.16-2.148-0.32-2.865-0.479l1.195-12.178c0.637,0.16,1.312,0.279,2.029,0.359c0.717,0.078,1.352,0.119,1.91,0.119c1.67,0,3.023-0.318,4.059-0.955c1.033-0.639,1.83-1.514,2.389-2.627c0.555-1.115,0.914-2.408,1.074-3.881c0.158-1.473,0.238-3.043,0.238-4.715V24.893H189.333z",
 "M238.163,42.912c-1.275-1.672-3.025-3.123-5.254-4.357s-4.656-1.852-7.283-1.852c-2.309,0-4.416,0.479-6.326,1.434c-1.912,0.953-2.865,2.547-2.865,4.775s1.053,3.803,3.162,4.715c2.109,0.916,5.195,1.852,9.254,2.807c2.148,0.479,4.316,1.115,6.506,1.91s4.18,1.85,5.971,3.164c1.789,1.312,3.242,2.945,4.357,4.895c1.113,1.951,1.672,4.318,1.672,7.104c0,3.504-0.658,6.469-1.971,8.895c-1.312,2.428-3.064,4.398-5.254,5.91s-4.736,2.607-7.641,3.283c-2.906,0.676-5.908,1.014-9.014,1.014c-4.459,0-8.795-0.816-13.014-2.447c-4.219-1.629-7.721-3.959-10.506-6.982l9.432-8.836c1.592,2.07,3.66,3.781,6.209,5.133c2.547,1.354,5.371,2.029,8.477,2.029c1.033,0,2.088-0.117,3.164-0.357c1.074-0.238,2.068-0.615,2.984-1.133c0.914-0.518,1.65-1.213,2.209-2.09c0.555-0.877,0.834-1.949,0.834-3.225c0-2.389-1.094-4.098-3.281-5.133c-2.191-1.035-5.475-2.07-9.85-3.104c-2.15-0.479-4.24-1.094-6.27-1.852c-2.029-0.756-3.84-1.75-5.432-2.984c-1.594-1.234-2.865-2.764-3.82-4.598c-0.955-1.83-1.434-4.098-1.434-6.805c0-3.184,0.656-5.928,1.971-8.236c1.312-2.311,3.045-4.197,5.193-5.674c2.148-1.471,4.576-2.566,7.283-3.281c2.705-0.717,5.492-1.076,8.357-1.076c4.137,0,8.178,0.717,12.117,2.148c3.939,1.434,7.062,3.625,9.373,6.568L238.163,42.912z",
 "M153.559,72.816l8.533-2.576l1.676,5.156l-8.498,2.898l5.275,7.48L156.098,89l-5.553-7.348l-5.408,7.154l-4.319-3.289l5.275-7.223l-8.563-3.09l1.677-5.16l8.599,2.771v-8.895h5.754V72.816z",
 "M124.086,45.836c-1.473-3.301-3.521-6.088-6.148-8.357c-2.626-2.268-5.711-4-9.252-5.193c-3.543-1.193-7.384-1.791-11.521-1.791c-1.513,0-3.204,0.082-5.074,0.238c-1.871,0.162-3.482,0.439-4.835,0.838l0.835-18.268h34.504V0.41H74.481l-1.433,46.201c1.271-0.635,2.725-1.232,4.357-1.791c1.631-0.555,3.302-1.053,5.014-1.49c1.711-0.438,3.463-0.775,5.254-1.016c1.791-0.238,3.481-0.357,5.074-0.357c2.307,0,4.576,0.258,6.805,0.775c2.228,0.518,4.238,1.434,6.029,2.746s3.242,3.045,4.358,5.193c1.113,2.148,1.671,4.855,1.671,8.119c0,2.547-0.418,4.836-1.254,6.865c-0.835,2.027-1.97,3.721-3.401,5.072c-1.434,1.355-3.104,2.389-5.016,3.104c-1.91,0.719-3.939,1.076-6.089,1.076c-3.819,0-7.124-1.016-9.909-3.045c-2.787-2.029-4.775-4.715-5.97-8.059l-0.159,0.059l-10.368,9.715c2.097,3.42,4.8,6.281,8.14,8.553c4.854,3.301,10.823,4.955,17.909,4.955c4.218,0,8.197-0.678,11.938-2.029c3.74-1.352,7.004-3.303,9.79-5.852c2.785-2.545,4.994-5.67,6.627-9.371c1.63-3.701,2.446-7.898,2.446-12.596C126.295,52.939,125.559,49.141,124.086,45.836z",
];

import { PROCESSING_COLORS } from "../../constants/ProcessingColors";

let _randomColor: readonly number[] | null = null;

function getRandomBrandColor(): readonly number[] {
 if (!_randomColor) {
 _randomColor = PROCESSING_COLORS[Math.floor(Math.random() * PROCESSING_COLORS.length)];
 }
 return _randomColor;
}

function buildProcessingHtml(isDark: boolean, brandColor: readonly number[]): string {
 return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden;background:transparent;display:flex;align-items:center;justify-content:center}canvas{display:block}</style></head><body><script>' + p5Source.replace(/<\/script>/gi, '<\\/script>') + '<\/script><script>new p5(function(p){p.setup=function(){p.createCanvas(250,250)};var t=0;p.draw=function(){p.clear();var u=p.width/8;p.strokeCap(p.SQUARE);p.strokeWeight(1.5*u);p.stroke(' + brandColor.join(",") + ');var off=p.sin(t)*u*0.3;p.bezier(4*u,1*u,7*u+off,1*u+off,7*u,5*u,4*u,5*u);p.stroke(' + brandColor.map(function (c) { return Math.max(0, c - 50) }).join(",") + ');p.line(1*u,6*u,4*u,2*u);p.stroke(' + brandColor.map(function (c) { return Math.min(255, c + 80) }).join(",") + ');p.line(1*u,3*u,2*u,5*u);t+=0.03}})<\/script></body></html>';
}

export default function About() {
 const { colorScheme, derivedColors } = useThemeContext();
 const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
 const isDark = colorScheme === "dark";
 const brandColor = getRandomBrandColor();

 const sketchHtml = useMemo(() => buildProcessingHtml(isDark, brandColor), [isDark, brandColor]);

 return (
 <View style={[styles.container, { backgroundColor: colors.surface }]}>
 <Header title="About" />
 <ScrollView
 style={styles.scroll}
 contentContainerStyle={styles.scrollContent}
 showsVerticalScrollIndicator={false}
 >
 <View style={[styles.sectionCard, { backgroundColor: colors.surfaceDim }]}>
 <Text style={[styles.sectionHeading, { color: colors.onSurface }]}>
 What is p5.js?
 </Text>
 <Svg width={100} height={46} viewBox="0 0 250 114" style={styles.logo}>
 {p5LogoPaths.map((d, i) => (
 <Path key={`about-p5-path-${i}`} d={d} fill={derivedColors.primary} />
))}
 </Svg>
 <Text style={[styles.definitionText, { color: colors.textSecondary }]}>
 p5.js is a JavaScript library for creative coding, with a focus on making coding
 accessible and inclusive for artists, designers, educators, beginners, and anyone else!
 p5.js is free and open-source because we believe software, and the tools to learn it,
 should be accessible to everyone.
 </Text>
 <Pressable
 onPress={() => Linking.openURL("https://p5js.org")}
 accessibilityRole="link"
 accessibilityLabel="Visit p5js.org"
 >
 <Text style={[styles.link, { color: derivedColors.primary }]}>
 Visit p5js.org →
 </Text>
 </Pressable>
 </View>

 <View style={[styles.sectionCard, { backgroundColor: colors.surfaceDim }]}>
 <Text style={[styles.sectionHeading, { color: colors.onSurface }]}>
 What is Processing?
 </Text>

 <WebView
 source={{ html: sketchHtml }}
 style={styles.sketchBox}
 javaScriptEnabled
 scrollEnabled={false}
 bounces={false}
 pointerEvents="none"
 />


 <Text style={[styles.definitionText, { color: colors.textSecondary }]}>
 Processing is a flexible software sketchbook and a language for learning how to code
 within the context of the visual arts. Since 2001, Processing has promoted software
 literacy within the visual arts and visual literacy within technology. There are tens
 of thousands of students, artists, designers, researchers, and hobbyists who use
 Processing for learning and prototyping.
 </Text>
 <Pressable
 onPress={() => Linking.openURL("https://processing.org")}
 accessibilityRole="link"
 accessibilityLabel="Visit processing.org"
 >
 <Text style={[styles.link, { color: derivedColors.primary }]}>
 Visit processing.org →
 </Text>
 </Pressable>
 </View>

 <View style={[styles.versionBadge, { backgroundColor: colors.surfaceDim }]}>
  <Text style={[styles.versionText, { color: colors.textSecondary }]}>
    {APP_VERSION} • p5.js v{GENERATED_REFERENCE.metadata.p5Version}
  </Text>
 </View>


 </ScrollView>
 </View>
);
}

const styles = StyleSheet.create({
 container: {
 flex: 1,
 },
 scroll: {
 flex: 1,
 },
 scrollContent: {
 alignItems: "center",
 paddingHorizontal: Spacing.lg,
 paddingTop: Spacing.xl,
 paddingBottom: 48,
 },
 sectionCard: {
 width: "100%",
 borderRadius: 12,
 padding: Spacing.lg,
 alignItems: "flex-start",
 marginBottom: Spacing.lg,
 },
  sectionHeading: {
    fontFamily: "JetBrainsMono",
    fontSize: 20,
 fontWeight: "700",
 marginBottom: Spacing.md,
 textAlign: "left",
 },
 logo: {
 marginBottom: Spacing.md,
 },
  definitionText: {
    ...Typography.body,
    fontFamily: "JetBrainsMono",
    textAlign: "left",
 lineHeight: 22,
 },
  link: {
    fontFamily: "JetBrainsMono",
    fontSize: 13,
 fontWeight: "700",
 textDecorationLine: "underline",
 marginTop: Spacing.md,
 },
 sketchBox: {
 width: 200,
 height: 200,
 marginTop: Spacing.lg,
 backgroundColor: "transparent",
 },
 versionBadge: {
 borderRadius: 9999,
 paddingHorizontal: Spacing.sm + 4,
 paddingVertical: Spacing.xs,
 marginTop: Spacing.lg,
 },
 versionText: {
 ...Typography.monoLabel,
 },
});
