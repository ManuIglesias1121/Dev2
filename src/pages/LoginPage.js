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

export default function LoginPage() {
  const { signIn, signInAsGuest, goToRegister } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Animación suave de entrada
const fadeAnim = useRef(new Animated.Value(0)).current;

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
        {/* HEADER CON GRADIENTE LUNAR */}
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
          {/* LOGO */}
          <Text style={{ fontSize: 60, color: "#22c55e" }}>🐾</Text>

          {/* TÍTULO */}
          <Text
            style={{
              color: "white",
              fontSize: 34,
              fontWeight: "bold",
              marginTop: 10,
            }}
          >
            TherianMatch
          </Text>

          {/* SUBTÍTULO */}
          <Text
            style={{
              color: "#888",
              fontSize: 16,
              marginTop: 5,
            }}
          >
            Conecta con tu comunidad
          </Text>
        </LinearGradient>

        {/* FORMULARIO */}
        <View style={{ padding: 25 }}>
          {/* EMAIL */}
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

          {/* PASSWORD */}
          <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
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

          {/* BOTÓN ENTRAR */}
          <TouchableOpacity
            style={{
              backgroundColor: "#22c55e",
              padding: 14,
              borderRadius: 10,
              marginBottom: 15,
            }}
            onPress={() => signIn(email, password)}
          >
            <Text
              style={{
                color: "black",
                textAlign: "center",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              Entrar
            </Text>
          </TouchableOpacity>

          {/* ENTRAR COMO INVITADO */}
          <TouchableOpacity
            style={{
              backgroundColor: "#333",
              padding: 12,
              borderRadius: 10,
              marginBottom: 15,
            }}
            onPress={signInAsGuest}
          >
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontSize: 16,
              }}
            >
              Entrar como invitado (Demo)
            </Text>
          </TouchableOpacity>

          {/* REGISTRO */}
          <TouchableOpacity onPress={goToRegister}>
            <Text
              style={{
                color: "#22c55e",
                textAlign: "center",
                fontSize: 16,
                marginTop: 10,
              }}
            >
              ¿No tienes cuenta? Regístrate
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
