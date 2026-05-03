import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../services/supabase";

export default function RecoverPassword({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleRecover = async () => {
    if (!email.trim()) {
      Alert.alert("Falta el email", "Ingresa tu email.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: "https://theriansmatch.netlify.app" }
    );
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar contraseña</Text>

      {sent ? (
        <>
          <Text style={styles.successText}>
            ¡Listo! Revisa tu email para restablecer la contraseña.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Volver al login</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Tu email"
            placeholderTextColor="#777"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} onPress={handleRecover} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Enviando..." : "Enviar recuperación"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  title: { color: "white", fontSize: 22, marginBottom: 30 },
  input: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 8,
    color: "white",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  backText: { color: "#aaa", marginTop: 20, fontSize: 14 },
  successText: { color: "#22c55e", textAlign: "center", fontSize: 16, marginBottom: 30, lineHeight: 24 },
});
