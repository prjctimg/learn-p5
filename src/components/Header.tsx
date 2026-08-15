import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDrawerContext } from "../contexts/DrawerContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export default function Header({ title, subtitle, right }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { openDrawer } = useDrawerContext();

  return (
    <View
      style={{ paddingTop: insets.top + 8 }}
      className="flex-row items-center justify-between px-4 pb-3 bg-surface dark:bg-surface-dark"
    >
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={openDrawer}
          className="w-10 h-10 items-center justify-center rounded-full bg-surface-dim dark:bg-surface-dim-dark"
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
        >
          <Text className="text-xl text-on-surface dark:text-on-surface-dark font-bold leading-none">
            ☰
          </Text>
        </Pressable>
        <View>
          <Text className="font-headline text-xl font-bold text-on-surface dark:text-on-surface-dark">
            {title}
          </Text>
          {subtitle && (
            <Text className="font-body text-xs text-text-secondary dark:text-text-secondary-dark -mt-0.5">
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {right}
    </View>
  );
}
