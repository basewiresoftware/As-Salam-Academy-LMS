import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import PrimaryButton from '../../components/common/PrimaryButton';
import ScreenContainer from '../../components/common/ScreenContainer';
import TextField from '../../components/common/TextField';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

/**
 * Stands between a newly registered family and their dashboard.
 *
 * The charge is a mock: nothing here is validated or sent anywhere, and there
 * is no payment record on the backend yet. Clearing the flag is what moves the
 * family on — RootNavigator swaps this screen for the parent stack — so this
 * screen takes no `navigation` prop and calls no navigate().
 */
export default function PaymentScreen() {
  const { markPaid, logout } = useAuth();

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  const complete = Boolean(cardNumber.trim() && expiryDate.trim() && cvv.trim());

  function handlePayment() {
    setLoading(true);
    Alert.alert(
      "Payment successful",
      "Your payment has been processed.",
      [
        { text: "OK", onPress: () => console.log("OK Pressed") }
      ]
    );

    // Stands in for a gateway round trip. markPaid() unmounts this screen, so
    // there is nothing to reset afterwards and no loading state to clear.
    setTimeout(() => {
      markPaid();
    }, 2000);
  }

  return (
    <ScreenContainer
      title="One last step"
      subtitle="Confirm payment to finish setting up your family's account."
    >
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Amount due today</Text>
        <Text style={styles.summaryValue}>$150.00</Text>
        <Text style={styles.summaryNote}>
          A demo charge — no card is contacted and nothing is stored.
        </Text>
      </View>

      <TextField
        label="Card number"
        value={cardNumber}
        onChangeText={setCardNumber}
        placeholder="4242 4242 4242 4242"
        keyboardType="number-pad"
      />
      <View style={styles.row}>
        <View style={styles.rowItem}>
          <TextField
            label="Expiry"
            hint="MM/YY"
            value={expiryDate}
            onChangeText={setExpiryDate}
            placeholder="04/28"
          />
        </View>
        <View style={styles.rowItem}>
          <TextField
            label="CVV"
            value={cvv}
            onChangeText={setCvv}
            placeholder="123"
            keyboardType="number-pad"
            secureTextEntry
          />
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Pay $150.00"
          onPress={handlePayment}
          loading={loading}
          disabled={!complete}
        />
        {/* The gate has no header and no back, so this is the only way out. */}
        <Pressable onPress={logout} hitSlop={8} style={styles.signOutRow} disabled={loading}>
          <Text style={styles.signOut}>Sign out and finish later</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summary: {
    backgroundColor: colors.primaryTint,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  summaryLabel: {
    ...typography.overline,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  summaryValue: {
    ...typography.serifMd,
    color: colors.ink,
  },
  summaryNote: {
    ...typography.caption,
    color: colors.textMuted,
  },

  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
  },

  actions: {
    marginTop: spacing.sm,
    gap: spacing.sm + 4,
  },
  signOutRow: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  signOut: {
    ...typography.label,
    color: colors.textMuted,
  },
});
