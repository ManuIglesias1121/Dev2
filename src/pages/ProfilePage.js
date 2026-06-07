import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../contexts/AuthContext";
import {
  uploadProfilePhoto,
  deleteProfilePhoto,
  savePhotosToProfile,
  MAX_PHOTOS,
} from "../services/photoService";

export default function ProfilePage({ navigation }) {
  const { user, logout, updateUser } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [photos, setPhotos] = useState(user?.photos || []);
  const [pending, setPending] = useState([]);
  const [uploading, setUploading] = useState(false);

  const isPremium = user?.isPremium || user?.is_premium || false;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permiso necesario", "Activa el acceso a la galería en Ajustes.");
      return;
    }
    if (photos.length + pending.length >= MAX_PHOTOS) {
      Alert.alert("Límite alcanzado", `Máximo ${MAX_PHOTOS} fotos por perfil.`);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPending((p) => [...p, result.assets[0].uri]);
    }
  };

  const uploadPending = async () => {
    if (!pending.length || !user?.supabaseId) return;
    setUploading(true);
    try {
      const urls = await Promise.all(pending.map((uri) => uploadProfilePhoto(user.supabaseId, uri)));
      const updated = [...photos, ...urls];
      await savePhotosToProfile(user.supabaseId, { photos: updated });
      setPhotos(updated);
      updateUser({ photos: updated });
      setPending([]);
      Alert.alert("¡Listo!", `${urls.length} foto${urls.length > 1 ? "s" : ""} subida${urls.length > 1 ? "s" : ""}.`);
    } catch (e) {
      console.error("Upload photos error:", e);
      Alert.alert("Error al subir", e?.message || JSON.stringify(e) || "Error desconocido");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    Alert.alert("Eliminar foto", "¿Eliminar esta foto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          try {
            await deleteProfilePhoto(photos[index]);
          } catch {}
          const updated = photos.filter((_, i) => i !== index);
          await savePhotosToProfile(user.supabaseId, { photos: updated });
          setPhotos(updated);
          updateUser({ photos: updated });
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black" }}>
        <Text style={{ color: "white", fontSize: 20 }}>Inicia sesión para ver tu perfil</Text>
      </View>
    );
  }

  const canAdd = photos.length + pending.length < MAX_PHOTOS;

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: "black" }}
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
      >
        {/* HEADER */}
        <LinearGradient
          colors={["#0f0f0f", "#1a1a1a", "#000"]}
          style={{
            paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20,
            borderBottomWidth: 1, borderColor: "#222",
          }}
        >
          <Text style={{ color: "white", fontSize: 32, fontWeight: "bold", textAlign: "center" }}>
            Mi Perfil
          </Text>
        </LinearGradient>

        {/* AVATAR */}
        <View
          style={{
            marginTop: -50, alignSelf: "center",
            width: 120, height: 120, borderRadius: 60,
            backgroundColor: "#222", borderWidth: 3, borderColor: "#444",
            justifyContent: "center", alignItems: "center", overflow: "hidden",
          }}
        >
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={{ width: "100%", height: "100%" }} />
          ) : (
            <Text style={{ color: "#666", fontSize: 50 }}>👤</Text>
          )}
        </View>

        {/* BOTONES EDITAR / CONFIGURACIÓN */}
        <View style={{ flexDirection: "row", alignSelf: "center", marginTop: 15, gap: 10 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#16a34a", paddingVertical: 8, paddingHorizontal: 20,
              borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 6,
            }}
            onPress={() => navigation.navigate("ProfileEdit")}
          >
            <Text style={{ color: "white", fontSize: 16 }}>✏️ Editar perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: "#333", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 }}
            onPress={() => navigation.navigate("Settings")}
          >
            <Ionicons name="settings-outline" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* ACCESO A VISITANTES */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Visitors")}
          style={{
            flexDirection: "row", alignItems: "center",
            backgroundColor: isPremium ? "rgba(167,139,250,0.1)" : "rgba(167,139,250,0.05)",
            marginHorizontal: 20, marginTop: 20, padding: 14, borderRadius: 14,
            borderWidth: 1, borderColor: "#a78bfa44", gap: 12,
          }}
        >
          <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(167,139,250,0.2)", justifyContent: "center", alignItems: "center" }}>
            <Ionicons name={isPremium ? "eye" : "lock-closed"} size={20} color="#a78bfa" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "white", fontSize: 15, fontWeight: "600" }}>
              {isPremium ? "Quién visitó tu perfil" : "Ver visitantes 👑"}
            </Text>
            <Text style={{ color: "#888", fontSize: 12, marginTop: 2 }}>
              {isPremium ? "Mirá quién estuvo viendo tu perfil" : "Solo para usuarios Premium"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#666" />
        </TouchableOpacity>

        {/* CARD PRINCIPAL */}
        <View
          style={{
            backgroundColor: "#111", marginTop: 25, marginHorizontal: 20,
            padding: 20, borderRadius: 12, borderWidth: 1, borderColor: "#222",
          }}
        >
          <Text style={{ color: "white", fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 5 }}>
            {user.display_name ?? user.name ?? "Sin nombre"}
          </Text>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Biografía</Text>
            <Text style={{ color: "white", fontSize: 16 }}>{user.biography ?? "—"}</Text>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Theriotype</Text>
            <Text style={{ color: "white", fontSize: 18 }}>{user.primary_theriotype ?? "—"}</Text>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Familia</Text>
            <Text style={{ color: "white", fontSize: 18 }}>{user.species_family ?? "—"}</Text>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Hábitat</Text>
            <Text style={{ color: "white", fontSize: 18 }}>{user.habitat ?? "—"}</Text>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Rol en la manada</Text>
            <Text style={{ color: "white", fontSize: 18 }}>{user.pack_role ?? "—"}</Text>
          </View>

          <View
            style={{
              marginTop: 10, padding: 12, borderRadius: 8,
              backgroundColor: isPremium ? "#14532d" : "#3f3f46",
            }}
          >
            <Text
              style={{
                color: isPremium ? "#22c55e" : "#aaa",
                textAlign: "center", fontSize: 16, fontWeight: "bold",
              }}
            >
              {isPremium ? "Cuenta Premium" : "Cuenta Gratuita"}
            </Text>
          </View>
        </View>

        {/* FOTOS DEL PERFIL — único lugar */}
        <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>Fotos del perfil</Text>
            <Text style={{ color: "#666", fontSize: 13, marginTop: 2 }}>
              {photos.length}/{MAX_PHOTOS} · visibles para todos
            </Text>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            {photos.map((uri, i) => (
              <View key={"saved-" + i} style={{ position: "relative" }}>
                <Image source={{ uri }} style={{ width: 100, height: 100, borderRadius: 10 }} />
                <TouchableOpacity
                  onPress={() => removePhoto(i)}
                  style={{ position: "absolute", top: 4, right: 4, backgroundColor: "rgba(0,0,0,0.7)", borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center" }}
                >
                  <Ionicons name="close" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            {canAdd && (
              <TouchableOpacity
                onPress={pickPhoto}
                style={{ width: 100, height: 100, borderRadius: 10, backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: "#16a34a66", borderStyle: "dashed", justifyContent: "center", alignItems: "center" }}
              >
                <Ionicons name="add" size={28} color="#16a34a" />
              </TouchableOpacity>
            )}
          </View>

          {pending.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ color: "#888", fontSize: 12, marginBottom: 8 }}>Pendientes ({pending.length})</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                {pending.map((uri, i) => (
                  <View key={"pend-" + i} style={{ position: "relative" }}>
                    <Image source={{ uri }} style={{ width: 100, height: 100, borderRadius: 10, opacity: 0.6 }} />
                    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 10, borderWidth: 2, borderColor: "#f59e0b", borderStyle: "dashed" }} />
                    <TouchableOpacity
                      onPress={() => setPending((p) => p.filter((_, j) => j !== i))}
                      style={{ position: "absolute", top: 4, right: 4, backgroundColor: "rgba(0,0,0,0.8)", borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center" }}
                    >
                      <Ionicons name="close" size={12} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                onPress={uploadPending}
                disabled={uploading}
                style={{ backgroundColor: uploading ? "#1a1a1a" : "#16a34a", paddingVertical: 13, borderRadius: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 }}
              >
                <Ionicons name={uploading ? "sync" : "cloud-upload-outline"} size={20} color="white" />
                <Text style={{ color: "white", fontSize: 15, fontWeight: "bold" }}>
                  {uploading ? "Subiendo..." : `Subir ${pending.length} foto${pending.length > 1 ? "s" : ""}`}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {photos.length === 0 && pending.length === 0 && (
            <TouchableOpacity
              onPress={pickPhoto}
              style={{ backgroundColor: "#111", padding: 30, borderRadius: 12, borderWidth: 1, borderColor: "#333", borderStyle: "dashed", alignItems: "center", gap: 8 }}
            >
              <Ionicons name="camera-outline" size={36} color="#555" />
              <Text style={{ color: "#555", fontSize: 14 }}>Toca para agregar fotos</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* BOTÓN CERRAR SESIÓN */}
        <TouchableOpacity
          style={{
            backgroundColor: "#b91c1c", padding: 14, borderRadius: 10,
            marginTop: 30, marginHorizontal: 20,
          }}
          onPress={logout}
        >
          <Text style={{ color: "white", textAlign: "center", fontSize: 18, fontWeight: "bold" }}>
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
}
