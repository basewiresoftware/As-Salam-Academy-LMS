import PlaceholderNote from '../../components/common/PlaceholderNote';
import ScreenContainer from '../../components/common/ScreenContainer';

export default function AdminDashboardScreen() {
  return (
    <ScreenContainer title="Admin" subtitle="Academy-wide overview.">
      <PlaceholderNote>No dedicated route yet — needs an admin summary endpoint.</PlaceholderNote>
    </ScreenContainer>
  );
}
