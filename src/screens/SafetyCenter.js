import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  CRISIS_RESOURCES,
  SAFE_DATE_TIPS,
  callEmergency,
  openUrl,
} from "../services/safetyService";

export default function SafetyCenter({ navigation }) {
  const handleResource = (resource) => {
    if (resource.phone) {
      Alert.alert(
        resource.name,
        `¿Llamar ahora a ${resource.phone}?\n\n${resource.description}`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Llamar", onPress: () => callEmergency(resource.phone) },
        ]
      );
    } else if (resource.url) {
      openUrl(resource.url);
    }
  };

  const priority1 = CRISIS_RESOURCES.filter((r) => r.priority === 1);
  const priority2 = CRISIS_RESOURCES.filter((r) => r.priority === 2);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1a0a0a", "#0a0a0a"]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <LinearGradient
          colors={["#7f1d1d", "#1a0a0a"]}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>🛡️ Centro de Seguridad</Text>
          <Text style={styles.subtitle}>
            No estás solx. Si estás en crisis, estos recursos pueden ayudarte ahora.
          </Text>
        </LinearGradient>

        {/* EMERGENCIA INMEDIATA */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🚨</Text>
            <Text style={styles.sectionTitle}>Emergencia inmediata</Text>
          </View>
          {priority1.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.card, styles.criticalCard]}
              onPress={() => handleResource(r)}
            >
              <Text style={styles.cardIcon}>{r.icon}</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{r.name}</Text>
                <Text style={styles.cardDesc}>{r.description}</Text>
              </View>
              <Ionicons
                name={r.phone ? "call" : "open-outline"}
                size={22}
                color="#ef4444"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* OTROS RECURSOS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📞</Text>
            <Text style={styles.sectionTitle}>Otros recursos</Text>
          </View>
          {priority2.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={styles.card}
              onPress={() => handleResource(r)}
            >
              <Text style={styles.cardIcon}>{r.icon}</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{r.name}</Text>
                <Text style={styles.cardDesc}>{r.description}</Text>
              </View>
              <Ionicons
                name={r.phone ? "call-outline" : "open-outline"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* TIPS DE CITA SEGURA */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>💚</Text>
            <Text style={styles.sectionTitle}>Tips de cita segura</Text>
          </View>
          {SAFE_DATE_TIPS.map((tip, i) => (
            <View key={i} style={styles.tipCard}>
              <Text style={styles.cardIcon}>{tip.icon}</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{tip.title}</Text>
                <Text style={styles.cardDesc}>{tip.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* MODO CITA SEGURA */}
        <TouchableOpacity
          style={styles.safeDateBtn}
          onPress={() => navigation.navigate("SafeDateMode")}
        >
          <LinearGradient colors={["#16a34a", "#15803d"]} style={styles.safeDateGradient}>
            <Text style={{ fontSize: 32 }}>📍</Text>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.safeDateTitle}>Activar Modo Cita Segura</Text>
              <Text style={styles.safeDateDesc}>
                Compartí tu ubicación en tiempo real con un contacto de confianza
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        {/* QUÉ HACER SI... */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>❓</Text>
            <Text style={styles.sectionTitle}>Qué hacer si...</Text>
          </View>
          <InfoCard
            title="Alguien me acosa"
            body="Bloquealo (long press en el chat). Después reportá desde el perfil. El bloqueo es instantáneo y la persona no se entera."
          />
          <InfoCard
            title="Compartieron mis fotos sin permiso"
            body="Reportá al usuario inmediatamente y entrá a StopNCII.org para crear un hash digital de tus fotos. La Ley Olimpia (27.736) penaliza esta conducta."
          />
          <InfoCard
            title="Me piden plata"
            body="No envíes dinero bajo ningún concepto. Reportá al usuario por estafa. Es un patrón conocido de fraude."
          />
          <InfoCard
            title="Sospecho que es menor de edad"
            body="Reportá inmediatamente. Tomamos acción dentro de las 24 hs y notificamos a las autoridades bajo Ley 26.904 (Grooming)."
          />
          <InfoCard
            title="Estoy en crisis emocional"
            body="Llamá al 135 (Centro de Asistencia al Suicida, 24/7). Tu vida importa."
          />
        </View>

        <Text style={styles.footer}>
          TherianMatch tiene tolerancia cero ante violencia, acoso y discriminación.
        </Text>
      </ScrollView>
    </View>
  );
}

function InfoCard({ title, body }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  header: {
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  back: { position: "absolute", top: 56, left: 16, zIndex: 10 },
  title: { color: "white", fontSize: 26, fontWeight: "bold", marginTop: 32, textAlign: "center" },
  subtitle: { color: "#fca5a5", fontSize: 14, marginTop: 8, textAlign: "center", lineHeight: 20 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
  sectionIcon: { fontSize: 22 },
  sectionTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#222",
    gap: 12,
  },
  criticalCard: {
    borderColor: "#ef4444",
    backgroundColor: "rgba(239,68,68,0.08)",
  },
  cardIcon: { fontSize: 28 },
  cardContent: { flex: 1 },
  cardTitle: { color: "white", fontSize: 15, fontWeight: "bold" },
  cardDesc: { color: "#888", fontSize: 12, marginTop: 2, lineHeight: 16 },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  safeDateBtn: { marginHorizontal: 16, marginTop: 24, borderRadius: 16, overflow: "hidden" },
  safeDateGradient: { flexDirection: "row", alignItems: "center", padding: 18 },
  safeDateTitle: { color: "white", fontSize: 16, fontWeight: "bold" },
  safeDateDesc: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 4 },
  infoCard: {
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#16a34a",
  },
  infoTitle: { color: "#22c55e", fontWeight: "bold", marginBottom: 4 },
  infoBody: { color: "#bbb", fontSize: 13, lineHeight: 18 },
  footer: {
    color: "#555",
    fontSize: 11,
    textAlign: "center",
    marginTop: 30,
    paddingHorizontal: 24,
    fontStyle: "italic",
  },
});
