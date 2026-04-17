import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function UploadPhotos({
  userId,
  currentPhotos,
  maxPhotos,
  onUpdated,
}) {
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    if (currentPhotos.length >= maxPhotos) {
      Alert.alert("Límite alcanzado", `Podés subir hasta ${maxPhotos} fotos.`);
      return;
    }

    try {
      setUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;

        // Guardamos la foto localmente
        const newPhotos = [...currentPhotos, uri];

        // Devolvemos la nueva lista al componente padre
        onUpdated(newPhotos);
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo seleccionar la foto");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ width: "100%" }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {currentPhotos.map((p, i) => (
          <Image key={i} source={{ uri: p }} style={styles.photo} />
        ))}

        <TouchableOpacity style={styles.addButton} onPress={pickImage}>
          <Text style={styles.addText}>{uploading ? "..." : "+"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#22c55e55",
  },
  addText: {
    color: "#22c55e",
    fontSize: 40,
    fontWeight: "700",
  },
});
