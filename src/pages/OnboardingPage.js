import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";

const ONBOARDING_SCREENS = [
  {
    id: 1,
    icon: "🐺",
    title: "Bienvenido a la Manada",
    subtitle: "Therianthrope Dating",
    description:
      "Un lugar especial para conectar con otros theriantropos. Encuentra tu pareja en la manada.",
  },
  {
    id: 2,
    icon: "🔥",
    title: "Descubre & Conecta",
    subtitle: "Swipe Mode",
    description:
      "Desliza para encontrar personas compatibles. Cada match es una oportunidad.",
  },
  {
    id: 3,
    icon: "💬",
    title: "Chat Único & Personal",
    subtitle: "Una Conversación Especial",
    description:
      "Cuando encuentra a alguien especial, tienes un chat exclusivo para profundizar la conexión.",
  },
  {
    id: 4,
    icon: "🎁",
    title: "Desbloquea Funciones",
    subtitle: "Planes & Regalos",
    description:
      "Compra regalos especiales o activa un plan para desbloquear nuevas características.",
  },
  {
    id: 5,
    icon: "🏆",
    title: "Sube de Nivel",
    subtitle: "Achievements & Rewards",
    description:
      "Desbloquea logros, gana monedas, y mira crecer tu relación día a día.",
  },
];

export default function OnboardingPage() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SCREENS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate("DiscoveryPage");
    }
  };

  const handleSkip = () => {
    navigation.navigate("DiscoveryPage");
  };

  const screen = ONBOARDING_SCREENS[currentIndex];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a1a2e", "#0f172a"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Skip Button */}
      {currentIndex < ONBOARDING_SCREENS.length - 1 && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Saltar</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Animated defaultValue={0}>
          <Text style={styles.icon}>{screen.icon}</Text>
        </Animated>

        <Text style={styles.title}>{screen.title}</Text>
        <Text style={styles.subtitle}>{screen.subtitle}</Text>
        <Text style={styles.description}>{screen.description}</Text>

        {/* Dots */}
        <View style={styles.dotsContainer}>
          {ONBOARDING_SCREENS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        {currentIndex > 0 && (
          <TouchableOpacity
            style={[styles.btn, styles.backBtn]}
            onPress={() => setCurrentIndex(currentIndex - 1)}
          >
            <Text style={styles.btnText}>← Atrás</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.btn, styles.nextBtn]}
          onPress={handleNext}
        >
          <Text style={styles.btnText}>
            {currentIndex === ONBOARDING_SCREENS.length - 1
              ? "Empezar →"
              : "Siguiente →"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    paddingTop: 40,
  },
  skipBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    color: "#888",
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 80,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#16a34a",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 40,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  activeDot: {
    backgroundColor: "#16a34a",
    width: 24,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  nextBtn: {
    backgroundColor: "#22c55e",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
