import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../contexts/AuthContext";
import { createEvent } from "../services/eventsService";
import { uploadPublicPhoto } from "../services/photoService";
import { getCurrentLocation, reverseGeocode } from "../services/locationService";

export default function EventCreatePage() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [type, setType] = useState("in_person"); // "in_person" | "online"
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [city, setCity] = useState(user?.city || "");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [startsAt, setStartsAt] = useState(""); // ISO datetime string simple
  const [maxAttendees, setMaxAttendees] = useState("");
  const [coverUri, setCoverUri] = useState(null);
  const [saving, setSaving] = useState(false);
  const [detectingCity, setDetectingCity] = useState(false);

  const isPremium = user?.isPremium || user?.is_premium || false;

  if (!isPremium) {
    return (
      <View style={styles.lockedContainer}>
        <Ionicons name="lock-closed" size={48} color="#a78bfa" />
        <Text style={styles.lockedTitle}>Solo Premium</Text>
        <Text style={styles.lockedSub}>
          Crear encuentros es un beneficio Premium. Hacete Premium para organizar tus propios encuentros con la manada.
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("PremiumPlans")} style={styles.upgradeBtn}>
          <Text style={{ color: "white", fontWeight: "bold" }}>Ver planes Premium</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setCoverUri(result.assets[0].uri);
    }
  };

  const detectCity = async () => {
    setDetectingCity(true);
    try {
      const loc = await getCurrentLocation();
      if (loc) {
        const geo = await reverseGeocode(loc.latitude, loc.longitude);
        if (geo?.city) setCity(geo.city);
      }
    } catch {}
    setDetectingCity(false);
  };

  const validateDateTime = (input) => {
    // Acepta YYYY-MM-DD HH:mm o YYYY-MM-DDTHH:mm
    const normalized = input.trim().replace(" ", "T");
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return null;
    if (date.getTime() < Date.now()) return null;
    return date.toISOString();
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Falta el título", "Ponele un nombre a tu encuentro.");
      return;
    }
    const startsAtIso = validateDateTime(startsAt);
    if (!startsAtIso) {
      Alert.alert("Fecha inválida", "Usá el formato YYYY-MM-DD HH:mm y que sea en el futuro.\nEj: 2026-06-01 19:30");
      return;
    }
    if (type === "online" && !meetingUrl.trim()) {
      Alert.alert("Falta link", "Pegá el link de Meet/Zoom/etc.");
      return;
    }
    if (type === "in_person" && !locationText.trim()) {
      Alert.alert("Falta ubicación", "Indicá un lugar público para el encuentro.");
      return;
    }

    setSaving(true);

    let coverUrl = null;
    if (coverUri) {
      try {
        coverUrl = await uploadPublicPhoto(user.supabaseId, coverUri);
      } catch (e) {
        console.warn("Error subiendo cover:", e?.message);
      }
    }

    try {
      await createEvent({
        hostId: user.supabaseId,
        title,
        description,
        type,
        locationText: type === "in_person" ? locationText : null,
        city: city || null,
        meetingUrl: type === "online" ? meetingUrl : null,
        startsAt: startsAtIso,
        maxAttendees: maxAttendees ? parseInt(maxAttendees, 10) : null,
        coverUrl,
      });
      Alert.alert("✅ Encuentro creado", "Ya está visible para la comunidad.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert("Error", e?.message || "No se pudo crear el encuentro.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>
        <LinearGradient colors={["#15803d", "#0a0a0a"]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Crear encuentro</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 + insets.bottom }}>
          {/* COVER */}
          <TouchableOpacity onPress={pickCover} style={styles.coverPicker}>
            {coverUri ? (
              <Image source={{ uri: coverUri }} style={styles.coverImage} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Ionicons name="image-outline" size={36} color="#666" />
                <Text style={{ color: "#666", marginTop: 8 }}>Toca para agregar portada (opcional)</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* TIPO */}
          <Text style={styles.label}>Tipo de encuentro</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeBtn, type === "in_person" && styles.typeBtnActive]}
              onPress={() => setType("in_person")}
            >
              <Ionicons name="location" size={20} color={type === "in_person" ? "white" : "#888"} />
              <Text style={[styles.typeText, type === "in_person" && { color: "white" }]}>Presencial</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, type === "online" && styles.typeBtnActive]}
              onPress={() => setType("online")}
            >
              <Ionicons name="videocam" size={20} color={type === "online" ? "white" : "#888"} />
              <Text style={[styles.typeText, type === "online" && { color: "white" }]}>Online</Text>
            </TouchableOpacity>
          </View>

          {/* TÍTULO */}
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Ej: Picnic therian en el parque"
            placeholderTextColor="#555"
            maxLength={80}
          />

          {/* DESCRIPCIÓN */}
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Contá de qué se trata, qué llevar, etc."
            placeholderTextColor="#555"
            multiline
            maxLength={500}
          />

          {/* FECHA Y HORA */}
          <Text style={styles.label}>Fecha y hora *</Text>
          <TextInput
            style={styles.input}
            value={startsAt}
            onChangeText={setStartsAt}
            placeholder="YYYY-MM-DD HH:mm (Ej: 2026-06-01 19:30)"
            placeholderTextColor="#555"
          />

          {/* UBICACIÓN o LINK según tipo */}
          {type === "in_person" ? (
            <>
              <Text style={styles.label}>Lugar público *</Text>
              <TextInput
                style={styles.input}
                value={locationText}
                onChangeText={setLocationText}
                placeholder="Ej: Parque Centenario, junto al lago"
                placeholderTextColor="#555"
              />
              <Text style={styles.label}>Ciudad</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Bariloche, CABA, etc."
                  placeholderTextColor="#555"
                />
                <TouchableOpacity onPress={detectCity} style={styles.detectBtn}>
                  <Ionicons name={detectingCity ? "sync" : "navigate"} size={18} color="#22c55e" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>Link de meeting *</Text>
              <TextInput
                style={styles.input}
                value={meetingUrl}
                onChangeText={setMeetingUrl}
                placeholder="https://meet.google.com/... o zoom.us/..."
                placeholderTextColor="#555"
                autoCapitalize="none"
                keyboardType="url"
              />
            </>
          )}

          {/* MAX ASISTENTES */}
          <Text style={styles.label}>Cupo máximo (opcional)</Text>
          <TextInput
            style={styles.input}
            value={maxAttendees}
            onChangeText={setMaxAttendees}
            placeholder="Dejar vacío para sin límite"
            placeholderTextColor="#555"
            keyboardType="number-pad"
          />

          {/* WARNING */}
          <View style={styles.warning}>
            <Ionicons name="shield-checkmark" size={20} color="#22c55e" />
            <Text style={styles.warningText}>
              Solo lugares públicos. No compartas direcciones privadas. La comunidad puede reportar encuentros inapropiados.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          >
            <LinearGradient colors={["#16a34a", "#22c55e"]} style={styles.saveGradient}>
              <Ionicons name={saving ? "sync" : "checkmark-circle"} size={22} color="white" />
              <Text style={styles.saveText}>{saving ? "Creando..." : "Crear encuentro"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 },
  back: { position: "absolute", top: 56, left: 16, zIndex: 10 },
  title: { color: "white", fontSize: 22, fontWeight: "bold", marginTop: 32, textAlign: "center" },
  coverPicker: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 20,
  },
  coverImage: { width: "100%", height: "100%" },
  coverPlaceholder: {
    flex: 1,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    borderStyle: "dashed",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
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
    borderWidth: 1,
    borderColor: "#1e1e1e",
  },
  typeRow: { flexDirection: "row", gap: 10 },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222",
  },
  typeBtnActive: { backgroundColor: "#16a34a", borderColor: "#22c55e" },
  typeText: { color: "#888", fontWeight: "600" },
  detectBtn: {
    backgroundColor: "rgba(34,197,94,0.15)",
    borderWidth: 1,
    borderColor: "#22c55e",
    borderRadius: 10,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  warning: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(34,197,94,0.08)",
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#22c55e",
    marginTop: 20,
  },
  warningText: { color: "#86efac", fontSize: 12, flex: 1, lineHeight: 17 },
  saveBtn: { marginTop: 24, borderRadius: 14, overflow: "hidden" },
  saveGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  saveText: { color: "white", fontWeight: "bold", fontSize: 16 },
  lockedContainer: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  lockedTitle: { color: "white", fontSize: 22, fontWeight: "bold" },
  lockedSub: { color: "#888", textAlign: "center", lineHeight: 20 },
  upgradeBtn: {
    backgroundColor: "#a78bfa",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
});
