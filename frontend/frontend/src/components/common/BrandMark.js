import { StyleSheet, View } from 'react-native';

import { colors } from '../../constants/theme';

/**
 * Stand-in for the Masjid As-Salam seal, drawn with views so the app has no
 * missing-asset hole. Once the real artwork is in the repo, drop the PNG at
 * assets/images/logo.png and replace the body of this component with:
 *
 *   <Image source={require('../../../assets/images/logo.png')}
 *          style={{ width: size, height: size }} contentFit="contain" />
 *
 * Every caller keeps working — the size prop is the whole API.
 */
export default function BrandMark({ size = 76 }) {
  return (
    <View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size / 2, borderWidth: size * 0.04 },
      ]}
    >
      <View style={styles.dome}>
        <View style={[styles.finial, { height: size * 0.1, width: Math.max(2, size * 0.03) }]} />
        <View
          style={[
            styles.cupola,
            {
              width: size * 0.44,
              height: size * 0.3,
              borderTopLeftRadius: size * 0.22,
              borderTopRightRadius: size * 0.22,
            },
          ]}
        />
        <View style={[styles.base, { width: size * 0.54, height: size * 0.07 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    backgroundColor: colors.primary,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dome: {
    alignItems: 'center',
  },
  finial: {
    backgroundColor: colors.goldLight,
    borderRadius: 2,
  },
  cupola: {
    backgroundColor: colors.gold,
  },
  base: {
    backgroundColor: colors.goldLight,
    borderRadius: 2,
    marginTop: 2,
  },
});
