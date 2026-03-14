import React, { useContext } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";
import { AuthContext } from "../contexts/AuthContext";

export default function HomePage() {
  const { setScreen, setSelectedProfile } = useContext(AuthContext);

  const profiles = [
    {
      id: 1,
      name: "Luna",
      species: "Wolf Therian",
      avatar: "https://i.imgur.com/4ZQZ4.jpg",
    },
    {
      id: 2,
      name: "Raven",
      species: "Crow Therian",
      avatar: "https://i.imgur.com/8QZQZ.jpg",
    },
    {
      id: 3,
      name: "Ash",
      species: "Feline Therian",
      avatar: "https://i.imgur.com/7YQZQ.jpg",
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "black", padding: 20 }}>
      <Text style={styles.title}>Perfiles recomendados</Text>

      {profiles.map((p) => (
        <TouchableOpacity
          key={p.id}
          style={styles.card}
          onPress={() => {
            setSelectedProfile(p);     // guardamos el perfil seleccionado
            setScreen("profileDetail"); // navegamos a la pantalla de detalle
          }}
        >
          <Image source={{ uri: p.avatar }} style={styles.avatar} />

          <Text style={styles.name}>{p.name}</Text>
          <Text style={styles.species}>{p.species}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#222",
    alignItems: "center",
  },
  avatar: {
    width: "100%",
    height: 220,
    borderRadius: 15,
    marginBottom: 15,
  },
  name: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  species: {
    color: "#888",
    fontSize: 16,
    marginTop: 5,
  },
});
