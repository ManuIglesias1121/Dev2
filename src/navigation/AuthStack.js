import { createStackNavigator } from "@react-navigation/stack";
import LoginPage from "../pages/LoginPage";
import RecoverPassword from "../pages/RecoverPassword";

const Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="RecoverPassword" component={RecoverPassword} />
    </Stack.Navigator>
  );
}
