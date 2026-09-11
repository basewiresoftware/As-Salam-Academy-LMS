import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AuthLayout from '../../components/common/AuthLayout';
import FormBanner from '../../components/common/FormBanner';
import PrimaryButton from '../../components/common/PrimaryButton';
import SegmentedField from '../../components/common/SegmentedField';
import TextField from '../../components/common/TextField';
import { ROLES } from '../../constants/roles';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

/**
 * Testing affordance: until the backend returns the role on the token, the
 * signer-in picks which portal to land in.
 */
const ROLE_OPTIONS = [
  { label: 'Parent', value: ROLES.PARENT },
  { label: 'Teacher', value: ROLES.TEACHER },
  { label: 'Admin', value: ROLES.ADMIN },
];

export default function LoginScreen({ navigation }) {
  const { login, isLoading } = useAuth();
  const [role, setRole] = useState(ROLES.PARENT);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const canSubmit = username.trim().length > 0 && password.length > 0;

  async function handleSubmit() {
    setError(null);

    try{
      if(role === ROLES.ADMIN) {
        // Admin-specific login logic here
      }
      else if(role === ROLES.PARENT) {
        // Parent-specific login logic here
      } else if(role === ROLES.TEACHER) {
        // Teacher-specific login logic here
      } 
    } catch (roleError) {
      setError(roleError.message);
      return;
    }
    

    try {
      await login(username.trim(), password, role);
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <AuthLayout
      eyebrow="Parent and teacher portal"
      title={'Sign in to your\nfamily portal.'}
      subtitle="One account holds every child — enrolment, attendance and fees stay in the same place, term after term."
      notice={'Every child’s Qur’an journey,\nheld in one family account.'}
      noticeCaption="New to the academy? Register once and add each child from the portal."
      footer={
        <Pressable onPress={() => navigation.navigate('Register')} hitSlop={8}>
          <Text style={styles.footerText}>
            New family here? <Text style={styles.footerLink}>Create an account</Text>
          </Text>
        </Pressable>
      }
    >
      <SegmentedField
        label="*FOR TESTING PURPOSES* Signing in as"
        options={ROLE_OPTIONS}
        value={role}
        onChange={setRole}
      />

      <TextField
        label="Username"
        value={username}
        onChangeText={setUsername}
        placeholder="your.username"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        returnKeyType="next"
      />

      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        returnKeyType="go"
        onSubmitEditing={canSubmit ? handleSubmit : undefined}
      />

      <FormBanner message={error} />

      <View style={styles.submit}>
        <PrimaryButton
          label="Sign in to the portal"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={!canSubmit}
        />
        <Pressable
          onPress={() => navigation.navigate('ForgotPassword')}
          hitSlop={8}
          style={styles.forgotWrap}
        >
          <Text style={styles.forgot}>Forgot password?</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  submit: {
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  forgotWrap: {
    alignSelf: 'flex-start',
  },
  forgot: {
    ...typography.label,
    color: colors.textMuted,
  },
  footerText: {
    ...typography.body,
    color: colors.textMuted,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
