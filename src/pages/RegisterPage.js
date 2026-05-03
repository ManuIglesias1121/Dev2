import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
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

export default function RegisterPage({ navigation }) {
  const { setSessionUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  const handleRegister = async () => {
    if (!name.trim()) return Alert.alert("Falta el nombre", "Ingresa tu nombre.");
    if (!email.trim()) return Alert.alert("Falta el email", "Ingresa tu email.");
    if (password.length < 6) return Alert.alert("Contraseña corta", "Mínimo 6 caracteres.");

    setLoading(true);
    try {
      const { user } = await signUp(email.trim().toLowerCase(), password, name.trim());
      if (user) await setSessionUser(user);
      else Alert.alert("¡Cuenta creada!", "Revisa tu email para confirmar tu cuenta y luego inicia sesión.");
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

          <Text style={{ fontSize: 60, marginBottom: 12 }}>🐺</Text>
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
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#555" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleRegister} disabled={loading} style={[styles.btn, loading && { opacity: 0.6 }]}>
              <LinearGradient colors={["#16a34a", "#22c55e"]} style={styles.btnGradient}>
                <Text style={styles.btnText}>{loading ? "Creando cuenta..." : "Registrarme"}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ marginTop: 16, alignItems: "center" }}>
              <Text style={{ color: "#22c55e", fontSize: 15 }}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingVertical: 60 },
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
});
