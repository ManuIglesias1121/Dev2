import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { supabase } from "../lib/supabase";

export default function UploadAvatar({ userId, onUploaded }) {
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    try {
      setUploading(true);

      const ext = uri.split(".").pop() || "jpg";
      const fileName = `${userId}-avatar.${ext}`;
      const filePath = `avatars/${fileName}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from("avatares")
        .upload(filePath, blob, { upsert: true });

      if (error) throw error;

      const { data } = supabase.storage
        .from("avatares")
        .getPublicUrl(filePath);

      onUploaded(data.publicUrl);
    } catch (e) {
      Alert.alert("Error", "No se pudo subir el avatar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={pickImage}>
      <Text style={styles.buttonText}>
        {uploading ? "Subiendo..." : "Cambiar avatar"}
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
