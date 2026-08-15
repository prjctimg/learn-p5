import { Fonts } from "./Fonts";

export const Typography = {
  display: {
    fontFamily: Fonts.display,
    fontSize: 32,
    fontWeight: "700" as const,
  },
  headline: {
    fontFamily: Fonts.headline,
    fontSize: 24,
    fontWeight: "700" as const,
  },
  title: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: "700" as const,
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 16,
    fontWeight: "400" as const,
  },
  bodySmall: {
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: "400" as const,
  },
  label: {
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: "600" as const,
  },
  labelSmall: {
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: "600" as const,
  },
  mono: {
    fontFamily: Fonts.mono,
    fontSize: 16,
    fontWeight: "400" as const,
  },
  monoSmall: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    fontWeight: "400" as const,
  },
  monoLabel: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    fontWeight: "700" as const,
  },
} as const;
