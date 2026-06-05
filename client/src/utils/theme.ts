export const ios = {
  blue: "#007AFF",
  red: "#FF3B30",
  green: "#34C759",
  orange: "#FF9500",
  yellow: "#FFCC00",
  purple: "#AF52DE",
  pink: "#FF2D55",
  teal: "#5AC8FA",
  gray: "#8E8E93",
  gray2: "#AEAEB2",
  gray3: "#C7C7CC",
  gray4: "#D1D1D6",
  gray5: "#E5E5EA",
  gray6: "#F2F2F7",

  bg: "#F2F2F7",
  card: "#FFFFFF",
  separator: "#C6C6C8",

  text: "#000000",
  textSecondary: "#8E8E93",
  textTertiary: "#C7C7CC",

  font:
    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',

  radius: { sm: 8, md: 10, lg: 13, xl: 16 },

  shadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  shadowLg: "0 4px 12px rgba(0,0,0,0.1)",
} as const;

export const statusColor: Record<string, string> = {
  todo: ios.orange,
  in_progress: ios.blue,
  review: ios.purple,
  done: ios.green,
  pending: ios.orange,
  approved: ios.green,
  rejected: ios.red,
};

export const priorityColor: Record<string, string> = {
  low: ios.gray,
  medium: ios.blue,
  high: ios.orange,
  urgent: ios.red,
};
