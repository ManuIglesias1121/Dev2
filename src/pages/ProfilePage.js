import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as ScreenCapture from "expo-screen-capture";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../contexts/AuthContext";
import {
  uploadPublicPhoto,
  uploadExclusivePhoto,
  deletePublicPhoto,
  deleteExclusivePhoto,
  getExclusivePhotoUrls,
  savePhotosToProfile,
  MAX_PUBLIC_PHOTOS,
  MAX_EXCLUSIVE_PHOTOS,
} from "../services/photoService";

export default function ProfilePage({ navigation }) {
  const { user, logout, updateUser } = useContext(AuthContext);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fotos públicas (URLs en Supabase)
  const [publicPhotos, setPublicPhotos] = useState(user?.photos || []);
  const [pendingPublic, setPendingPublic] = useState([]);
  const [uploadingPublic, setUploadingPublic] = useState(false);

  // Fotos exclusivas (paths en Supabase, se muestran via signed URLs)
  const [exclusivePaths, setExclusivePaths] = useState(user?.exclusive_photos || []);
  const [exclusiveUrls, setExclusiveUrls] = useState([]);
  const [pendingExclusive, setPendingExclusive] = useState([]);
  const [uploadingExclusive, setUploadingExclusive] = useState(false);
  const [loadingExclusive, setLoadingExclusive] = useState(false);

  const isPremium = user?.isPremium || user?.is_premium || false;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    // Cargar signed URLs para fotos exclusivas propias
    if (isPremium && exclusivePaths.length > 0) {
      setLoadingExclusive(true);
      getExclusivePhotoUrls(exclusivePaths)
        .then(setExclusiveUrls)
        .finally(() => setLoadingExclusive(false));
    }
  }, []);

  // Bloquear capturas de pantalla cuando hay fotos exclusivas en pantalla
  useEffect(() => {
    if (isPremium && exclusivePaths.length > 0) {
      ScreenCapture.preventScreenCaptureAsync().catch(() => {});
      return () => {
        ScreenCapture.allowScreenCaptureAsync().catch(() => {});
      };
    }
  }, [isPremium, exclusivePaths.length]);

  const pickPhoto = async (type) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permiso necesario", "Activa el acceso a la galería en Ajustes.");
      return;
    }
    const limit = type === "public" ? MAX_PUBLIC_PHOTOS : MAX_EXCLUSIVE_PHOTOS;
    const current = type === "public" ? publicPhotos.length + pendingPublic.length : exclusivePaths.length + pendingExclusive.length;
    if (current >= limit) {
      Alert.alert("Límite alcanzado", `Máximo ${limit} fotos ${type === "public" ? "públicas" : "exclusivas"}.`);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      if (type === "public") setPendingPublic((p) => [...p, result.assets[0].uri]);
      else setPendingExclusive((p) => [...p, result.assets[0].uri]);
    }
  };

  const uploadPublicPhotos = async () => {
    if (!pendingPublic.length || !user?.supabaseId) return;
    setUploadingPublic(true);
    try {
      const urls = await Promise.all(pendingPublic.map((uri) => uploadPublicPhoto(user.supabaseId, uri)));
      const updated = [...publicPhotos, ...urls];
      await savePhotosToProfile(user.supabaseId, { photos: updated });
      setPublicPhotos(updated);
      updateUser({ photos: updated });
      setPendingPublic([]);
      Alert.alert("¡Listo!", `${urls.length} foto${urls.length > 1 ? "s" : ""} pública${urls.length > 1 ? "s" : ""} subida${urls.length > 1 ? "s" : ""}.`);
    } catch (e) {
      console.error("Upload public photos error:", e);
      Alert.alert("Error al subir", e?.message || JSON.stringify(e) || "Error desconocido");
    } finally {
      setUploadingPublic(false);
    }
  };

  const uploadExclusivePhotos = async () => {
    if (!pendingExclusive.length || !user?.supabaseId) return;
    setUploadingExclusive(true);
    try {
      const paths = await Promise.all(pendingExclusive.map((uri) => uploadExclusivePhoto(user.supabaseId, uri)));
      const updatedPaths = [...exclusivePaths, ...paths];
      await savePhotosToProfile(user.supabaseId, { exclusivePhotos: updatedPaths });
      const newUrls = await getExclusivePhotoUrls(paths);
      setExclusivePaths(updatedPaths);
      setExclusiveUrls((prev) => [...prev, ...newUrls]);
      updateUser({ exclusive_photos: updatedPaths });
      setPendingExclusive([]);
      Alert.alert("¡Listo!", `${paths.length} foto${paths.length > 1 ? "s" : ""} exclusiva${paths.length > 1 ? "s" : ""} subida${paths.length > 1 ? "s" : ""}.`);
    } catch (e) {
      console.error("Upload exclusive photos error:", e);
      Alert.alert("Error al subir exclusivas", e?.message || JSON.stringify(e) || "Error desconocido");
    } finally {
      setUploadingExclusive(false);
    }
  };

  const removePublicPhoto = (index) => {
    Alert.alert("Eliminar foto", "¿Eliminar esta foto pública?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          try {
            await deletePublicPhoto(publicPhotos[index]);
          } catch {}
          const updated = publicPhotos.filter((_, i) => i !== index);
          await savePhotosToProfile(user.supabaseId, { photos: updated });
          setPublicPhotos(updated);
          updateUser({ photos: updated });
        },
      },
    ]);
  };

  const removeExclusivePhoto = (index) => {
    Alert.alert("Eliminar foto exclusiva", "¿Eliminar esta foto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          try {
            await deleteExclusivePhoto(exclusivePaths[index]);
          } catch {}
          const updatedPaths = exclusivePaths.filter((_, i) => i !== index);
          const updatedUrls = exclusiveUrls.filter((_, i) => i !== index);
          await savePhotosToProfile(user.supabaseId, { exclusivePhotos: updatedPaths });
          setExclusivePaths(updatedPaths);
          setExclusiveUrls(updatedUrls);
          updateUser({ exclusive_photos: updatedPaths });
        },
      },
    ]);
  };

  // 🟩 PROTECCIÓN: evita crash si user es null
  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
        <Text style={{ color: "white", fontSize: 20 }}>
          Inicia sesión para ver tu perfil
        </Text>
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: "black" }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* HEADER */}
        <LinearGradient
          colors={["#0f0f0f", "#1a1a1a", "#000"]}
          style={{
            paddingTop: 60,
            paddingBottom: 40,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderColor: "#222",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 32,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Mi Perfil
          </Text>
        </LinearGradient>

        {/* AVATAR */}
        <View
          style={{
            marginTop: -50,
            alignSelf: "center",
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: "#222",
            borderWidth: 3,
            borderColor: "#444",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {user.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <Text style={{ color: "#666", fontSize: 50 }}>👤</Text>
          )}
        </View>

        {/* BOTONES EDITAR / CONFIGURACIÓN */}
        <View style={{ flexDirection: "row", alignSelf: "center", marginTop: 15, gap: 10 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#16a34a",
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
            onPress={() => navigation.navigate("ProfileEdit")}
          >
            <Text style={{ color: "white", fontSize: 16 }}>✏️ Editar perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "#333",
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 20,
            }}
            onPress={() => navigation.navigate("Settings")}
          >
            <Text style={{ color: "white", fontSize: 16 }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* CARD PRINCIPAL */}
        <View
          style={{
            backgroundColor: "#111",
            marginTop: 25,
            marginHorizontal: 20,
            padding: 20,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#222",
          }}
        >
          {/* Nombre */}
          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 5,
            }}
          >
            {user.display_name ?? user.name ?? "Sin nombre"}
          </Text>

          {/* BIO */}
          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Biografía</Text>
            <Text style={{ color: "white", fontSize: 16 }}>
              {user.biography ?? "—"}
            </Text>
          </View>

          {/* Theriotype */}
          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Theriotype</Text>
            <Text style={{ color: "white", fontSize: 18 }}>
              {user.primary_theriotype ?? "—"}
            </Text>
          </View>

          {/* Familia */}
          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Familia</Text>
            <Text style={{ color: "white", fontSize: 18 }}>
              {user.species_family ?? "—"}
            </Text>
          </View>

          {/* Habitat */}
          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Hábitat</Text>
            <Text style={{ color: "white", fontSize: 18 }}>
              {user.habitat ?? "—"}
            </Text>
          </View>

          {/* Rol */}
          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Rol en la manada</Text>
            <Text style={{ color: "white", fontSize: 18 }}>
              {user.pack_role ?? "—"}
            </Text>
          </View>

          {/* Estado Premium */}
          <View
            style={{
              marginTop: 10,
              padding: 12,
              borderRadius: 8,
              backgroundColor: user.isPremium ? "#14532d" : "#3f3f46",
            }}
          >
            <Text
              style={{
                color: user.isPremium ? "#22c55e" : "#aaa",
                textAlign: "center",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {user.isPremium ? "Cuenta Premium" : "Cuenta Gratuita"}
            </Text>
          </View>
        </View>

        {/* FOTOS PÚBLICAS */}
        <PhotoSection
          title="Fotos del perfil"
          subtitle={`Visibles para todos · máx ${MAX_PUBLIC_PHOTOS}`}
          accentColor="#16a34a"
          photos={publicPhotos}
          pending={pendingPublic}
          uploading={uploadingPublic}
          canAdd={publicPhotos.length + pendingPublic.length < MAX_PUBLIC_PHOTOS}
          onPick={() => pickPhoto("public")}
          onRemoveSaved={removePublicPhoto}
          onRemovePending={(i) => setPendingPublic((p) => p.filter((_, j) => j !== i))}
          onUpload={uploadPublicPhotos}
        />

        {/* FOTOS EXCLUSIVAS */}
        <View style={{ marginTop: 8, paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>Fotos exclusivas</Text>
            <View style={{ backgroundColor: "#a78bfa22", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "#a78bfa" }}>
              <Text style={{ color: "#c084fc", fontSize: 11, fontWeight: "bold" }}>👑 PREMIUM</Text>
            </View>
          </View>
          <Text style={{ color: "#666", fontSize: 13, marginBottom: 16 }}>
            Solo visibles para usuarios premium · máx {MAX_EXCLUSIVE_PHOTOS}
          </Text>

          {isPremium ? (
            loadingExclusive ? (
              <ActivityIndicator color="#a78bfa" style={{ marginVertical: 20 }} />
            ) : (
              <PhotoSection
                title=""
                subtitle=""
                accentColor="#a78bfa"
                photos={exclusiveUrls}
                pending={pendingExclusive}
                uploading={uploadingExclusive}
                canAdd={exclusivePaths.length + pendingExclusive.length < MAX_EXCLUSIVE_PHOTOS}
                onPick={() => pickPhoto("exclusive")}
                onRemoveSaved={removeExclusivePhoto}
                onRemovePending={(i) => setPendingExclusive((p) => p.filter((_, j) => j !== i))}
                onUpload={uploadExclusivePhotos}
                hideHeader
              />
            )
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate("PremiumPlans")}
              style={{
                backgroundColor: "rgba(167,139,250,0.08)",
                borderRadius: 14,
                padding: 24,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#a78bfa44",
                borderStyle: "dashed",
                gap: 10,
              }}
            >
              <Text style={{ fontSize: 36 }}>🔒</Text>
              <Text style={{ color: "#c084fc", fontSize: 16, fontWeight: "bold" }}>Fotos exclusivas Premium</Text>
              <Text style={{ color: "#888", fontSize: 13, textAlign: "center" }}>
                Subí fotos que solo verán usuarios premium. Aumenta tus matches de calidad.
              </Text>
              <View style={{ backgroundColor: "#a78bfa", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 4 }}>
                <Text style={{ color: "white", fontWeight: "bold" }}>Ver planes Premium →</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* BOTÓN CERRAR SESIÓN */}
        <TouchableOpacity
          style={{
            backgroundColor: "#b91c1c",
            padding: 14,
            borderRadius: 10,
            marginTop: 30,
            marginHorizontal: 20,
          }}
          onPress={logout}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
}

function PhotoSection({ title, subtitle, accentColor, photos, pending, uploading, canAdd, onPick, onRemoveSaved, onRemovePending, onUpload, hideHeader }) {
  return (
    <View style={{ paddingHorizontal: 20, marginTop: hideHeader ? 0 : 30 }}>
      {!hideHeader && (
        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>{title}</Text>
          <Text style={{ color: "#666", fontSize: 13, marginTop: 2 }}>{subtitle}</Text>
        </View>
      )}

      {/* Fotos guardadas */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        {photos.map((uri, i) => (
          <View key={"saved-" + i} style={{ position: "relative" }}>
            <Image source={{ uri }} style={{ width: 100, height: 100, borderRadius: 10 }} />
            <TouchableOpacity
              onPress={() => onRemoveSaved(i)}
              style={{ position: "absolute", top: 4, right: 4, backgroundColor: "rgba(0,0,0,0.7)", borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center" }}
            >
              <Ionicons name="close" size={12} color="white" />
            </TouchableOpacity>
          </View>
        ))}
        {canAdd && (
          <TouchableOpacity
            onPress={onPick}
            style={{ width: 100, height: 100, borderRadius: 10, backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: accentColor + "66", borderStyle: "dashed", justifyContent: "center", alignItems: "center" }}
          >
            <Ionicons name="add" size={28} color={accentColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Fotos pendientes */}
      {pending.length > 0 && (
        <View style={{ marginTop: 8 }}>
          <Text style={{ color: "#888", fontSize: 12, marginBottom: 8 }}>Pendientes ({pending.length})</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            {pending.map((uri, i) => (
              <View key={"pend-" + i} style={{ position: "relative" }}>
                <Image source={{ uri }} style={{ width: 100, height: 100, borderRadius: 10, opacity: 0.6 }} />
                <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 10, borderWidth: 2, borderColor: "#f59e0b", borderStyle: "dashed" }} />
                <TouchableOpacity
                  onPress={() => onRemovePending(i)}
                  style={{ position: "absolute", top: 4, right: 4, backgroundColor: "rgba(0,0,0,0.8)", borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center" }}
                >
                  <Ionicons name="close" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity
            onPress={onUpload}
            disabled={uploading}
            style={{ backgroundColor: uploading ? "#1a1a1a" : accentColor, paddingVertical: 13, borderRadius: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 }}
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
          onPress={onPick}
          style={{ backgroundColor: "#111", padding: 30, borderRadius: 12, borderWidth: 1, borderColor: "#333", borderStyle: "dashed", alignItems: "center", gap: 8 }}
        >
          <Ionicons name="camera-outline" size={36} color="#555" />
          <Text style={{ color: "#555", fontSize: 14 }}>Toca para agregar fotos</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
