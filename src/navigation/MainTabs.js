import { Ionicons } from "@expo/vector-icons";
import { Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet } from "react-native";
import { useAuth } from "../contexts/AuthContext";

import ChatListPage from "../pages/ChatListPage";
import MatchesPage from "../pages/MatchesPage";
import PremiumPage from "../pages/PremiumPage";
import ProfilePage from "../pages/ProfilePage";
import VisitorsPage from "../pages/VisitorsPage";
import SuperMatchInbox from "../screens/SuperMatchInbox";
import SwipePage from "../pages/SwipePage";
import LocalizationPage from "../pages/LocalizationPage";

const Tab = createBottomTabNavigator();

function VisitorsTab() {
  const { user } = useAuth();
  return user?.isPremium ? <VisitorsPage /> : <PremiumPage />;
}

export default function MainTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "black",
          borderTopColor: "#222",
          height: 86,
          paddingBottom: 18,
          paddingTop: 8,
        },
        tabBarItemStyle: {
          paddingTop: 4,
          paddingBottom: 6,
        },
        tabBarIconStyle: {
          marginTop: -22,
        },
        tabBarActiveTintColor: "#16a34a",
        tabBarInactiveTintColor: "#16a34a",
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
          marginTop: 0,
        },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={SwipePage}
        options={{
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} style={styles.tabIcon} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatListPage}
        options={{
          tabBarLabel: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} style={styles.tabIcon} />
          ),
        }}
      />

      <Tab.Screen
        name="Matches"
        component={MatchesPage}
        options={{
          tabBarLabel: "Matches",
          tabBarIcon: ({ color, size, focused }) => (
            <Image
              source={require('../../assets/Maches.png')}
              style={[
                styles.tabIcon,
                {
                  width: size,
                  height: size,
                  tintColor: focused ? '#16a34a' : '#16a34a',
                  resizeMode: 'contain',
                },
              ]}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Localizacion"
        component={LocalizationPage}
        options={{
          tabBarLabel: "Mapa",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} style={styles.tabIcon} />
          ),
        }}
      />

      <Tab.Screen
        name="SuperMatchInbox"
        component={SuperMatchInbox}
        options={{
          tabBarLabel: "Super",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Visitors"
        component={VisitorsTab}
        options={{
          tabBarLabel: user?.isPremium ? "Visitantes" : "Premium",
          tabBarIcon: ({ color, size }) =>
            user?.isPremium ? (
              <Ionicons name="eye" size={size} color={color} />
            ) : (
              <Ionicons name="lock-closed" size={size} color={color} />
            ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfilePage}
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} style={styles.tabIcon} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    marginTop: -18,
  },
});
