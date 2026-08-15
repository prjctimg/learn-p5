import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import DateTimePicker, {
 DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";

interface TimePickerProps {
 hour: number;
 minute: number;
 onTimeChange: (hour: number, minute: number) => void;
}

export default function TimePicker({ hour, minute, onTimeChange }: TimePickerProps) {
 const { colorScheme } = useThemeContext();
 const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
 const [show, setShow] = useState(false);

 const date = new Date();
 date.setHours(hour, minute, 0, 0);

 const handleChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
 if (Platform.OS === "android") {
 setShow(false);
 }
 if (selectedDate) {
 onTimeChange(selectedDate.getHours(), selectedDate.getMinutes());
 }
 };

 return (
 <View
 style={[
 styles.container,
 { borderTopColor: colors.outlineVariant + "40", borderTopWidth: 1 },
 ]}
 >
 <Pressable
 onPress={() => setShow(true)}
 style={({ pressed }) => [
 styles.timeButton,
 { backgroundColor: pressed ? colors.primaryContainer : colors.surfaceContainerHigh },
 ]}
 accessibilityRole="button"
 accessibilityLabel="Change reminder time"
 >
 <Text style={[styles.timeText, { color: colors.onSurface }]}>
 {hour.toString().padStart(2, "0")}:
 {minute.toString().padStart(2, "0")}
 </Text>
 <Text style={[styles.changeLabel, { color: colors.primary }]}>
 Change
 </Text>
 </Pressable>

 {(show || Platform.OS === "ios") && (
 <View style={Platform.OS === "ios" ? styles.iosPicker : undefined}>
 <DateTimePicker
 value={date}
 mode="time"
 display={Platform.OS === "ios" ? "spinner" : "default"}
 onChange={handleChange}
 themeVariant={colorScheme === "dark" ? "dark" : "light"}
 />
 </View>
)}
 </View>
);
}

const styles = StyleSheet.create({
 container: {
 paddingVertical: 8,
 alignItems: "center",
 },
 timeButton: {
 flexDirection: "row",
 alignItems: "center",
 gap: 12,
 paddingHorizontal: 24,
 paddingVertical: 10,
 borderRadius: 8,
 },
  timeText: {
    fontFamily: "JetBrainsMono",
    fontSize: 20,
    fontWeight: "700",
  },
  changeLabel: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
 fontWeight: "700",
 textTransform: "uppercase",
 letterSpacing: 0.5,
 },
 iosPicker: {
 marginTop: 8,
 },
});
