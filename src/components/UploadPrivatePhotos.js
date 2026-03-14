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
import { supabase } from "../lib/supabase";

export default function UploadPrivatePhotos({
  userId,
  currentPhotos,
  maxPhotos,
  onUpdated,
}) {
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    if (currentPhotos.length >= maxPhotos) {
      Alert.alert(
        "Límite alcanzado",
        `Podés subir hasta ${maxPhotos} fotos privadas.`
      );
      return;
    }

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
      const fileName = `${userId}-private-${Date.now()}.${ext}`;
      const filePath = `private_photos/${fileName}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from("avatares")
        .upload(filePath, blob, { upsert: true });

      if (error) throw error;

      const { data } = supabase.storage
        .from("avatares")
        .getPublicUrl(filePath);

      const newPhotos = [...currentPhotos, data.publicUrl];

      await supabase
        .from("therian_profiles")
        .update({ private_photos: newPhotos })
        .eq("user_id", userId);

      onUpdated(newPhotos);
    } catch (e) {
      Alert.alert("Error", "No se pudo subir la foto privada");
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
    borderColor: "#facc15",
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#facc1555",
  },
  addText: {
    color: "#facc15",
    fontSize: 40,
    fontWeight: "700",
  },
});
