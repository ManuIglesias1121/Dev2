import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { useAuth } from "../contexts/AuthContext";

import AppNavigator from "./AppNavigator";
import AuthStack from "./AuthStack";

export default function RootNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}
