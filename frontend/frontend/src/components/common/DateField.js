import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../constants/theme';
import { formatDateLong, parseDate } from '../../utils/date';
import CalendarSheet from './CalendarSheet';
import Caret from './Caret';

/**
 * A date in the same clothes as a TextField: same label row, same pill, same
 * blue rule when it is open as a text input has when focused. Tapping it opens
 * a calendar instead of a keyboard. Value in and out is the 'YYYY-MM-DD' the
 * API expects, not a Date.
 */
export default function DateField({
  label,
  hint,
  error,
  value,
  onChange,
  placeholder = 'Select a date',
  minimumDate,
  maximumDate,
  disabled = false,
  style,
  labelStyle,
  hintStyle,
  textStyle,
  ...props
}) {
  const [open, setOpen] = useState(false);

  const selected = parseDate(value);
  const face = selected ? formatDateLong(value) : placeholder;

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        {hint ? <Text style={[styles.hint, hintStyle]}>{hint}</Text> : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${selected ? face : 'not set'}`}
        accessibilityHint="Opens a calendar"
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        hitSlop={4}
        {...props}
        onPress={(event) => {
          setOpen(true);
          props.onPress?.(event);
        }}
        style={({ pressed }) => [
          styles.input,
          open && styles.focused,
          error && styles.errored,
          pressed && !open && styles.pressed,
          disabled && styles.disabled,
          style,
        ]}
      >
        {/*
          `style` lands on the text as well as the box. In TextField one style
          carries both, because there the box IS the text — callers pass type
          sizes through `style` and expect them to apply. Anything that must not
          reach the box (a background, say) goes through `textStyle`.
        */}
        <Text
          numberOfLines={1}
          style={[styles.value, !selected && styles.placeholder, style, textStyle]}
        >
          {face}
        </Text>
        <Caret direction="down" size={8} color={colors.textMuted} weight={2} />
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <CalendarSheet
        visible={open}
        value={value}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onClose={() => setOpen(false)}
        onSelect={(next) => {
          onChange?.(next);
          setOpen(false);
        }}
      />
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
  /** Resting state is a quiet fill; open swaps it for white inside a blue rule. */
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    // Matches TextField's computed height (14 + 24 + 14 + 2) so the two line up
    // in a form even where Android's TextInput adds its own inner padding.
    minHeight: 54,
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
  pressed: {
    backgroundColor: colors.primaryTint,
  },
  disabled: {
    opacity: 0.55,
  },
  value: {
    ...typography.body,
    color: colors.text,
    flexShrink: 1,
  },
  /** The same grey a TextInput's placeholderTextColor gets. */
  placeholder: {
    color: colors.textMuted,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    paddingHorizontal: spacing.xs,
  },
});
