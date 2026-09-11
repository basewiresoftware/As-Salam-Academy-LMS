import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MyClassesScreen from '../screens/teacher/MyClassesScreen';
import TeacherDashboardScreen from '../screens/teacher/TeacherDashboardScreen';

const Stack = createNativeStackNavigator();

export default function TeacherNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
      <Stack.Screen name="MyClasses" component={MyClassesScreen} />
    </Stack.Navigator>
  );
}
