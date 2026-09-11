import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * One-shot mount animation: fades and lifts its children into place. Pass an
 * `index` so a stack of siblings staggers instead of arriving all at once.
 * This is the page-load choreography, not a per-row gimmick — keep it to the
 * handful of blocks that define a screen's first impression.
 */
export default function Reveal({ children, index = 0, delay = 0, distance = 16, style }) {
  // Lazy state, not a ref: the value is read while rendering the style below.
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 520,
      delay: delay + index * 90,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    // Mount-only on purpose: re-running it would replay the entrance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [distance, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
