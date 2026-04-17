import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Modal } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

const MOODS = {
  neutral: {
    name: "Neutral",
    icon: "😐",
    colors: ["#1a1a2e", "#312e81"],
    description: "Modo normal",
  },
  romantic: {
    name: "Romántico",
    icon: "😍",
    colors: ["#2d1b26", "#4a2543"],
    description: "Vibes románticas",
  },
  playful: {
    name: "Juguetón",
    icon: "😄",
    colors: ["#1a2b1a", "#2d4d2d"],
    description: "Diversión y risas",
  },
  mysterious: {
    name: "Misterioso",
    icon: "😎",
    colors: ["#1a1f2e", "#1f2a42"],
    description: "Energía misteriosa",
  },
  passionate: {
    name: "Apasionado",
    icon: "🔥",
    colors: ["#2e1a1a", "#4a2020"],
    description: "Fuego y pasión",
  },
};

export function MoodSelector() {
  const { user, setMood } = useAuth();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.moodButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.moodButtonText}>
          {MOODS[user?.mood || "neutral"]?.icon}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Elige tu Mood 🎭</Text>
            <Text style={styles.modalSubtitle}>
              Cambia la vibra de tu chat
            </Text>

            {Object.entries(MOODS).map(([moodId, mood]) => (
              <TouchableOpacity
                key={moodId}
                onPress={() => {
                  setMood(moodId);
                  setShowModal(false);
                }}
                style={[
                  styles.moodOption,
                  user?.mood === moodId && styles.moodOptionActive,
                ]}
              >
                <Text style={styles.moodOptionIcon}>{mood.icon}</Text>
                <View style={styles.moodOptionText}>
                  <Text style={styles.moodOptionName}>{mood.name}</Text>
                  <Text style={styles.moodOptionDesc}>
                    {mood.description}
                  </Text>
                </View>
                {user?.mood === moodId && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

export function getMoodColors(mood) {
  return MOODS[mood]?.colors || MOODS.neutral.colors;
}

const styles = StyleSheet.create({
  moodButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  moodButtonText: {
    fontSize: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a1a2e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  modalSubtitle: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 20,
  },
  moodOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  moodOptionActive: {
    backgroundColor: "rgba(22, 163, 74, 0.2)",
    borderWidth: 1,
    borderColor: "#16a34a",
  },
  moodOptionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  moodOptionText: {
    flex: 1,
  },
  moodOptionName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  moodOptionDesc: {
    color: "#aaa",
    fontSize: 12,
  },
  checkmark: {
    color: "#16a34a",
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#22c55e",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
