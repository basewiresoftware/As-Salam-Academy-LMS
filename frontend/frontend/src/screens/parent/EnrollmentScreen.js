import PlaceholderNote from '../../components/common/PlaceholderNote';
import ScreenContainer from '../../components/common/ScreenContainer';

export default function EnrollmentScreen() {
  return (
    <ScreenContainer title="Enroll" subtitle="Pick a course for your child.">
      <PlaceholderNote>GET /courses/ to list Youth Group and Hifz classes.</PlaceholderNote>
    </ScreenContainer>
  );
}
