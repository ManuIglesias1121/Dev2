import React, { useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentLocation } from "../services/locationService";
import { saveData, loadData } from "../services/storageService";

const SAFE_DATE_KEY = "safe_date_state";

export default function SafeDateMode({ navigation }) {
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [meetingPlace, setMeetingPlace] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [active, setActive] = useState(false);

  useEffect(() => {
    loadData(SAFE_DATE_KEY).then((data) => {
      if (data?.active) {
        setActive(true);
        setContactName(data.contactName || "");
        setContactPhone(data.contactPhone || "");
        setMeetingPlace(data.meetingPlace || "");
        setMeetingTime(data.meetingTime || "");
      }
    });
  }, []);

  const sendMessage = async (template) => {
    const url = Platform.select({
      ios: `sms:${contactPhone}&body=${encodeURIComponent(template)}`,
      android: `sms:${contactPhone}?body=${encodeURIComponent(template)}`,
    });
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Error", "No se pudo abrir SMS. Verificá el número.");
    }
  };

  const activate = async () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      Alert.alert("Datos faltantes", "Necesitamos el nombre y número de tu contacto de confianza.");
      return;
    }
    if (!meetingPlace.trim()) {
      Alert.alert("Datos faltantes", "Indicá dónde es la cita.");
      return;
    }

    const loc = await getCurrentLocation();
    const locText = loc
      ? `\n\nMi ubicación actual: https://maps.google.com/?q=${loc.latitude},${loc.longitude}`
      : "";

    const message = `🛡️ Hola ${contactName}, estoy activando Modo Cita Segura desde TherianMatch.

📍 Lugar: ${meetingPlace}
🕐 Hora: ${meetingTime || "no especificada"}

Te voy a actualizar cuando llegue y termine. Si no recibís noticias mías, llamame o llamá a la 911.${locText}`;

    await saveData(SAFE_DATE_KEY, {
      active: true,
      contactName,
      contactPhone,
      meetingPlace,
      meetingTime,
      activatedAt: Date.now(),
    });
    setActive(true);
    sendMessage(message);
  };

  const sendCheckIn = async () => {
    const loc = await getCurrentLocation();
    const locText = loc
      ? `Mi ubicación: https://maps.google.com/?q=${loc.latitude},${loc.longitude}`
      : "";
    sendMessage(`✅ Estoy bien. Sigo en la cita.\n\n${locText}`);
  };

  const sendIDontFeelSafe = async () => {
    Alert.alert(
      "¿Necesitás ayuda urgente?",
      "Vamos a enviar un mensaje de alerta a tu contacto con tu ubicación actual.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar alerta",
          style: "destructive",
          onPress: async () => {
            const loc = await getCurrentLocation();
            const locText = loc
              ? `https://maps.google.com/?q=${loc.latitude},${loc.longitude}`
              : "(no se pudo obtener ubicación)";
            sendMessage(
              `🚨 ALERTA: No me siento segurx en esta cita. Necesito ayuda. Mi ubicación: ${locText}\n\nLlamame ahora o llamá a la 911 si no respondo.`
            );
          },
        },
      ]
    );
  };

  const deactivate = async () => {
    Alert.alert("Finalizar Modo Cita Segura", "¿Llegaste sanx y salvx a casa?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí, llegué bien",
        onPress: async () => {
          sendMessage("✅ Llegué bien a casa. Gracias por estar.");
          await saveData(SAFE_DATE_KEY, { active: false });
          setActive(false);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0a1f0a", "#0a0a0a"]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <LinearGradient colors={["#15803d", "#0a1f0a"]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>📍 Modo Cita Segura</Text>
          <Text style={styles.subtitle}>
            {active
              ? "Modo activo — tu contacto está al tanto"
              : "Compartí tu ubicación con alguien de confianza"}
          </Text>
        </LinearGradient>

        {active ? (
          <View style={styles.activeContainer}>
            <View style={styles.activeCard}>
              <Text style={styles.activeStatus}>🟢 Activo</Text>
              <Text style={styles.activeContact}>{contactName}</Text>
              <Text style={styles.activePhone}>{contactPhone}</Text>
              {meetingPlace ? <Text style={styles.activeInfo}>📍 {meetingPlace}</Text> : null}
              {meetingTime ? <Text style={styles.activeInfo}>🕐 {meetingTime}</Text> : null}
            </View>

            <TouchableOpacity style={styles.checkInBtn} onPress={sendCheckIn}>
              <Ionicons name="checkmark-circle" size={22} color="white" />
              <Text style={styles.btnText}>Enviar check-in (estoy bien)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.alertBtn} onPress={sendIDontFeelSafe}>
              <Ionicons name="alert-circle" size={22} color="white" />
              <Text style={styles.btnText}>No me siento segurx</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.endBtn} onPress={deactivate}>
              <Text style={[styles.btnText, { color: "#888" }]}>Finalizar (llegué bien)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>Contacto de confianza</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor="#555"
              value={contactName}
              onChangeText={setContactName}
            />
            <TextInput
              style={styles.input}
              placeholder="Número de celular (con código de área)"
              placeholderTextColor="#555"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Datos de la cita</Text>
            <TextInput
              style={styles.input}
              placeholder="¿Dónde es? (bar, café, dirección)"
              placeholderTextColor="#555"
              value={meetingPlace}
              onChangeText={setMeetingPlace}
            />
            <TextInput
              style={styles.input}
              placeholder="¿A qué hora? (opcional)"
              placeholderTextColor="#555"
              value={meetingTime}
              onChangeText={setMeetingTime}
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Al activar, vamos a abrir tu app de SMS con un mensaje preescrito para enviar a tu
                contacto. Tu ubicación se incluye automáticamente.
              </Text>
            </View>

            <TouchableOpacity style={styles.activateBtn} onPress={activate}>
              <LinearGradient colors={["#16a34a", "#15803d"]} style={styles.activateGradient}>
                <Ionicons name="shield-checkmark" size={24} color="white" />
                <Text style={styles.activateText}>Activar Modo Cita Segura</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  header: { paddingTop: 56, paddingBottom: 28, paddingHorizontal: 20 },
  back: { position: "absolute", top: 56, left: 16, zIndex: 10 },
  title: { color: "white", fontSize: 26, fontWeight: "bold", marginTop: 32, textAlign: "center" },
  subtitle: { color: "#bbf7d0", fontSize: 13, marginTop: 6, textAlign: "center" },
  form: { padding: 20 },
  label: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#111",
    color: "white",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1e1e1e",
  },
  infoBox: {
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#22c55e",
  },
  infoText: { color: "#86efac", fontSize: 13, lineHeight: 18 },
  activateBtn: { marginTop: 24, borderRadius: 14, overflow: "hidden" },
  activateGradient: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  activateText: { color: "white", fontWeight: "bold", fontSize: 16 },
  activeContainer: { padding: 20 },
  activeCard: {
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#22c55e44",
    marginBottom: 20,
  },
  activeStatus: { color: "#22c55e", fontSize: 14, fontWeight: "bold", marginBottom: 8 },
  activeContact: { color: "white", fontSize: 20, fontWeight: "bold" },
  activePhone: { color: "#bbb", fontSize: 14, marginTop: 4 },
  activeInfo: { color: "#888", fontSize: 13, marginTop: 8 },
  checkInBtn: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  alertBtn: {
    backgroundColor: "#dc2626",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  btnText: { color: "white", fontWeight: "bold", fontSize: 15 },
  endBtn: { padding: 12, alignItems: "center" },
});
