import { StyleSheet } from "react-native";
import { colors, spacing, typography } from "../theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
});
