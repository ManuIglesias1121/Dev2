import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function UploadAvatar({ onUploaded }) {
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    try {
      setUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;

        // En vez de subir a Supabase, devolvemos la URI local
        onUploaded(uri);
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={pickImage}>
      <Text style={styles.buttonText}>
        {uploading ? "Cargando..." : "Cambiar avatar"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
  },
});
