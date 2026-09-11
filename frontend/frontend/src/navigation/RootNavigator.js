import { ROLES } from '../constants/roles';
import { useAuth } from '../context/AuthContext';
import AdminNavigator from './AdminNavigator';
import AuthNavigator from './AuthNavigator';
import ParentNavigator from './ParentNavigator';
import TeacherNavigator from './TeacherNavigator';
import PaymentScreen from '../screens/parent/PaymentScreen';

/**
 * Picks the navigator for whoever is signed in. Student screens are not
 * scaffolded yet, so role '0' falls through to the auth stack.
 */
export default function RootNavigator() {
  const { user, role, needsPayment } = useAuth();

  if (!user) {
    return <AuthNavigator />;
  }

  switch (role) {
    case ROLES.PARENT:
      // Payment stands in front of the dashboard rather than being a screen
      // inside it: clearing the flag swaps the tree, which is the same way
      // signing in moves you. Nothing here calls navigate().
      return needsPayment ? <PaymentScreen /> : <ParentNavigator />;
    case ROLES.TEACHER:
      return <TeacherNavigator />;
    case ROLES.ADMIN:
      return <AdminNavigator />;
    default:
      return <AuthNavigator />;
  }
}
