import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../theme";

type ResultCardProps = {
  text: string;
};

export function ResultCard({ text }: ResultCardProps) {
  return (
    <View style={styles.box}>
      <Text style={styles.mono}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: spacing.lg,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mono: {
    ...typography.mono,
    color: colors.text,
  },
});
