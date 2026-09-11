import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ManageCoursesScreen from '../screens/admin/ManageCoursesScreen';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';

const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
      <Stack.Screen name="ManageCourses" component={ManageCoursesScreen} />
    </Stack.Navigator>
  );
}
