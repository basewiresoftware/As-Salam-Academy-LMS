import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AddChildScreen from '../screens/parent/AddChildScreen';
import ChildrenListScreen from '../screens/parent/ChildrenListScreen';
import EnrollmentScreen from '../screens/parent/EnrollmentScreen';
import ParentDashboardScreen from '../screens/parent/ParentDashboardScreen';

const Stack = createNativeStackNavigator();

export default function ParentNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
      <Stack.Screen name="ChildrenList" component={ChildrenListScreen} />
      <Stack.Screen name="AddChild" component={AddChildScreen} />
      <Stack.Screen name="Enrollment" component={EnrollmentScreen} />
      {/* Payment is not here: RootNavigator shows it in front of this whole
          stack while a family still owes, so it is never a route within it. */}
    </Stack.Navigator>
  );
}
