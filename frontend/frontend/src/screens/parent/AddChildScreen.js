import PlaceholderNote from '../../components/common/PlaceholderNote';
import ScreenContainer from '../../components/common/ScreenContainer';

export default function AddChildScreen() {
  return (
    <ScreenContainer title="Add a child" subtitle="Register a child before enrolling them in a course.">
      <PlaceholderNote>POST /children/ with first_name, last_name, date_of_birth, gender.</PlaceholderNote>
    </ScreenContainer>
  );
}
