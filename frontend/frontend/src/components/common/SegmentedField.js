import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../constants/theme';

/**
 * Row of outlined tabs for short, mutually exclusive choices (role, gender).
 * `stacked` turns the row into a column, for options whose labels are too long
 * to sit side by side (programs).
 */
export default function SegmentedField({
  label,
  options,
  value,
  onChange,
  labelStyle,
  textStyle,
  stacked = false,
}) {
  return (
    <View style={styles.field}>
      {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}
      <View style={[styles.track, stacked && styles.trackStacked]}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.segment,
                selected && styles.segmentSelected,
                pressed && !selected && styles.segmentPressed,
              ]}
            >
              <Text
                style={[styles.segmentText, textStyle, selected && styles.segmentTextSelected]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    ...typography.overline,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  track: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  trackStacked: {
    flexDirection: 'column',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  segmentSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentPressed: {
    backgroundColor: colors.field,
  },
  segmentText: {
    ...typography.label,
    color: colors.textMuted,
  },
  segmentTextSelected: {
    color: colors.onPrimary,
  },
});
