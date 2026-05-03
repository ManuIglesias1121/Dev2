import React, { useState, useRef, useEffect } from "react";
import {
  Alert,
  Animated,
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
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { signIn } from "../services/authService";
import { saveData, loadData } from "../services/storageService";

const BIO_EMAIL_KEY = "bio_saved_email";
const BIO_PASS_KEY = "bio_saved_pass";
const BIO_ENABLED_KEY = "bio_enabled";

async function getBiometrics() {
  try {
    const mod = await import("expo-local-authentication");
    return mod;
  } catch {
    return null;
  }
}

export default function LoginPage({ navigation }) {
  const { setSessionUser, hasStoredSession, restoreStoredSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, useNativeDriver: true }),
    ]).start();

    async function checkBio() {
      const mod = await getBiometrics();
      if (!mod) return;
      const has = await mod.hasHardwareAsync();
      const enrolled = await mod.isEnrolledAsync();
      if (has && enrolled) {
        setBioAvailable(true);
        const enabled = await loadData(BIO_ENABLED_KEY, false);
        setBioEnabled(enabled);
        if (enabled) {
          const savedEmail = await loadData(BIO_EMAIL_KEY, "");
          if (savedEmail) setEmail(savedEmail);
        }
      }
    }
    checkBio();
  }, []);

  const handleLogin = async (emailOverride, passOverride) => {
    const loginEmail = (emailOverride || email).trim().toLowerCase();
    const loginPass = passOverride || password;

    if (!loginEmail) {
      Alert.alert("Falta el email", "Ingresa tu email para continuar.");
      return;
    }
    if (!loginPass) {
      Alert.alert("Falta la contraseña", "Ingresa tu contraseña.");
      return;
    }

    setLoading(true);
    try {
      const { user } = await signIn(loginEmail, loginPass);
      await setSessionUser(user);

      // Ofrecer guardar biometría si está disponible pero no habilitada
      if (bioAvailable && !bioEnabled) {
        Alert.alert(
          "¿Usar huella digital?",
          "La próxima vez podrás entrar solo con tu huella, sin escribir la contraseña.",
          [
            { text: "Ahora no", style: "cancel" },
            {
              text: "Sí, activar",
              onPress: async () => {
                await saveData(BIO_EMAIL_KEY, loginEmail);
                await saveData(BIO_PASS_KEY, loginPass);
                await saveData(BIO_ENABLED_KEY, true);
              },
            },
          ]
        );
      }
    } catch (e) {
      Alert.alert("Error", e.message || "No pudimos iniciar sesión. Verifica tus datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    const mod = await getBiometrics();
    if (!mod) return;

    const result = await mod.authenticateAsync({
      promptMessage: "Desbloquea TherianMatch",
      cancelLabel: "Cancelar",
      fallbackLabel: "Usar contraseña",
    });

    if (result.success) {
      // Si hay sesión guardada, restaurarla directamente sin re-login
      if (hasStoredSession) {
        setLoading(true);
        try {
          await restoreStoredSession();
        } catch {
          // Si falla, intentar con credenciales guardadas
          const savedEmail = await loadData(BIO_EMAIL_KEY, "");
          const savedPass = await loadData(BIO_PASS_KEY, "");
          if (savedEmail && savedPass) {
            await handleLogin(savedEmail, savedPass);
          }
        } finally {
          setLoading(false);
        }
      } else {
        const savedEmail = await loadData(BIO_EMAIL_KEY, "");
        const savedPass = await loadData(BIO_PASS_KEY, "");
        if (savedEmail && savedPass) {
          await handleLogin(savedEmail, savedPass);
        } else {
          Alert.alert("Sin credenciales guardadas", "Ingresa con email y contraseña primero.");
        }
      }
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <LinearGradient colors={["#000000", "#0a0f0a", "#000000"]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: "center" }}>
          {/* LOGO */}
          <View style={styles.logoContainer}>
            <Image source={require("../../assets/unico.png")} style={styles.logo} />
          </View>

          <Text style={styles.title}>TherianMatch</Text>
          <Text style={styles.subtitle}>Encuentra tu manada</Text>

          {/* FORM */}
          <View style={styles.form}>
            {/* EMAIL */}
            <View style={styles.fieldContainer}>
              <Ionicons name="mail-outline" size={20} color="#555" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#555"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* CONTRASEÑA */}
            <View style={styles.fieldContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#555" style={styles.fieldIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Contraseña"
                placeholderTextColor="#555"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#555" />
              </TouchableOpacity>
            </View>

            {/* OLVIDÉ CONTRASEÑA */}
            <TouchableOpacity onPress={() => navigation.navigate("RecoverPassword")} style={{ alignSelf: "flex-end", marginBottom: 20 }}>
              <Text style={{ color: "#22c55e", fontSize: 13 }}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* BOTÓN INGRESAR */}
            <TouchableOpacity onPress={() => handleLogin()} disabled={loading} style={[styles.loginBtn, loading && { opacity: 0.6 }]}>
              <LinearGradient colors={["#16a34a", "#22c55e"]} style={styles.loginBtnGradient}>
                {loading
                  ? <Text style={styles.loginBtnText}>Entrando...</Text>
                  : <>
                      <Ionicons name="log-in-outline" size={20} color="white" style={{ marginRight: 8 }} />
                      <Text style={styles.loginBtnText}>Entrar</Text>
                    </>
                }
              </LinearGradient>
            </TouchableOpacity>

            {/* BOTÓN BIOMÉTRICO */}
            {bioAvailable && bioEnabled && (
              <TouchableOpacity onPress={handleBiometricLogin} style={[styles.bioBtn, hasStoredSession && styles.bioBtnPrimary]}>
                <Ionicons name="finger-print-outline" size={28} color="#22c55e" />
                <Text style={styles.bioBtnText}>
                  {hasStoredSession ? "Entrar con huella" : "Entrar con huella"}
                </Text>
              </TouchableOpacity>
            )}

            {/* SEPARADOR */}
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>o</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* REGISTRO */}
            <TouchableOpacity onPress={() => navigation.navigate("Register")} style={styles.registerBtn}>
              <Text style={styles.registerBtnText}>Crear cuenta nueva</Text>
            </TouchableOpacity>
          </View>

          {/* FOOTER */}
          <Text style={styles.footerText}>
            Al ingresar aceptas los{" "}
            <Text style={{ color: "#22c55e" }}>Términos de Servicio</Text>
            {" "}y la{" "}
            <Text style={{ color: "#22c55e" }}>Política de Privacidad</Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
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
  title: { color: "white", fontSize: 32, fontWeight: "bold", marginBottom: 6 },
  subtitle: { color: "#666", fontSize: 16, marginBottom: 40 },
  form: { width: "100%" },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  fieldIcon: { marginRight: 10 },
  input: {
    flex: 1,
    color: "white",
    fontSize: 16,
    paddingVertical: 14,
  },
  loginBtn: { borderRadius: 16, overflow: "hidden", marginBottom: 16 },
  loginBtnGradient: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginBtnText: { color: "white", fontSize: 18, fontWeight: "bold" },
  bioBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(34,197,94,0.08)",
    borderWidth: 1,
    borderColor: "#22c55e55",
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  bioBtnText: { color: "#22c55e", fontSize: 16, fontWeight: "600" },
  bioBtnPrimary: {
    backgroundColor: "rgba(34,197,94,0.15)",
    borderColor: "#22c55e",
    borderWidth: 2,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: "#222" },
  separatorText: { color: "#555", marginHorizontal: 12, fontSize: 14 },
  registerBtn: {
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  registerBtnText: { color: "#aaa", fontSize: 16 },
  footerText: { color: "#444", fontSize: 12, textAlign: "center", marginTop: 30, lineHeight: 18 },
});
