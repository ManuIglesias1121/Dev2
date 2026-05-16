import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import GalleryPage from "../pages/GalleryPage";
import MainTabs from "./MainTabs";
import ProfileDetailPage from "../screens/ProfileDetail";
import ChatRoomPage from "../pages/ChatRoomPage";
import SuperMatchDetail from "../screens/SuperMatchDetail";
import ProfileEditPage from "../pages/ProfileEditPage";
import SettingsPage from "../pages/SettingsPage";
import AchievementsPage from "../pages/AchievementsPage";
import GiftShopPage from "../pages/GiftShopPage";
import PremiumPlansPage from "../pages/PremiumPlansPage";
import SafetyCenter from "../screens/SafetyCenter";
import SafeDateMode from "../screens/SafeDateMode";
import SoundSettings from "../screens/SoundSettings";
import SuperMatchInbox from "../screens/SuperMatchInbox";
import VisitorsPage from "../pages/VisitorsPage";
import PremiumPage from "../pages/PremiumPage";
import EventsListPage from "../pages/EventsListPage";
import EventCreatePage from "../pages/EventCreatePage";
import EventDetailPage from "../pages/EventDetailPage";
import { useAuth } from "../contexts/AuthContext";

// Wrapper para Visitors que muestra Premium si no es premium
function VisitorsScreen() {
  const { user } = useAuth();
  return user?.isPremium ? <VisitorsPage /> : <PremiumPage />;
}

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="GalleryPage" component={GalleryPage} />
      <Stack.Screen name="ProfileDetail" component={ProfileDetailPage} />
      <Stack.Screen name="ChatRoomPage" component={ChatRoomPage} />
      <Stack.Screen name="SuperMatchDetail" component={SuperMatchDetail} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditPage} />
      <Stack.Screen name="Settings" component={SettingsPage} />
      <Stack.Screen name="AchievementsPage" component={AchievementsPage} />
      <Stack.Screen name="GiftShopPage" component={GiftShopPage} />
      <Stack.Screen name="GiftShop" component={GiftShopPage} />
      <Stack.Screen name="PremiumPlans" component={PremiumPlansPage} />
      <Stack.Screen name="SafetyCenter" component={SafetyCenter} />
      <Stack.Screen name="SafeDateMode" component={SafeDateMode} />
      <Stack.Screen name="SoundSettings" component={SoundSettings} />
      <Stack.Screen name="SuperMatchInbox" component={SuperMatchInbox} />
      <Stack.Screen name="Visitors" component={VisitorsScreen} />
      <Stack.Screen name="Events" component={EventsListPage} />
      <Stack.Screen name="EventCreate" component={EventCreatePage} />
      <Stack.Screen name="EventDetail" component={EventDetailPage} />
    </Stack.Navigator>
  );
}

