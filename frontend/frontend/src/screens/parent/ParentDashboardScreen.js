import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { api, endpoints } from '../../../api';
import BrandMark from '../../components/common/BrandMark';
import Reveal from '../../components/common/Reveal';
import ChildCard from '../../components/parent/ChildCard';
import EmailNotificationsCard from '../../components/parent/EmailNotificationsCard';
import { useAuth } from '../../context/AuthContext';
import { colors, gradients, radius, spacing, typography } from '../../constants/theme';

/** Above this the banner, cards and side column sit next to each other. */
const WIDE_BREAKPOINT = 900;

/** One headline number: children, classes, anything outstanding. */
function StatCard({ value, label, accent = colors.gold }) {
  return (
    <View style={[styles.statCard, { borderTopColor: accent }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ParentDashboardScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;

  const { user, logout } = useAuth();

  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Bumping this re-runs the fetch; that is all "Try again" has to do.
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    api
      .get(endpoints.parentDashboard)
      .then((data) => {
        if (active) setChildren(data ?? []);
      })
      .catch((requestError) => {
        console.error(requestError);
        if (active) setError('We could not load your children right now.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadToken]);

  function retry() {
    setIsLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  }

  // Every tile is derived from the one dashboard payload — no extra requests.
  const stats = useMemo(() => {
    const enrollments = children.flatMap((child) => child.enrollments ?? []);
    return {
      children: children.length,
      classes: enrollments.length,
      due: enrollments.filter((enrollment) => enrollment.payment_status !== 'paid').length,
    };
  }, [children]);

  const displayName = user?.first_name || user?.username || 'friend';
  const initial = (user?.username || '?').trim().charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      <LinearGradient
        colors={gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.4 }}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <BrandMark size={38} />
          {isWide ? (
            <View>
              <Text style={styles.headerTitle}>As-Salam Qur&apos;an Academy</Text>
              <Text style={styles.headerTagline}>Parent Portal</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.headerRight}>
          <View style={styles.userBadge}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{initial}</Text>
            </View>
            {isWide ? (
              <View>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.username}
                </Text>
                <View style={styles.userStatusRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.userStatus}>Signed in</Text>
                </View>
              </View>
            ) : null}
          </View>

          <Pressable
            onPress={logout}
            accessibilityRole="button"
            style={({ pressed }) => [styles.signOut, pressed && styles.signOutPressed]}
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.canvas}
        showsVerticalScrollIndicator={false}
      >
        <Reveal index={0}>
          <View style={styles.banner}>
            <View style={styles.bannerWatermark} pointerEvents="none">
              <BrandMark size={190} />
            </View>
            <Text style={styles.bannerEyebrow}>Parent Portal</Text>
            <Text style={[styles.bannerGreeting, !isWide && styles.bannerGreetingNarrow]}>
              As-salamu alaykum, {displayName}
            </Text>
            <View style={styles.bannerRule} />
            <Text style={styles.bannerSubtitle}>
              Your children, the classes they are enrolled in, and anything still owed to the
              academy — all in one place. Tap a child to open their classes.
            </Text>
          </View>
        </Reveal>

        <Reveal index={1}>
          <View style={styles.statGrid}>
            <StatCard value={stats.children} label="Children registered" accent={colors.gold} />
            <StatCard value={stats.classes} label="Class enrolments" accent={colors.primary} />
            <StatCard
              value={stats.due}
              label="Payments outstanding"
              accent={stats.due > 0 ? colors.danger : colors.success}
            />
          </View>
        </Reveal>

        <View style={styles.split}>
          <View style={styles.main}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionMark} />
              <Text style={styles.sectionTitle}>Your children</Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.primaryAction, pressed && styles.primaryActionPressed]}
              onPress={() => navigation.navigate('AddChild')}
              accessibilityRole="button"
            >
              <Text style={styles.primaryActionText}>Register another child</Text>
            </Pressable>

            {isLoading ? (
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            ) : error ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable
                  onPress={retry}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.retry, pressed && styles.retryPressed]}
                >
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              </View>
            ) : children.length === 0 ? (
              <Text style={styles.empty}>
                No children are registered to your account yet.
              </Text>
            ) : (
              <View style={styles.childList}>
                {children.map((child, index) => (
                  <Reveal key={child.id} index={index} distance={12}>
                    <ChildCard child={child} />
                  </Reveal>
                ))}
              </View>
            )}
          </View>

          <View style={styles.side}>
            <EmailNotificationsCard />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.navy,
  },

  header: {
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 3,
    borderBottomColor: colors.gold,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - 2,
  },
  headerTitle: {
    ...typography.serifMd,
    fontSize: 19,
    color: colors.onPrimary,
  },
  headerTagline: {
    ...typography.overline,
    color: colors.goldLight,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - 4,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: colors.panelLine,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs + 2,
    paddingLeft: spacing.xs + 2,
    paddingRight: spacing.md,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    ...typography.label,
    color: colors.navy,
  },
  userName: {
    ...typography.label,
    color: colors.onPrimary,
  },
  userStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.goldLight,
  },
  userStatus: {
    ...typography.overline,
    fontSize: 10,
    color: colors.onPrimaryMuted,
    textTransform: 'uppercase',
  },
  signOut: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.panelLine,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
  },
  signOutPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  signOutText: {
    ...typography.label,
    color: colors.onPrimary,
  },

  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  canvas: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    width: '100%',
    maxWidth: 1400,
    alignSelf: 'center',
  },

  banner: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  bannerWatermark: {
    position: 'absolute',
    top: -34,
    right: -30,
    opacity: 0.07,
    transform: [{ rotate: '8deg' }],
  },
  bannerEyebrow: {
    ...typography.overline,
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  bannerGreeting: {
    ...typography.serifLg,
    color: colors.ink,
  },
  /** Phones get a notch smaller so a long name never breaks awkwardly. */
  bannerGreetingNarrow: {
    fontSize: 27,
    lineHeight: 32,
  },
  bannerRule: {
    width: 44,
    height: 2,
    backgroundColor: colors.gold,
    marginVertical: spacing.md,
  },
  bannerSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    maxWidth: 620,
  },

  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 200,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 4,
    padding: spacing.lg,
  },
  statValue: {
    ...typography.serifLg,
    color: colors.ink,
  },
  statLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  split: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  main: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 420,
  },
  side: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 300,
    maxWidth: 380,
    gap: spacing.lg,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  sectionMark: {
    width: 5,
    height: 24,
    borderRadius: 3,
    backgroundColor: colors.gold,
  },
  sectionTitle: {
    ...typography.serifMd,
    color: colors.ink,
  },

  primaryAction: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    marginBottom: spacing.lg,
  },
  primaryActionPressed: {
    backgroundColor: colors.primaryDeep,
  },
  primaryActionText: {
    ...typography.label,
    color: colors.onPrimary,
  },

  childList: {
    gap: spacing.md,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
    paddingVertical: spacing.lg,
  },
  errorCard: {
    backgroundColor: colors.dangerTint,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
  },
  retry: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
  },
  retryPressed: {
    opacity: 0.7,
  },
  retryText: {
    ...typography.label,
    color: colors.danger,
  },
});
