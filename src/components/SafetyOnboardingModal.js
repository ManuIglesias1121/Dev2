import React, { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { saveData, loadData } from "../services/storageService";

const SAFETY_ONBOARDING_KEY = "safety_onboarding_done";

export default function SafetyOnboardingModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    loadData(SAFETY_ONBOARDING_KEY, false).then((done) => {
      if (!done) setVisible(true);
    });
  }, []);

  const accept = async () => {
    await saveData(SAFETY_ONBOARDING_KEY, true);
    setVisible(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <LinearGradient colors={["#0a0a0a", "#1a0a0a"]} style={StyleSheet.absoluteFill} />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.icon}>🛡️</Text>
            <Text style={styles.title}>Tu seguridad es prioridad</Text>
            <Text style={styles.subtitle}>
              Antes de empezar, queremos que sepas qué herramientas tenés a tu disposición.
            </Text>
          </View>

          <Feature
            icon="🚫"
            title="Bloquear es gratis e instantáneo"
            description="Si alguien te incomoda, bloquealo desde el chat o el perfil con un solo tap. La persona no se entera."
          />

          <Feature
            icon="🚩"
            title="Reportar conductas"
            description="Reportes anónimos al equipo de moderación, revisados en 24 horas. Tolerancia cero al acoso, doxxing y NCII."
          />

          <Feature
            icon="🛡️"
            title="Filtros automáticos"
            description="Detectamos lenguaje agresivo en chat y te avisamos antes de enviar. La reincidencia bloquea el chat."
          />

          <Feature
            icon="📷"
            title="Tus fotos íntimas, protegidas"
            description="Las fotos exclusivas premium están en bucket privado. Bloqueamos screenshots en Android y los detectamos en iOS. Reincidir = cuenta bloqueada."
          />

          <Feature
            icon="📍"
            title="Modo Cita Segura"
            description="Compartí tu ubicación en tiempo real con un contacto de confianza antes de cualquier encuentro presencial."
          />

          <Feature
            icon="📞"
            title="Recursos de crisis 24/7"
            description="Línea 144 (violencia de género), 137 (víctimas), 135 (suicidio). Acceso directo desde el Centro de Seguridad."
          />

          <View style={styles.commitmentBox}>
            <Text style={styles.commitmentTitle}>Nuestro compromiso</Text>
            <Text style={styles.commitmentText}>
              No toleramos violencia, acoso, discriminación, doxxing ni outing de identidad therian. Reportes
              críticos (NCII, amenazas, menores) se procesan en menos de 24 hs y se denuncian a las autoridades
              cuando corresponde, bajo Ley Olimpia, Ley 26.485 y Ley 26.904.
            </Text>
          </View>

          <TouchableOpacity style={styles.btn} onPress={accept}>
            <LinearGradient colors={["#22c55e", "#15803d"]} style={styles.btnGradient}>
              <Ionicons name="checkmark-circle" size={22} color="white" />
              <Text style={styles.btnText}>Entendido, vamos</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footer}>
            Podés ver toda esta info de nuevo en Configuración → Centro de Seguridad
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Feature({ icon, title, description }) {
  return (
    <View style={styles.feature}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  content: { padding: 24, paddingTop: 80, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 28 },
  icon: { fontSize: 56, marginBottom: 12 },
  title: { color: "white", fontSize: 26, fontWeight: "bold", textAlign: "center" },
  subtitle: { color: "#bbb", fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20 },
  feature: {
    flexDirection: "row",
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1e1e1e",
    gap: 12,
  },
  featureIcon: { fontSize: 28 },
  featureTitle: { color: "white", fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  featureDesc: { color: "#888", fontSize: 12, lineHeight: 17 },
  commitmentBox: {
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#22c55e",
  },
  commitmentTitle: { color: "#22c55e", fontWeight: "bold", marginBottom: 8 },
  commitmentText: { color: "#ddd", fontSize: 12, lineHeight: 18 },
  btn: { borderRadius: 14, overflow: "hidden", marginTop: 12 },
  btnGradient: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  footer: { color: "#555", fontSize: 11, textAlign: "center", marginTop: 16 },
});
