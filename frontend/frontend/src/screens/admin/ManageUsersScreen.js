import PlaceholderNote from '../../components/common/PlaceholderNote';
import ScreenContainer from '../../components/common/ScreenContainer';

export default function ManageUsersScreen() {
  return (
    <ScreenContainer title="Users" subtitle="Students, teachers, parents and admins.">
      <PlaceholderNote>No list endpoint yet — needs a users route in api/urls.py.</PlaceholderNote>
    </ScreenContainer>
  );
}
