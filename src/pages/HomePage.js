import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import SwipeCard from "../components/SwipeCard";
import { fakeProfiles } from "../data/fakeProfiles";

export default function HomePage() {
  const [index, setIndex] = useState(0);
  const navigation = useNavigation();

  const currentProfile = fakeProfiles[index];

  const handleNope = () => {
    setIndex((prev) => prev + 1);
  };

  const handleLike = () => {
    setIndex((prev) => prev + 1);
  };

  const handleSuper = () => {
    console.log("SuperLike a:", currentProfile.display_name);
    setIndex((prev) => prev + 1);
  };

  // 🟩 NUEVO: abrir galería
  const handleOpenGallery = (profile) => {
    navigation.navigate("GalleryPage", { photos: profile.photos });
  };

  // 🟩 NUEVO: abrir perfil detalle
  const handleOpenProfile = (profile) => {
    navigation.navigate("ProfileDetail", { profile });
  };

  if (!currentProfile) {
    return (
      <View style={styles.center}>
        <Text style={styles.endText}>No hay más perfiles</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#16a34a", "#0a0a0a", "#000"]}
      style={styles.container}
    >
      <SwipeCard
        profile={currentProfile}
        onNope={handleNope}
        onLike={handleLike}
        onSuper={handleSuper}
        onOpenGallery={handleOpenGallery}
        onOpenProfile={handleOpenProfile}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  endText: {
    color: "white",
    fontSize: 22,
    opacity: 0.7,
  },
});
