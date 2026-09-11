import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '../../constants/theme';
import {
  MONTH_NAMES,
  WEEKDAY_INITIALS,
  addMonths,
  buildMonthGrid,
  clampDate,
  compareDay,
  daysInMonth,
  formatDate,
  formatDateLong,
  isSameDay,
  parseDate,
  startOfDay,
  startOfMonth,
} from '../../utils/date';
import Caret from './Caret';

/** Height of one year row, used to scroll the current year into view on open. */
const YEAR_ROW_HEIGHT = 44;

/**
 * Snap a cursor into range. Drilling to December of the current year when the
 * ceiling is today would otherwise land on a page where every day is disabled.
 */
function clampMonth(year, month, min, max) {
  return startOfMonth(clampDate(new Date(year, month, 1), startOfMonth(min), max));
}

/**
 * The dialog body. Split out so it mounts fresh on every open — that is what
 * re-runs the entrance animation and re-seeds the cursor.
 */
function CalendarCard({ value, min, max, onSelect, onClose }) {
  const selected = parseDate(value);

  // A birth date is years back, so an empty field opens on the year grid: the
  // first decision is the year, not a month you would have to page to. An
  // existing value opens on its own month, where an edit is a one-tap nudge.
  const [mode, setMode] = useState(selected ? 'day' : 'year');
  const [cursor, setCursor] = useState(() =>
    startOfMonth(clampDate(selected ?? max, min, max)),
  );

  // Lazy state, not a ref: the value is read while rendering the style below.
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    // Mount-only on purpose: re-running it would replay the entrance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const today = startOfDay(new Date());

  const firstYear = min.getFullYear();
  const lastYear = max.getFullYear();

  // Step size and bounds differ per mode, but the header is one shared row.
  const stepBack = mode === 'month' ? -12 : -1;
  const stepOn = mode === 'month' ? 12 : 1;
  const prevDisabled =
    compareDay(new Date(year, month + stepBack + 1, 0), min) < 0;
  const nextDisabled = compareDay(new Date(year, month + stepOn, 1), max) > 0;

  const title =
    mode === 'day'
      ? `${MONTH_NAMES[month]} ${year}`
      : mode === 'month'
        ? `${year}`
        : `${firstYear} – ${lastYear}`;

  const step = (delta) => setCursor((prev) => addMonths(prev, delta));

  const pickDay = (day) => onSelect(formatDate(day));

  const pickMonth = (index) => {
    setCursor(clampMonth(year, index, min, max));
    setMode('day');
  };

  const pickYear = (pickedYear) => {
    setCursor(clampMonth(pickedYear, month, min, max));
    setMode('month');
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: progress,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
          ],
        },
      ]}
    >
      <View style={styles.header}>
        {/* Hidden rather than unmounted on the year grid, so the title holds still. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={mode === 'month' ? 'Previous year' : 'Previous month'}
          accessibilityState={{ disabled: prevDisabled }}
          accessibilityElementsHidden={mode === 'year'}
          importantForAccessibility={mode === 'year' ? 'no-hide-descendants' : 'auto'}
          disabled={mode === 'year' || prevDisabled}
          hitSlop={10}
          onPress={() => step(stepBack)}
          style={[styles.arrow, mode === 'year' && styles.arrowHidden]}
        >
          <Caret
            direction="left"
            size={9}
            color={prevDisabled ? colors.borderStrong : colors.primary}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            mode === 'day'
              ? `${title}, change month`
              : mode === 'month'
                ? `${title}, change year`
                : title
          }
          accessibilityState={{ expanded: mode !== 'day' }}
          disabled={mode === 'year'}
          hitSlop={8}
          onPress={() => setMode(mode === 'day' ? 'month' : 'year')}
          style={styles.titleRow}
        >
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {mode === 'year' ? null : <Caret direction="down" size={7} color={colors.primary} />}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={mode === 'month' ? 'Next year' : 'Next month'}
          accessibilityState={{ disabled: nextDisabled }}
          accessibilityElementsHidden={mode === 'year'}
          importantForAccessibility={mode === 'year' ? 'no-hide-descendants' : 'auto'}
          disabled={mode === 'year' || nextDisabled}
          hitSlop={10}
          onPress={() => step(stepOn)}
          style={[styles.arrow, mode === 'year' && styles.arrowHidden]}
        >
          <Caret
            direction="right"
            size={9}
            color={nextDisabled ? colors.borderStrong : colors.primary}
          />
        </Pressable>
      </View>

      {mode === 'day' ? (
        <DayGrid
          year={year}
          month={month}
          min={min}
          max={max}
          today={today}
          selected={selected}
          onPick={pickDay}
        />
      ) : null}

      {mode === 'month' ? (
        <MonthGrid year={year} month={month} min={min} max={max} onPick={pickMonth} />
      ) : null}

      {mode === 'year' ? (
        <YearGrid firstYear={firstYear} lastYear={lastYear} year={year} onPick={pickYear} />
      ) : null}

      <Pressable accessibilityRole="button" hitSlop={8} onPress={onClose} style={styles.cancelRow}>
        <Text style={styles.cancel}>Cancel</Text>
      </Pressable>
    </Animated.View>
  );
}

function DayGrid({ year, month, min, max, today, selected, onPick }) {
  const cells = buildMonthGrid(year, month);

  return (
    <View>
      {/* Skipped by the reader — nobody needs "S M T W T F S" spelled out. */}
      <View
        style={styles.weekRow}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {WEEKDAY_INITIALS.map((initial, index) => (
          <View key={index} style={styles.cell}>
            <Text style={styles.weekday}>{initial}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, index) => {
          if (!day) return <View key={index} style={styles.cell} />;

          const disabled = compareDay(day, min) < 0 || compareDay(day, max) > 0;
          const isSelected = isSameDay(day, selected);
          const isToday = isSameDay(day, today);

          return (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={formatDateLong(formatDate(day))}
              accessibilityState={{ selected: isSelected, disabled }}
              disabled={disabled}
              onPress={() => onPick(day)}
              style={({ pressed }) => [
                styles.cell,
                styles.dayCell,
                isToday && !isSelected && styles.todayCell,
                isSelected && styles.selectedCell,
                pressed && !isSelected && !disabled && styles.pressedCell,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  isToday && !isSelected && styles.todayText,
                  isSelected && styles.selectedText,
                  disabled && styles.disabledText,
                ]}
              >
                {day.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MonthGrid({ year, month, min, max, onPick }) {
  return (
    <View style={styles.grid}>
      {MONTH_NAMES.map((name, index) => {
        // Out of range only when the whole month falls outside it.
        const last = new Date(year, index, daysInMonth(year, index));
        const first = new Date(year, index, 1);
        const disabled = compareDay(last, min) < 0 || compareDay(first, max) > 0;
        const isSelected = index === month;

        return (
          <Pressable
            key={name}
            accessibilityRole="button"
            accessibilityLabel={`${name} ${year}`}
            accessibilityState={{ selected: isSelected, disabled }}
            disabled={disabled}
            onPress={() => onPick(index)}
            style={({ pressed }) => [
              styles.wideCell,
              isSelected && styles.selectedCell,
              pressed && !isSelected && !disabled && styles.pressedCell,
            ]}
          >
            <Text
              style={[
                styles.wideText,
                isSelected && styles.selectedText,
                disabled && styles.disabledText,
              ]}
            >
              {name.slice(0, 3)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function YearGrid({ firstYear, lastYear, year, onPick }) {
  const scroll = useRef(null);

  // Newest first: a child born recently is at the top, not a century down.
  const years = [];
  for (let value = lastYear; value >= firstYear; value -= 1) years.push(value);

  const offset = Math.floor(years.indexOf(year) / 3) * YEAR_ROW_HEIGHT;

  return (
    <ScrollView
      ref={scroll}
      style={styles.yearScroll}
      contentContainerStyle={styles.grid}
      // iOS honours contentOffset on mount; Android and web need the imperative call.
      contentOffset={{ x: 0, y: offset }}
      onLayout={() => scroll.current?.scrollTo({ y: offset, animated: false })}
    >
      {years.map((value) => {
        const isSelected = value === year;
        return (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onPick(value)}
            style={({ pressed }) => [
              styles.wideCell,
              isSelected && styles.selectedCell,
              pressed && !isSelected && styles.pressedCell,
            ]}
          >
            <Text style={[styles.wideText, isSelected && styles.selectedText]}>{value}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/**
 * Date picker in a modal. The app ships no calendar library and @expo/ui's
 * picker renders nothing on web, so this is drawn from views the same way the
 * chevron in Caret and the seal in BrandMark are.
 *
 * A real Modal rather than an inline panel because the forms it serves sit
 * inside AuthLayout's ScrollView, which would clip an absolutely-placed
 * sibling. Modal portals out of the tree on all three platforms.
 */
export default function CalendarSheet({ visible, value, minimumDate, maximumDate, onSelect, onClose }) {
  const max = maximumDate ?? startOfDay(new Date());
  const min = minimumDate ?? new Date(max.getFullYear() - 100, max.getMonth(), max.getDate());

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
      // Required on Android: BackHandler does not fire while a modal is open,
      // so this is the only hardware-back path. Web maps Escape onto it.
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        {/* A sibling behind the card, never its parent: nesting works on native,
            but on web the click bubbles up from the card and every day tap
            would dismiss the dialog. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close date picker"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        {visible ? (
          <CalendarCard
            value={value}
            min={min}
            max={max}
            onSelect={onSelect}
            onClose={onClose}
          />
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.scrim,
  },
  /** Centred with a margin, so it never has to reason about notches. */
  card: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '86%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrow: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Kept in the layout so the title does not slide when the arrows go. */
  arrowHidden: {
    opacity: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  title: {
    ...typography.serifMd,
    color: colors.ink,
  },

  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekday: {
    ...typography.overline,
    color: colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  /** Sevenths of the row — flex-sized, so large type never breaks the columns. */
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCell: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayText: {
    ...typography.body,
    color: colors.text,
  },
  todayCell: {
    borderColor: colors.gold,
  },
  todayText: {
    color: colors.primary,
    fontWeight: '600',
  },
  selectedCell: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectedText: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
  pressedCell: {
    backgroundColor: colors.field,
  },
  disabledText: {
    color: colors.borderStrong,
  },

  /** Months and years share a roomier three-up cell. */
  wideCell: {
    width: `${100 / 3}%`,
    height: YEAR_ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  wideText: {
    ...typography.body,
    color: colors.text,
  },
  yearScroll: {
    maxHeight: YEAR_ROW_HEIGHT * 6,
  },

  cancelRow: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
  },
  cancel: {
    ...typography.label,
    color: colors.textMuted,
  },
});
