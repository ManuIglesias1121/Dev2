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
import AgeVerificationModal from "../components/AgeVerificationModal";
import ConsentScreens from "../components/ConsentScreens";
import {
  recordAgeVerification,
  recordConsents,
  savePendingLegal,
} from "../services/legalConsentService";
import { supabase } from "../services/supabase";

// Estados del flujo de registro
const STEP = {
  FORM: "form",
  AGE: "age",
  CONSENTS: "consents",
  CREATING: "creating",
};

export default function RegisterPage({ navigation }) {
  const { setSessionUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState(STEP.FORM);
  const [birthDateIso, setBirthDateIso] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  // Paso 1: validar form y abrir verificación de edad
  const handleSubmitForm = () => {
    if (!name.trim()) return Alert.alert("Falta el nombre", "Ingresa tu nombre.");
    if (!email.trim()) return Alert.alert("Falta el email", "Ingresa tu email.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim()))
      return Alert.alert("Email inválido", "Ingresa un email válido (ej: nombre@dominio.com).");
    if (password.length < 6) return Alert.alert("Contraseña corta", "Mínimo 6 caracteres.");

    setStep(STEP.AGE);
  };

  // Paso 2: edad verificada
  const handleAgeVerified = (iso) => {
    setBirthDateIso(iso);
    setStep(STEP.CONSENTS);
  };

  // Paso 3: consentimientos aceptados → crear cuenta
  const handleConsentsComplete = async (consents) => {
    setStep(STEP.CREATING);
    setLoading(true);
    try {
      const { user } = await signUp(
        email.trim().toLowerCase(),
        password,
        name.trim(),
        birthDateIso
      );

      // Hay dos caminos: con sesión inmediata (autoconfirm on) o con email pendiente.
      const { data: { session } } = await supabase.auth.getSession();

      if (user && session) {
        // Sesión activa → registrar consents + edad inmediatamente
        try {
          await recordAgeVerification(user.id, birthDateIso, "self_declared");
          await recordConsents(user.id, consents, "signup");
        } catch (e) {
          // Si falla por RLS o cualquier otra cosa, dejarlos pendientes para reintento
          console.warn("Consents inline falló, encolando pendiente:", e?.message || e);
          await savePendingLegal(birthDateIso, consents);
        }
        await setSessionUser(user);
      } else {
        // Confirm-by-email: no hay sesión, dejar todo pendiente para el primer login
        await savePendingLegal(birthDateIso, consents);
        Alert.alert(
          "¡Cuenta creada!",
          "Te enviamos un email para confirmar tu cuenta. Tus datos legales se aplicarán al iniciar sesión.",
          [{ text: "OK", onPress: () => setStep(STEP.FORM) }]
        );
      }
    } catch (e) {
      Alert.alert("Error", e.message || "No pudimos crear la cuenta.");
      setStep(STEP.FORM);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLegal = () => {
    Alert.alert(
      "Cancelar registro",
      "Sin verificar tu edad y aceptar los términos no podés crear cuenta. ¿Volver al formulario?",
      [
        { text: "Seguir", style: "cancel" },
        { text: "Volver", style: "destructive", onPress: () => setStep(STEP.FORM) },
      ]
    );
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
            {/* NOMBRE */}
            <View style={styles.field}>
              <Ionicons name="paw-outline" size={20} color="#555" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Tu nombre en la manada"
                placeholderTextColor="#555"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

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

            <TouchableOpacity onPress={handleSubmitForm} disabled={loading} style={[styles.btn, loading && { opacity: 0.6 }]}>
              <LinearGradient colors={["#16a34a", "#22c55e"]} style={styles.btnGradient}>
                <Text style={styles.btnText}>{loading ? "Creando cuenta..." : "Continuar"}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.legalFootnote}>
              Al continuar verificarás tu edad y aceptarás los Términos, Política de Privacidad y Guías de Comunidad.
            </Text>

            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ marginTop: 16, alignItems: "center" }}>
              <Text style={{ color: "#22c55e", fontSize: 15 }}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>

      {/* PASO 2: Verificación de edad */}
      <AgeVerificationModal
        visible={step === STEP.AGE}
        onAgeVerified={handleAgeVerified}
        onCancel={handleCancelLegal}
      />

      {/* PASO 3: Consentimientos legales */}
      {step === STEP.CONSENTS && (
        <View style={StyleSheet.absoluteFill}>
          <ConsentScreens
            onConsentComplete={handleConsentsComplete}
            onCancel={handleCancelLegal}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingVertical: 60 },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#0f1f0f",
    borderWidth: 2,
    borderColor: "#22c55e44",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  logo: { width: 100, height: 100, resizeMode: "contain" },
  title: { color: "white", fontSize: 30, fontWeight: "bold", marginBottom: 6 },
  subtitle: { color: "#666", fontSize: 15, marginBottom: 36 },
  form: { width: "100%" },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: "white", fontSize: 16, paddingVertical: 14 },
  btn: { borderRadius: 16, overflow: "hidden", marginTop: 8 },
  btnGradient: { paddingVertical: 16, alignItems: "center" },
  btnText: { color: "white", fontSize: 18, fontWeight: "bold" },
  legalFootnote: {
    color: "#666",
    fontSize: 11,
    marginTop: 12,
    textAlign: "center",
    lineHeight: 16,
  },
});
