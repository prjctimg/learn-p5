import { Stack } from "expo-router";

export default function CourseLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right", animationDuration: 500 }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="minigame" />
      <Stack.Screen name="minigame/play" />
      <Stack.Screen name="minigame/complete" />
    </Stack>
  );
}
