import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

import HomePage from "../pages/HomePage";
import MatchesPage from "../pages/MatchesPage";
import ProfilePage from "../pages/ProfilePage";
import VisitorsPage from "../pages/VisitorsPage";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { selectedProfile: profile } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "black",
          borderTopColor: "#222",
          height: 75,
          paddingBottom: 15,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#22c55e",
        tabBarInactiveTintColor: "#777",
        tabBarLabelStyle: {
          fontSize: 13,
          marginBottom: 5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Matches"
        component={MatchesPage}
        options={{
          tabBarLabel: "Matches",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="paw-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Visitors"
        component={VisitorsPage}
        options={{
          tabBarLabel: profile?.is_premium ? "Visitantes" : "Premium",
          tabBarIcon: ({ color, size }) =>
            profile?.is_premium ? (
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
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
