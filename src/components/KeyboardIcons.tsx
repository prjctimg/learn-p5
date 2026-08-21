import Svg, { Path } from "react-native-svg";

interface KeyboardIconProps {
  size?: number;
  color: string;
  strokeWidth?: number;
}

// Upward arrow with a flat base, drawn as an outline so the active state can
// use the vibrant blue accent stroke.
export function ShiftIcon({ size = 22, color, strokeWidth = 2 }: KeyboardIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.5L4.5 11.5H9V18H15V11.5H19.5L12 3.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Left-pointing pentagon/tag container with a centered symmetric cross.
export function BackspaceIcon({ size = 22, color, strokeWidth = 2 }: KeyboardIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.8 5H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8.8L3 12l5.8-7Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.5 9.5l5 5m0-5l-5 5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// Angled line starting downward and sweeping 90 degrees to point left,
// finished with an arrow head (classic return/enter glyph).
export function EnterIcon({ size = 22, color, strokeWidth = 2 }: KeyboardIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 5v5a3 3 0 0 1-3 3H5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 9l-4 4 4 4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Standard open-bottom rectangle space symbol.
export function SpaceIcon({ size = 20, color, strokeWidth = 2 }: KeyboardIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 7v7a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
