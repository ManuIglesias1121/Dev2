import React, { useContext } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../contexts/AuthContext";

export default function ProfileDetailPage({ profile }) {
  const { setScreen } = useContext(AuthContext);

  if (!profile) return null;

  return (
    <View style={{ flex: 1, backgroundColor: "black", padding: 20 }}>
      <Image
        source={{ uri: profile.avatar }}
        style={{
          width: "100%",
          height: 300,
          borderRadius: 20,
          marginBottom: 20,
        }}
      />

      <Text
        style={{
          color: "white",
          fontSize: 30,
          fontWeight: "bold",
        }}
      >
        {profile.name}
      </Text>

      <Text
        style={{
          color: "#888",
          fontSize: 18,
          marginTop: 10,
          marginBottom: 40,
        }}
      >
        {profile.species}
      </Text>

      {/* BOTÓN PARA VOLVER A LA APP */}
      <TouchableOpacity
        onPress={() => setScreen("app")}
        style={{
          backgroundColor: "#22c55e",
          padding: 15,
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        <Text
          style={{
            color: "black",
            textAlign: "center",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          Volver a la app
        </Text>
      </TouchableOpacity>
    </View>
  );
}
