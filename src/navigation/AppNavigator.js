import React, { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";

import ChatRoomPage from "../pages/ChatRoomPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import LoginPage from "../pages/LoginPage";
import ProfileDetailPage from "../pages/ProfileDetailPage";
import RegisterPage from "../pages/RegisterPage";
import SplashScreen from "../pages/SplashScreen";
import MainTabs from "./MainTabs";

export default function AppNavigator() {
  const { screen, setScreen, selectedProfile } = useContext(AuthContext);

  useEffect(() => {
    if (screen === "splash") {
      setTimeout(() => setScreen("login"), 1500);
    }
  }, []);

  if (screen === "splash")
    return <SplashScreen onFinish={() => setScreen("login")} />;

  if (screen === "login") return <LoginPage />;

  if (screen === "register") return <RegisterPage />;

  if (screen === "forgot") return <ForgotPasswordPage />;

  if (screen === "profileDetail")
    return <ProfileDetailPage profile={selectedProfile} />;

  if (screen === "chatRoom")
    return <ChatRoomPage />;

  if (screen === "app") return <MainTabs />;

  return null;
}
