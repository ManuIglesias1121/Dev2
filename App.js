import React, { useEffect, useRef } from "react";
import { AuthProvider } from "./src/contexts/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { setupNotifications } from "./src/services/notificationService";

export default function App() {
  const notifListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    setupNotifications().then((token) => {
      if (token) console.log("Push token:", token);
    });

    return () => {
      notifListener.current?.remove?.();
      responseListener.current?.remove?.();
    };
  }, []);

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
