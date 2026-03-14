import React, { createContext, useState } from "react";

export const AuthContext = createContext({
  screen: "splash",
  setScreen: () => {},

  selectedProfile: null,
  setSelectedProfile: () => {},

  user: null,
  setUser: () => {},

  signIn: () => {},
  signInAsGuest: () => {},
  goToRegister: () => {},
});

export function AuthProvider({ children }) {
  const [screen, setScreen] = useState("splash");
  const [selectedProfile, setSelectedProfile] = useState(null);

  // 🔥 Usuario simulado (necesario para ChatRoomPage)
  const [user, setUser] = useState({ id: "demo-user" });

  const signIn = () => setScreen("app");
  const signInAsGuest = () => setScreen("app");
  const goToRegister = () => setScreen("register");

  return (
    <AuthContext.Provider
      value={{
        screen,
        setScreen,

        selectedProfile,
        setSelectedProfile,

        user,
        setUser,

        signIn,
        signInAsGuest,
        goToRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
