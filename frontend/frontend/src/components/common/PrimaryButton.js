import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../constants/theme';

export default function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'solid',
  labelStyle,
}) {
  const inactive = disabled || loading;
  const outline = variant === 'outline';

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        outline ? styles.outline : styles.solid,
        pressed && !inactive && (outline ? styles.outlinePressed : styles.solidPressed),
        inactive && styles.inactive,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={outline ? colors.primary : colors.onPrimary} />
      ) : (
        <View style={styles.content}>
          <Text style={[styles.label, labelStyle, outline && styles.outlineLabel]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  solid: {
    backgroundColor: colors.primary,
  },
  solidPressed: {
    backgroundColor: colors.primaryDeep,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  outlinePressed: {
    backgroundColor: colors.field,
  },
  inactive: {
    opacity: 0.55,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: colors.onPrimary,
  },
  outlineLabel: {
    color: colors.ink,
  },
});
