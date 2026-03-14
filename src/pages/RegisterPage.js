import { LinearGradient } from "expo-linear-gradient";
import React, { useContext, useEffect, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../contexts/AuthContext";

export default function RegisterPage() {
  const { signUp, goToLogin } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Animación suave
  const fadeAnim = new Animated.Value(0);
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "black" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* HEADER */}
        <LinearGradient
          colors={["#0f0f0f", "#1a1a1a", "#000"]}
          style={{
            paddingTop: 80,
            paddingBottom: 40,
            alignItems: "center",
            borderBottomWidth: 1,
            borderColor: "#222",
          }}
        >
          <Text style={{ fontSize: 60, color: "#22c55e" }}>🐾</Text>

          <Text
            style={{
              color: "white",
              fontSize: 32,
              fontWeight: "bold",
              marginTop: 10,
            }}
          >
            Crear cuenta
          </Text>

          <Text style={{ color: "#888", marginTop: 5 }}>
            Únete a la comunidad
          </Text>
        </LinearGradient>

        {/* FORM */}
        <View style={{ padding: 25 }}>
          <TextInput
            placeholder="Correo electrónico"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              backgroundColor: "#111",
              color: "white",
              padding: 14,
              borderRadius: 10,
              marginBottom: 15,
              borderWidth: 1,
              borderColor: "#222",
            }}
          />

          <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#666"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{
              backgroundColor: "#111",
              color: "white",
              padding: 14,
              borderRadius: 10,
              marginBottom: 15,
              borderWidth: 1,
              borderColor: "#222",
            }}
          />

          <TextInput
            placeholder="Confirmar contraseña"
            placeholderTextColor="#666"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            style={{
              backgroundColor: "#111",
              color: "white",
              padding: 14,
              borderRadius: 10,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "#222",
            }}
          />

          {/* BOTÓN REGISTRAR */}
          <TouchableOpacity
            style={{
              backgroundColor: "#22c55e",
              padding: 14,
              borderRadius: 10,
              marginBottom: 15,
            }}
            onPress={() => signUp(email, password, confirm)}
          >
            <Text
              style={{
                color: "black",
                textAlign: "center",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              Registrarme
            </Text>
          </TouchableOpacity>

          {/* VOLVER AL LOGIN */}
          <TouchableOpacity onPress={goToLogin}>
            <Text
              style={{
                color: "#22c55e",
                textAlign: "center",
                fontSize: 16,
                marginTop: 10,
              }}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
