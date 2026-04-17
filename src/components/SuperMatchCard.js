import React from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SuperMatchCard({ match, onMatch }) {
  
  const handleReply = () => {
    // En vez de insertar en Supabase, avisamos al componente padre
    if (onMatch) {
      onMatch(match);
    }

    Alert.alert("Match", "Ahora están macheados 🔥");
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: match.sender.photo }} style={styles.photo} />

      <View style={styles.info}>
        <Text style={styles.name}>{match.sender.name}</Text>
        <Text style={styles.message}>{match.message}</Text>

        <TouchableOpacity style={styles.button} onPress={handleReply}>
          <Text style={styles.buttonText}>Responder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(0,150,255,0.3)",
  },
  photo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  name: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  message: {
    color: "#ccc",
    marginVertical: 8,
  },
  button: {
    backgroundColor: "#4db8ff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
  },
});
