import { StatusBar } from 'expo-status-bar';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '../../constants/theme';
import BrandMark from './BrandMark';

/** Below this the two columns stack: the crest becomes a band over the form. */
const SPLIT_WIDTH = 900;

/**
 * Shared shell for the signed-out screens. Wide screens get two flat columns —
 * the form on white at the left, a navy crest panel at the right. Phones get
 * the same panel folded down into a band above the form, so sign-in and
 * sign-up read as one place at any size.
 */
export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  notice,
  noticeCaption,
  children,
  footer,
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const split = width >= SPLIT_WIDTH;

  const form = (
    <View style={[styles.form, split && styles.formSplit]}>
      {split ? null : <View style={styles.formRule} />}
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={[styles.title, split ? styles.titleSplit : styles.titleNarrow]}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <View style={styles.fields}>{children}</View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}

      <View style={styles.meta}>
        <Text style={styles.metaText}>
          As-Salam Qur&apos;an Academy · Masjid As-Salam
        </Text>
      </View>
    </View>
  );

  const wordmark = (
    <View style={styles.wordmark}>
      <BrandMark size={30} />
      <Text style={[styles.wordmarkText, split && styles.wordmarkTextDark]}>
        As-Salam Qur&apos;an Academy
      </Text>
    </View>
  );

  if (!split) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.stackScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.band, { paddingTop: insets.top + spacing.lg }]}>
              {wordmark}
              {notice ? <Text style={styles.bandNotice}>{notice}</Text> : null}
            </View>
            {form}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.split}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.column}>
          <ScrollView
            contentContainerStyle={[styles.splitScroll, { paddingTop: insets.top + spacing.xl }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.columnInner}>
              {wordmark}
              {form}
            </View>
          </ScrollView>
        </View>

        <View style={[styles.panel, { paddingTop: insets.top + spacing.xl }]}>
          <View style={styles.panelHead}>
            <Text style={styles.panelKicker}>The family portal</Text>
            <Text style={styles.panelKicker}>this is only a test version</Text>
          </View>

          <View style={styles.plate}>
            <BrandMark size={120} />
            <Text style={styles.plateCaption}>Masjid As-Salam</Text>
          </View>

          {notice ? <Text style={styles.panelNotice}>{notice}</Text> : null}
          {noticeCaption ? <Text style={styles.panelCaption}>{noticeCaption}</Text> : null}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  flex: {
    flex: 1,
  },
  split: {
    flex: 1,
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  columnInner: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  splitScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl + spacing.md,
    paddingBottom: spacing.xl,
  },
  stackScroll: {
    flexGrow: 1,
    backgroundColor: colors.surface,
  },

  // Phone: navy band folded over the top of the form.
  band: {
    backgroundColor: colors.panel,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  bandNotice: {
    ...typography.serifMd,
    color: colors.onPrimary,
    maxWidth: 420,
  },

  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  wordmarkText: {
    ...typography.label,
    color: colors.onPrimary,
    letterSpacing: 0.3,
  },
  wordmarkTextDark: {
    color: colors.ink,
  },

  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  formSplit: {
    paddingHorizontal: 0,
    paddingTop: spacing.xl + spacing.md,
    paddingBottom: 0,
  },
  formRule: {
    width: 40,
    height: 2,
    backgroundColor: colors.gold,
    marginBottom: spacing.lg,
  },
  eyebrow: {
    ...typography.overline,
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm + 2,
  },
  title: {
    ...typography.serifLg,
    color: colors.ink,
  },
  titleSplit: {
    ...typography.serifXl,
  },
  /** Phones get a notch smaller so a two-word line never breaks awkwardly. */
  titleNarrow: {
    fontSize: 29,
    lineHeight: 34,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm + 2,
    maxWidth: 400,
  },
  fields: {
    marginTop: spacing.xl,
    gap: spacing.md + 2,
  },
  footer: {
    marginTop: spacing.lg,
  },
  meta: {
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
  },

  // Wide: the navy crest column. A slim accent beside the form, never half the
  // screen — the width is a share of the viewport, floored so the crest and
  // notice still fit and capped so it stays a column on ultrawide monitors.
  panel: {
    width: '30%',
    minWidth: 280,
    maxWidth: 400,
    backgroundColor: colors.panel,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  panelHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: spacing.xs,
  },
  panelKicker: {
    ...typography.overline,
    color: colors.onPrimaryMuted,
    textTransform: 'uppercase',
  },
  plate: {
    flex: 1,
    marginVertical: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.panelLine,
    backgroundColor: colors.panelSoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    minHeight: 160,
  },
  plateCaption: {
    ...typography.overline,
    color: colors.onPrimaryMuted,
    textTransform: 'uppercase',
  },
  panelNotice: {
    ...typography.serifMd,
    color: colors.onPrimary,
  },
  panelCaption: {
    ...typography.body,
    color: colors.onPrimaryMuted,
    marginTop: spacing.sm + 2,
  },
});
