import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../constants/theme';

export default function TextField({ label, hint, error, style, labelStyle, hintStyle, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        {hint ? <Text style={[styles.hint, hintStyle]}>{hint}</Text> : null}
      </View>
      <TextInput
        placeholderTextColor={colors.textMuted}
        {...props}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        style={[styles.input, focused && styles.focused, error && styles.errored, style]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    ...typography.overline,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  /** Resting state is a quiet fill; focus swaps it for white inside a blue rule. */
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.field,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.md - 2,
  },
  focused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  errored: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerTint,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    paddingHorizontal: spacing.xs,
  },
});
