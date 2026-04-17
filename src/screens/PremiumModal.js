import React, { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../contexts/AuthContext";

export default function PremiumModal({ navigation }) {
  const { togglePremium } = useContext(AuthContext);

  const handleUpgrade = () => {
    togglePremium();     // activa premium localmente
    navigation.goBack(); // cierra el modal
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Desbloqueá Super Match</Text>

      <Text style={styles.desc}>
        Enviá mensajes directos, destacate en la manada y aparecé primero.
        Tu energía se siente incluso antes de hablar.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleUpgrade}>
        <Text style={styles.buttonText}>Hacete Premium</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.close}>Cerrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 30,
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    color: "white",
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
  },
  desc: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 35,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#22c55e",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonText: {
    color: "black",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  close: {
    color: "#888",
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
  },
});
