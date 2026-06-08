import { View, Text } from "react-native";
import Svg, { Path } from "react-native-svg";
import Button from "./Button";
import { Colors } from "../constants/Colors";

const asteriskPath =
  "M16.909,10.259l8.533-2.576l1.676,5.156l-8.498,2.899l5.275,7.48l-4.447,3.225l-5.553-7.348L8.487,26.25l-4.318-3.289l5.275-7.223L0.88,12.647l1.678-5.16l8.598,2.771V1.364h5.754V10.259z";

interface ChallengeCardProps {
  title: string;
  moduleName: string;
  description: string;
  onContinue: () => void;
}

export default function ChallengeCard({
  title,
  moduleName,
  description,
  onContinue,
}: ChallengeCardProps) {
  return (
    <View className="bg-surface-dim dark:bg-surface-dim-dark rounded-xl overflow-hidden border-2 border-outline dark:border-outline-dark">
      <View className="items-center justify-center py-10 bg-primary/10">
        <Svg width={48} height={48} viewBox="0 0 28 28" fill="none">
          <Path d={asteriskPath} fill={Colors.light.primary} />
        </Svg>
      </View>

      <View className="px-4 py-4 gap-2">
        <Text className="font-headline text-2xl font-bold text-on-surface dark:text-on-surface-dark">
          {title}
        </Text>
        <Text className="font-label text-xs uppercase tracking-wider text-primary">
          {moduleName}
        </Text>
        <Text className="font-body text-sm text-text-secondary dark:text-text-secondary-dark leading-5">
          {description}
        </Text>
      </View>

      <View className="px-4 pb-4">
        <Button title="Continue" onPress={onContinue} variant="primary" />
      </View>
    </View>
  );
}
