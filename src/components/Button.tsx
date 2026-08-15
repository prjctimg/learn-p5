import { Text, Pressable } from "react-native";

type Variant = "primary" | "outline";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-primary border-2 border-outline dark:border-outline-dark active:translate-y-1 active:translate-x-1",
  outline:
    "bg-white dark:bg-transparent border-2 border-primary active:translate-y-0.5",
};

const textStyles: Record<Variant, string> = {
  primary: "text-on-primary font-headline font-black text-xl uppercase tracking-wider",
  outline: "text-primary font-headline font-bold text-xl uppercase tracking-widest",
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  accessibilityLabel,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled }}
      className={`w-full py-4 px-6 items-center justify-center rounded-none min-h-[52px]
        ${variantStyles[variant]}
        ${disabled ? "opacity-50" : "active:opacity-90"}
      `}
    >
      <Text
        className={`${textStyles[variant]} ${disabled ? "opacity-50" : ""}`}
      >
        {title}
      </Text>
    </Pressable>
  );
}
