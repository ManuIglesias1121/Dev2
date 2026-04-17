import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomePage from "../pages/HomePage";
import ProfilePage from "../pages/ProfilePage";
import OnboardingPage from "../pages/OnboardingPage";
import DiscoveryPage from "../pages/DiscoveryPage";
import AchievementsPage from "../pages/AchievementsPage";
import PremiumPlansPage from "../pages/PremiumPlansPage";
import GiftShopPage from "../pages/GiftShopPage";
import ChatRoomPage from "../pages/ChatRoomPage";
import LocalizationPage from "../pages/LocalizationPage";

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingPage} />
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="Profile" component={ProfilePage} />
      <Stack.Screen name="DiscoveryPage" component={DiscoveryPage} />
      <Stack.Screen name="LocalizationPage" component={LocalizationPage} />
      <Stack.Screen name="AchievementsPage" component={AchievementsPage} />
      <Stack.Screen name="PremiumPlansPage" component={PremiumPlansPage} />
      <Stack.Screen name="GiftShopPage" component={GiftShopPage} />
      <Stack.Screen name="ChatRoomPage" component={ChatRoomPage} />
    </Stack.Navigator>
  );
}
