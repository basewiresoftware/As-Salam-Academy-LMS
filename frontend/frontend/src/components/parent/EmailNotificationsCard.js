import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../constants/theme';

/** Pill switch. Colour and layout animate together, so no native driver. */
function AnimatedSwitch({ value, onValueChange, disabled }) {
  // Lazy state, not a ref: the value is interpolated while rendering.
  const [anim] = useState(() => new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.borderStrong, colors.primary],
  });

  const knobTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      hitSlop={10}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
    >
      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.knob, { transform: [{ translateX: knobTranslate }] }]} />
      </Animated.View>
    </Pressable>
  );
}

/**
 * Design mock-up. The switch keeps its own state so the interaction can be
 * seen, but nothing is sent anywhere — there is no notification preference on
 * the backend yet. Wire it to a PATCH and drop the local state when there is.
 */
export default function EmailNotificationsCard() {
  const [enabled, setEnabled] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.rule} />
        <View style={styles.headRow}>
          <Text style={styles.heading}>Email updates</Text>
          <View style={styles.mockTag}>
            <Text style={styles.mockTagText}>Mock-up</Text>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>Progress emails</Text>
          <Text style={styles.rowSubtitle}>
            Receive email about your children&apos;s attendance, class progress, and teacher
            comments.
          </Text>
        </View>
        <View style={styles.switchWell}>
          <AnimatedSwitch value={enabled} onValueChange={setEnabled} />
        </View>
      </View>

      <Text style={styles.note}>This preference is not saved yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  head: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  rule: {
    width: 32,
    height: 2,
    backgroundColor: colors.gold,
    marginBottom: spacing.sm + 2,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  heading: {
    ...typography.serifMd,
    color: colors.ink,
  },
  mockTag: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  mockTagText: {
    ...typography.overline,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    ...typography.label,
    color: colors.ink,
  },
  rowSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  switchWell: {
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    width: 46,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  note: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.md,
    paddingTop: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
});
