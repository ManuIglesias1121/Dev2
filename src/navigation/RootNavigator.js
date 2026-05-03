import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";

import AppNavigator from "./AppNavigator";
import AuthStack from "./AuthStack";

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}
