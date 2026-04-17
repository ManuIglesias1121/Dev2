import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ForgotPasswordPage({ navigation }) {
  const [email, setEmail] = useState("");

  const fadeAnim = new Animated.Value(0);
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleFakeReset = () => {
    alert("En una versión con backend, recibirías un correo aquí.");
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "black" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
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
            Recuperar contraseña
          </Text>

          <Text style={{ color: "#888", marginTop: 5 }}>
            (Función no disponible sin backend)
          </Text>
        </LinearGradient>

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
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "#222",
            }}
          />

          <TouchableOpacity
            style={{
              backgroundColor: "#22c55e",
              padding: 14,
              borderRadius: 10,
              marginBottom: 15,
            }}
            onPress={handleFakeReset}
          >
            <Text
              style={{
                color: "black",
                textAlign: "center",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              Enviar correo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text
              style={{
                color: "#22c55e",
                textAlign: "center",
                fontSize: 16,
                marginTop: 10,
              }}
            >
              Volver al inicio de sesión
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
