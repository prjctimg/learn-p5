import { View, Text, Switch, Pressable } from "react-native";
import { useThemeContext } from "../components/ThemeProvider";
import { useDrawerContext } from "../contexts/DrawerContext";
import Button from "../components/Button";

export default function Index() {
  const { colorScheme, toggleTheme } = useThemeContext();
  const { openDrawer } = useDrawerContext();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-1 items-center justify-center px-6 gap-6 bg-surface dark:bg-surface-dark">
      <Pressable
        onPress={openDrawer}
        className="absolute top-4 left-4 z-10 w-10 h-10 items-center justify-center rounded-full bg-surface-dim dark:bg-surface-dim-dark"
        accessibilityRole="button"
        accessibilityLabel="Open navigation menu"
      >
        <Text className="text-xl text-on-surface dark:text-on-surface-dark font-bold leading-none">
          ☰
        </Text>
      </Pressable>

      <View className="items-center gap-2">
        <Text className="font-headline text-5xl font-black tracking-tighter text-center leading-none text-on-surface dark:text-on-surface-dark">
          Hello, Coder!
        </Text>
        <Text className="font-body text-center max-w-[80%] text-text-secondary dark:text-text-secondary-dark">
          Ready to create something amazing today?
        </Text>
      </View>

      <View className="flex-row items-center gap-3">
        <Text className="text-sm font-label uppercase tracking-wider text-text-secondary dark:text-text-secondary-dark">
          Light
        </Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: "#D1D5DB", true: "#ED225D" }}
          thumbColor={isDark ? "#FFFFFF" : "#F3F4F6"}
          accessibilityRole="switch"
          accessibilityLabel="Toggle dark mode"
        />
        <Text className="text-sm font-label uppercase tracking-wider text-text-secondary dark:text-on-surface-dark">
          Dark
        </Text>
      </View>

      <View className="w-full gap-4">
        <Button
          title="Start Learning"
          onPress={() => {}}
          variant="primary"
          accessibilityLabel="Start learning p5.js"
        />
        <Button
          title="Continue Sketch"
          onPress={() => {}}
          variant="outline"
        />
        <Button title="Disabled" onPress={() => {}} variant="primary" disabled />
      </View>

      <Text className="text-xs font-mono text-center max-w-[280px] text-text-secondary dark:text-text-secondary-dark">
        This button respects system dark mode and includes full screen reader
        support
      </Text>
    </View>
  );
}
