/**
 * useTheme — Centralized theme hook
 * Returns a palette of semantic color tokens that automatically follow
 * the device's light/dark color scheme.
 *
 * Usage:
 *   const theme = useTheme();
 *   <View style={{ backgroundColor: theme.bg }} />
 */

import { useColorScheme } from "@/hooks/use-color-scheme";

const LIGHT = {
  bg: "#F8F7F4",
  bgElevated: "#FFFFFF",
  surface: "#EFEDE9",
  surfaceHigh: "#E6E3DD",
  border: "#D9D5CE",
  accent: "#9E7C4F",
  accentBg: "#F3EDE3",
  text: "#1A1917",
  textSecondary: "#5A554D",
  textMuted: "#9A948C",
  textDim: "#C4BDB5",
  tabBar: "#FFFFFF",
  tabBarBorder: "#E6E3DD",
  heartRed: "#E8304A",
  cardBg: "#ECEAE5",
  inputBg: "#EAE7E2",
  divider: "#E8E4DF",
  indicator: "#1A1917",
  isDark: false,
};

const DARK = {
  bg: "#0D0D0F",
  bgElevated: "#161619",
  surface: "#161619",
  surfaceHigh: "#1E1E23",
  border: "#2A2A30",
  accent: "#C8A96E",
  accentBg: "#3B2F1A",
  text: "#F0EDE8",
  textSecondary: "#B0ACAA",
  textMuted: "#8B8B95",
  textDim: "#52525A",
  tabBar: "#0D0D0F",
  tabBarBorder: "#1E1E23",
  heartRed: "#FF4D6D",
  cardBg: "#1E1E23",
  inputBg: "#1A1A1F",
  divider: "#2A2A30",
  indicator: "#C8A96E",
  isDark: true,
};

export type Theme = typeof LIGHT | typeof DARK;

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === "dark" ? DARK : LIGHT;
}
