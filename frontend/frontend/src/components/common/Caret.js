import { View } from 'react-native';

import { colors } from '../../constants/theme';

const ROTATION = {
  down: '45deg',
  up: '-135deg',
  right: '-45deg',
  left: '135deg',
};

/**
 * A chevron drawn from two borders. The app ships no icon font, so small
 * glyphs are built out of views the same way the seal in BrandMark is.
 */
export default function Caret({ direction = 'down', size = 9, color = colors.primary, weight = 2 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRightWidth: weight,
        borderBottomWidth: weight,
        borderColor: color,
        transform: [{ rotate: ROTATION[direction] }],
      }}
    />
  );
}
