import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import PolaroidFrame from "./PolaroidFrame"; // ← IMPORTANTE

function resolveSource(img) {
  if (!img) return require("../../assets/logo1.png");
  return typeof img === "string" ? { uri: img } : img;
}

export default function ProfileCard({ profile }) {
  if (!profile) return null;
  // Detectar si es premium (por ahora, si tiene isPremium true)
  const isPremium = profile.isPremium;

  return (
    <View style={styles.card}>
      {/* FOTO PRINCIPAL EN POLAROID */}
      <PolaroidFrame
        source={resolveSource(profile.photos?.[0] || profile.avatar)}
        name={profile.display_name || profile.name || "Sin nombre"}
        isPremium={isPremium}
        bio={profile.biography || profile.bio}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    borderRadius: 22,
    padding: 0,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#222",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    flexDirection: 'column',
    width: '100%',
  },

  // ⛔ Ya no usamos imageWrapper ni avatar
  // pero los dejo acá por si querés volver atrás
  imageWrapper: {},
  avatar: {},

  name: {
    color: "white",
    fontSize: 30,
    fontWeight: "700",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  bioDancing: {
    fontFamily: 'Satisfy_400Regular',
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.08)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  speciesTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff10",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  speciesIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    marginRight: 6,
  },
  speciesText: {
    color: "#ccc",
    fontSize: 16,
    fontWeight: "500",
  },
  separator: {
    width: "80%",
    height: 1,
    backgroundColor: "#333",
    marginVertical: 16,
  },
  bio: {
    color: "#bbb",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 20,
  },
});
