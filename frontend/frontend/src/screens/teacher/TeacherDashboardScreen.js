import PlaceholderNote from '../../components/common/PlaceholderNote';
import ScreenContainer from '../../components/common/ScreenContainer';

export default function TeacherDashboardScreen() {
  return (
    <ScreenContainer title="Dashboard" subtitle="Your classes and enrolled students.">
      <PlaceholderNote>GET /teacher-dashboard/</PlaceholderNote>
    </ScreenContainer>
  );
}
