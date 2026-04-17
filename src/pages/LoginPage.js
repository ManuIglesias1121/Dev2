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

export default function LoginPage({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Falta el email", "Ingresa tu email para continuar.");
      return;
    }
    if (!password) {
      Alert.alert("Falta la contraseña", "Ingresa tu contraseña.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const success = login(email.trim().toLowerCase());
    setLoading(false);

    if (!success) {
      Alert.alert("Error", "No pudimos iniciar sesión. Verificá tus datos.");
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
          <Text style={styles.subtitle}>Encontrá tu manada 🐾</Text>

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
            <TouchableOpacity onPress={handleLogin} disabled={loading} style={[styles.loginBtn, loading && { opacity: 0.6 }]}>
              <LinearGradient colors={["#16a34a", "#22c55e"]} style={styles.loginBtnGradient}>
                {loading
                  ? <Text style={styles.loginBtnText}>Entrando...</Text>
                  : <>
                      <Ionicons name="paw-outline" size={20} color="white" style={{ marginRight: 8 }} />
                      <Text style={styles.loginBtnText}>Entrar a la manada</Text>
                    </>
                }
              </LinearGradient>
            </TouchableOpacity>

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
            Al ingresar aceptás los{" "}
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
