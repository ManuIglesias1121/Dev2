import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  getSoundPreferences,
  setSoundPreferences,
  setMode,
  setMasterEnabled,
  updateFeaturePreference,
  playFeedback,
} from "../services/soundService";

const FEATURES = [
  { key: "chatMessage", label: "Nuevo mensaje recibido", icon: "chatbubble" },
  { key: "superMatch", label: "Super Match recibido", icon: "star" },
];

const MODES = [
  { value: "both", label: "Sonido + Vibración", icon: "volume-high" },
  { value: "sound", label: "Solo sonido", icon: "musical-note" },
  { value: "vibration", label: "Solo vibración", icon: "phone-portrait" },
  { value: "silent", label: "Silencio total", icon: "volume-mute" },
];

export default function SoundSettings({ navigation }) {
  const [prefs, setPrefs] = useState(null);

  useEffect(() => {
    getSoundPreferences().then(setPrefs);
  }, []);

  if (!prefs) return null;

  const toggleMaster = async (value) => {
    await setMasterEnabled(value);
    setPrefs((p) => ({ ...p, masterEnabled: value }));
  };

  const changeMode = async (m) => {
    await setMode(m);
    setPrefs((p) => ({ ...p, mode: m }));
    await playFeedback("notification"); // preview
  };

  const toggleFeature = async (key, value) => {
    await updateFeaturePreference(key, value);
    setPrefs((p) => ({ ...p, features: { ...p.features, [key]: value } }));
    if (value) await playFeedback(key); // preview
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0a0a0a", "#000"]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <LinearGradient colors={["#15803d", "#0a0a0a"]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>🔔 Sonidos y Vibración</Text>
          <Text style={styles.subtitle}>Personaliza cómo te alerta la app</Text>
        </LinearGradient>

        {/* Master switch */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Notificaciones activas</Text>
              <Text style={styles.rowSub}>Master switch general</Text>
            </View>
            <Switch
              value={prefs.masterEnabled}
              onValueChange={toggleMaster}
              trackColor={{ true: "#22c55e", false: "#333" }}
              thumbColor="white"
            />
          </View>
        </View>

        {/* Mode selector */}
        {prefs.masterEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Modo</Text>
            {MODES.map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[styles.modeRow, prefs.mode === m.value && styles.modeRowActive]}
                onPress={() => changeMode(m.value)}
              >
                <Ionicons
                  name={m.icon}
                  size={22}
                  color={prefs.mode === m.value ? "#22c55e" : "#888"}
                />
                <Text
                  style={[
                    styles.modeLabel,
                    prefs.mode === m.value && { color: "#22c55e", fontWeight: "bold" },
                  ]}
                >
                  {m.label}
                </Text>
                {prefs.mode === m.value && (
                  <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Per-feature switches */}
        {prefs.masterEnabled && prefs.mode !== "silent" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Por función</Text>
            {FEATURES.map((f) => (
              <View key={f.key} style={styles.featureRow}>
                <Ionicons name={f.icon} size={22} color="#22c55e" />
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Switch
                  value={prefs.features[f.key]}
                  onValueChange={(v) => toggleFeature(f.key, v)}
                  trackColor={{ true: "#22c55e", false: "#333" }}
                  thumbColor="white"
                />
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          Tocá cualquier opción para escucharla.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  header: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 },
  back: { position: "absolute", top: 56, left: 16, zIndex: 10 },
  title: { color: "white", fontSize: 24, fontWeight: "bold", marginTop: 32, textAlign: "center" },
  subtitle: { color: "#bbf7d0", fontSize: 13, marginTop: 6, textAlign: "center" },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: {
    color: "#888",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222",
  },
  rowTitle: { color: "white", fontSize: 16, fontWeight: "600" },
  rowSub: { color: "#888", fontSize: 12, marginTop: 2 },
  modeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#222",
  },
  modeRowActive: { borderColor: "#22c55e" },
  modeLabel: { flex: 1, color: "white", fontSize: 15 },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#222",
  },
  featureLabel: { flex: 1, color: "white", fontSize: 15 },
  footer: { color: "#555", fontSize: 11, textAlign: "center", marginTop: 30, fontStyle: "italic" },
});
