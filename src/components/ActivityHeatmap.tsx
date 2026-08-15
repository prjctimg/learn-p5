import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";
import { deriveAccentShades } from "../utils/colorUtils";
import { ActivityMap } from "../hooks/useActivityLog";

const WEEKS = 13;
const DAYS = 7;
const CELL = 12;
const GAP = 3;
const STEP = CELL + GAP;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAY_LABELS = ["", "M", "", "W", "", "F", ""];

interface Props {
  activity: ActivityMap;
}

export default function ActivityHeatmap({ activity }: Props) {
  const { colorScheme, ctaColor } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const shades = deriveAccentShades(ctaColor);

  const emptyColor = colors.surfaceContainerHigh;

  // 5 intensity buckets: 0 (empty), 1..4 from accent ramp
  function colorForCount(count: number): string {
    if (count <= 0) return emptyColor;
    if (count === 1) return shades.veryLight;
    if (count <= 3) return shades.light;
    if (count <= 6) return shades.medium;
    return shades.dark;
  }

  function dateKey(d: Date): string {
    return d.toISOString().split("T")[0];
  }

  // Build a 7-row × 13-week grid ending today (col 0 = oldest).
  const grid = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Find the most recent Saturday (end-of-week on day 6 of grid if we treat Sun=0..Sat=6)
    const todayDay = today.getDay();
    const end = new Date(today);
    end.setDate(today.getDate() + (6 - todayDay));

    const cells: Array<{ date: string; count: number; col: number; row: number } | null> = [];
    const start = new Date(end);
    start.setDate(start.getDate() - (WEEKS * DAYS - 1));

    let idx = 0;
    for (let col = 0; col < WEEKS; col++) {
      for (let row = 0; row < DAYS; row++) {
        const d = new Date(start);
        d.setDate(start.getDate() + idx);
        const isFuture = d.getTime() > today.getTime();
        const key = dateKey(d);
        cells.push(
          isFuture
            ? null
            : { date: key, count: activity[key] ?? 0, col, row }
        );
        idx++;
      }
    }
    return { cells, monthMarkers: buildMonthMarkers(start, end) };
  }, [activity]);

  function buildMonthMarkers(start: Date, end: Date) {
    const markers: Array<{ label: string; col: number } | null> = [];
    let lastMonth = -1;
    for (let col = 0; col < WEEKS; col++) {
      const d = new Date(start);
      d.setDate(start.getDate() + col * DAYS);
      const month = d.getMonth();
      if (month !== lastMonth) {
        markers.push({ label: MONTHS[month], col });
        lastMonth = month;
      } else {
        markers.push(null);
      }
    }
    return markers;
  }

  const labelWidth = 24;
  const monthHeight = 16;
  const legendHeight = 18;
  const gridWidth = STEP * WEEKS - GAP;
  const totalWidth = labelWidth + gridWidth;
  const gridHeight = STEP * DAYS - GAP;

  return (
    <View style={styles.card}>
      <Text style={[styles.title, { color: colors.onSurface }]}>Activity</Text>
      <Svg
        width={totalWidth + 12}
        height={monthHeight + gridHeight + legendHeight + 8}
      >
        {/* Month markers */}
        {grid.monthMarkers.map((m, i) =>
          m ? (
            <SvgText
              key={i}
              x={labelWidth + m.col * STEP}
              y={monthHeight - 4}
              fill={colors.onSurfaceVariant}
              fontSize={9}
              fontFamily="JetBrainsMono"
            >
              {m.label}
            </SvgText>
          ) : null
        )}

        {/* Weekday ticks */}
        {WEEKDAY_LABELS.map((label, row) =>
          label ? (
            <SvgText
              key={row}
              x={0}
              y={monthHeight + row * STEP + CELL - 2}
              fill={colors.onSurfaceVariant}
              fontSize={9}
              fontFamily="JetBrainsMono"
            >
              {label}
            </SvgText>
          ) : null
        )}

        {/* Heatmap cells */}
        {grid.cells.map((cell, i) => {
          if (!cell) return null;
          const x = labelWidth + cell.col * STEP;
          const y = monthHeight + cell.row * STEP;
          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={CELL}
              height={CELL}
              rx={2}
              fill={colorForCount(cell.count)}
            />
          );
        })}

        {/* Legend */}
        <SvgText
          x={labelWidth + (WEEKS - 5) * STEP}
          y={monthHeight + gridHeight + 14}
          fill={colors.onSurfaceVariant}
          fontSize={9}
          fontFamily="JetBrainsMono"
        >
          Less
        </SvgText>
        {[0, 1, 2, 3, 4].map((level) => {
          const count = level === 0 ? 0 : level === 1 ? 1 : level === 2 ? 3 : level === 3 ? 6 : 7;
          return (
            <Rect
              key={level}
              x={labelWidth + (WEEKS - 3 + level) * STEP}
              y={monthHeight + gridHeight + 6}
              width={CELL}
              height={CELL}
              rx={2}
              fill={colorForCount(count)}
            />
          );
        })}
        <SvgText
          x={labelWidth + (WEEKS + 2) * STEP}
          y={monthHeight + gridHeight + 14}
          fill={colors.onSurfaceVariant}
          fontSize={9}
          fontFamily="JetBrainsMono"
        >
          More
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  title: {
    fontFamily: "JetBrainsMono",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
});