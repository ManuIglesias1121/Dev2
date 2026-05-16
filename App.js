import React, { useEffect, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts, Satisfy_400Regular } from "@expo-google-fonts/satisfy";
import { AuthProvider } from "./src/contexts/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { setupNotifications } from "./src/services/notificationService";
import SafetyOnboardingModal from "./src/components/SafetyOnboardingModal";
import { useGlobalChatNotifications } from "./src/hooks/useGlobalChatNotifications";

// Componente interno: corre dentro de AuthProvider para tener acceso al user
function AppInner() {
  useGlobalChatNotifications();
  return (
    <>
      <RootNavigator />
      <SafetyOnboardingModal />
    </>
  );
}

export default function App() {
  const notifListener = useRef();
  const responseListener = useRef();

  const [fontsLoaded] = useFonts({ Satisfy_400Regular });

  useEffect(() => {
    setupNotifications().then((token) => {
      if (token) console.log("Push token:", token);
    });

    return () => {
      notifListener.current?.remove?.();
      responseListener.current?.remove?.();
    };
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: "black", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#22c55e" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
