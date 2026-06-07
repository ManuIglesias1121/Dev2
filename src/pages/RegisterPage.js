import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { signUp } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import {
  recordAgeConfirmation,
  recordConsents,
  savePendingLegal,
} from "../services/legalConsentService";
import { supabase } from "../services/supabase";

// Mismas URLs públicas que usa SettingsPage para las políticas.
const LEGAL_BASE_URL = "https://manuiglesias1121.github.io/Dev2";

export default function RegisterPage({ navigation }) {
  const { setSessionUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedAll, setAcceptedAll] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  const openLegal = (slug) => {
    const url = `${LEGAL_BASE_URL}/${slug}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("No se pudo abrir", `Visitá ${url} en tu navegador.`)
    );
  };

  const handleRegister = async () => {
    if (!email.trim()) return Alert.alert("Falta el email", "Ingresá tu email.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim()))
      return Alert.alert("Email inválido", "Ingresá un email válido (ej: nombre@dominio.com).");
    if (password.length < 6) return Alert.alert("Contraseña corta", "Mínimo 6 caracteres.");
    if (!acceptedAll)
      return Alert.alert(
        "Falta confirmación",
        "Tenés que confirmar que sos mayor de 18 y aceptar las políticas para crear la cuenta."
      );

    setLoading(true);
    try {
      const { user } = await signUp(email.trim().toLowerCase(), password);

      // Consentimientos a registrar: los tres obligatorios marcados a la vez con el checkbox.
      const consents = { terms: true, privacy: true, community: true };

      // Si ya hay sesión inmediata (auto-confirm on), registrar legal en línea.
      // Si no, encolar pendiente para aplicar en el primer login.
      const { data: { session } } = await supabase.auth.getSession();

      if (user && session) {
        try {
          await recordAgeConfirmation(user.id);
          await recordConsents(user.id, consents, "signup");
        } catch (e) {
          console.warn("Consents inline falló, encolando pendiente:", e?.message || e);
          await savePendingLegal({ consents });
        }
        await setSessionUser(user);
      } else {
        await savePendingLegal({ consents });
        Alert.alert(
          "¡Cuenta creada!",
          "Te enviamos un email para confirmar tu cuenta. Al iniciar sesión completaremos los datos legales.",
          [{ text: "OK", onPress: () => navigation.navigate("Login") }]
        );
      }
    } catch (e) {
      Alert.alert("Error", e.message || "No pudimos crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "black" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <LinearGradient colors={["#000", "#0a0f0a", "#000"]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
          <View style={styles.logoContainer}>
            <Image source={require("../../assets/unico.png")} style={styles.logo} />
          </View>

          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Únete a la manada</Text>

          <View style={styles.form}>
            {/* EMAIL */}
            <View style={styles.field}>
              <Ionicons name="mail-outline" size={20} color="#555" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#555"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* CONTRASEÑA */}
            <View style={styles.field}>
              <Ionicons name="lock-closed-outline" size={20} color="#555" style={styles.icon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Contraseña (mínimo 6 caracteres)"
                placeholderTextColor="#555"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#555" />
              </TouchableOpacity>
            </View>

            {/* CHECKBOX MAYORÍA + TÉRMINOS */}
            <TouchableOpacity
              onPress={() => setAcceptedAll((v) => !v)}
              activeOpacity={0.7}
              style={styles.checkboxRow}
              disabled={loading}
            >
              <View style={[styles.checkbox, acceptedAll && styles.checkboxChecked]}>
                {acceptedAll && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <Text style={styles.checkboxLabel}>
                Confirmo que tengo <Text style={{ fontWeight: "bold", color: "white" }}>18 años o más</Text> y acepto los Términos, la Política de Privacidad y las Guías de Comunidad.
              </Text>
            </TouchableOpacity>

            {/* LINKS A POLÍTICAS */}
            <View style={styles.policyLinks}>
              <TouchableOpacity onPress={() => openLegal("terminos.html")}>
                <Text style={styles.policyLink}>Términos</Text>
              </TouchableOpacity>
              <Text style={styles.policySeparator}>·</Text>
              <TouchableOpacity onPress={() => openLegal("privacidad.html")}>
                <Text style={styles.policyLink}>Privacidad</Text>
              </TouchableOpacity>
              <Text style={styles.policySeparator}>·</Text>
              <TouchableOpacity onPress={() => openLegal("comunidad.html")}>
                <Text style={styles.policyLink}>Comunidad</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading || !acceptedAll}
              style={[styles.btn, (loading || !acceptedAll) && { opacity: 0.5 }]}
            >
              <LinearGradient colors={["#16a34a", "#22c55e"]} style={styles.btnGradient}>
                <Text style={styles.btnText}>{loading ? "Creando cuenta..." : "Crear cuenta"}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ marginTop: 20, alignItems: "center" }}>
              <Text style={{ color: "#22c55e", fontSize: 15 }}>¿Ya tenés cuenta? Iniciá sesión</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingVertical: 60 },
  logoContainer: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: "#0f1f0f",
    borderWidth: 2, borderColor: "#22c55e44",
    justifyContent: "center", alignItems: "center",
    marginBottom: 20, overflow: "hidden",
  },
  logo: { width: 100, height: 100, resizeMode: "contain" },
  title: { color: "white", fontSize: 30, fontWeight: "bold", marginBottom: 6 },
  subtitle: { color: "#666", fontSize: 15, marginBottom: 36 },
  form: { width: "100%" },
  field: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#111", borderRadius: 14,
    borderWidth: 1, borderColor: "#2a2a2a",
    marginBottom: 14, paddingHorizontal: 14,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: "white", fontSize: 16, paddingVertical: 14 },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 12,
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 6,
    borderWidth: 2, borderColor: "#22c55e",
    justifyContent: "center", alignItems: "center",
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: "#22c55e" },
  checkboxLabel: { flex: 1, color: "#aaa", fontSize: 13, lineHeight: 19 },

  policyLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    gap: 6,
  },
  policyLink: { color: "#22c55e", fontSize: 13, textDecorationLine: "underline" },
  policySeparator: { color: "#444", fontSize: 13 },

  btn: { borderRadius: 16, overflow: "hidden", marginTop: 4 },
  btnGradient: { paddingVertical: 16, alignItems: "center" },
  btnText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
