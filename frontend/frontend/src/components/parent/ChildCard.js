import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COURSE_TYPE_LABELS, PROGRAM_LABELS } from '../../constants/programs';
import { colors, radius, spacing, typography } from '../../constants/theme';
import Caret from '../common/Caret';

function initials(child) {
  return `${child.first_name?.[0] ?? ''}${child.last_name?.[0] ?? ''}`.toUpperCase() || '?';
}

/** DRF sends decimals as strings ("120.00"); show them as money, or nothing. */
function formatAmount(amount) {
  const value = Number(amount);
  return Number.isFinite(value) ? `$${value.toFixed(2)}` : null;
}

/**
 * One child, with the classes they are enrolled in folded away until tapped.
 * The card is the parent dashboard's main unit, so it carries the enrolment
 * count and anything outstanding on its face — a parent should not have to
 * open every card to find out whether they owe the academy money.
 */
export default function ChildCard({ child }) {
  const [expanded, setExpanded] = useState(false);

  const enrollments = child.enrollments ?? [];
  const dueCount = enrollments.filter((e) => e.payment_status !== 'paid').length;
  const program = PROGRAM_LABELS[child.program] ?? 'No program set';

  return (
    <View style={styles.card}>
      <Pressable
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
        onPress={() => setExpanded((open) => !open)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${child.first_name} ${child.last_name}, ${program}`}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(child)}</Text>
        </View>

        <View style={styles.identity}>
          <Text style={styles.name}>
            {child.first_name} {child.last_name}
          </Text>
          <Text style={styles.program}>{program}</Text>
        </View>

        {dueCount > 0 ? (
          <View style={styles.duePill}>
            <Text style={styles.duePillText}>
              {dueCount} due
            </Text>
          </View>
        ) : null}

        <View style={styles.caretWell}>
          <Caret direction={expanded ? 'up' : 'down'} color={colors.primary} />
        </View>
      </Pressable>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {enrollments.length === 0
            ? 'Not enrolled in a class yet'
            : `${enrollments.length} ${enrollments.length === 1 ? 'class' : 'classes'}`}
        </Text>
        <View style={styles.summaryRule} />
        <Text style={styles.summaryHint}>{expanded ? 'Tap to collapse' : 'Tap to see classes'}</Text>
      </View>

      {expanded ? (
        <View style={styles.enrollments}>
          {enrollments.length === 0 ? (
            <Text style={styles.empty}>
              Once this child is enrolled, their classes and payments appear here.
            </Text>
          ) : (
            enrollments.map((enrollment) => {
              const paid = enrollment.payment_status === 'paid';
              const amount = formatAmount(enrollment.amount);
              return (
                <View key={enrollment.id} style={styles.enrollmentRow}>
                  <View style={styles.enrollmentMain}>
                    <Text style={styles.courseTitle}>{enrollment.course?.title ?? 'Class'}</Text>
                    <Text style={styles.courseMeta}>
                      {COURSE_TYPE_LABELS[enrollment.course?.course_type] ?? 'Class'}
                      {amount ? ` · ${amount}` : ''}
                    </Text>
                  </View>
                  <View style={[styles.statusPill, paid ? styles.statusPaid : styles.statusPending]}>
                    <Text style={[styles.statusText, paid ? styles.statusTextPaid : styles.statusTextPending]}>
                      {paid ? 'Paid' : 'Due'}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      ) : null}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerPressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryTint,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.label,
    fontSize: 16,
    color: colors.primary,
  },
  identity: {
    flex: 1,
  },
  name: {
    ...typography.serifMd,
    color: colors.ink,
  },
  program: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  duePill: {
    backgroundColor: colors.dangerTint,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  duePillText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.danger,
  },
  caretWell: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    marginTop: spacing.md,
  },
  summaryText: {
    ...typography.label,
    color: colors.ink,
  },
  summaryRule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.hairline,
  },
  summaryHint: {
    ...typography.caption,
    color: colors.textMuted,
  },

  enrollments: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    paddingTop: spacing.md,
    gap: spacing.sm + 2,
  },
  enrollmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.field,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  enrollmentMain: {
    flex: 1,
  },
  courseTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.ink,
  },
  courseMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  statusPaid: {
    backgroundColor: colors.primaryTint,
  },
  statusPending: {
    backgroundColor: colors.dangerTint,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
  },
  statusTextPaid: {
    color: colors.success,
  },
  statusTextPending: {
    color: colors.danger,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
  },
});
