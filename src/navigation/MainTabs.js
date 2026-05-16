import { Ionicons } from "@expo/vector-icons";
import { Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useRef } from "react";

import ChatListPage from "../pages/ChatListPage";
import MatchesPage from "../pages/MatchesPage";
import ProfilePage from "../pages/ProfilePage";
import SwipePage from "../pages/SwipePage";
import LocalizationPage from "../pages/LocalizationPage";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { newUser, setNewUser } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const redirected = useRef(false);

  useEffect(() => {
    if (newUser && !redirected.current) {
      redirected.current = true;
      setNewUser(false);
      setTimeout(() => navigation.navigate("ProfileEdit"), 400);
    }
  }, [newUser]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "black",
          borderTopColor: "#222",
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: "#22c55e",
        tabBarInactiveTintColor: "#16a34a",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={SwipePage}
        options={{
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatListPage}
        options={{
          tabBarLabel: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
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
              style={{
                width: size,
                height: size,
                tintColor: focused ? '#22c55e' : '#16a34a',
                resizeMode: 'contain',
              }}
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
            <Ionicons name="map" size={size} color={color} />
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
