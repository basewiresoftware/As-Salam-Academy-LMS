import PlaceholderNote from '../../components/common/PlaceholderNote';
import ScreenContainer from '../../components/common/ScreenContainer';

export default function MyClassesScreen() {
  return (
    <ScreenContainer title="My classes" subtitle="Courses you are assigned to teach.">
      <PlaceholderNote>Courses come back with the teacher dashboard payload.</PlaceholderNote>
    </ScreenContainer>
  );
}
