import PlaceholderNote from '../../components/common/PlaceholderNote';
import ScreenContainer from '../../components/common/ScreenContainer';

export default function ForgotPasswordScreen() {
  return (
    <ScreenContainer title="Reset password" subtitle="We will email you a reset link.">
      <PlaceholderNote>No backend route yet — needs a password-reset endpoint in api/urls.py.</PlaceholderNote>
    </ScreenContainer>
  );
}
