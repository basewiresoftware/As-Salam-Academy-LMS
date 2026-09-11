import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../constants/theme';

/** Temporary marker for screens that are scaffolded but not built yet. */
export default function PlaceholderNote({ children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  text: {
    ...typography.body,
    color: colors.textMuted,
  },
});
