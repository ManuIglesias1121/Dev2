import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

// Convierte cualquier formato razonable a una URL string.
// Devuelve null si no se puede interpretar (números/requires se descartan
// para evitar el bug "Value for uri cannot be cast from Double to String").
function toUriString(img) {
  if (img == null) return null;
  if (typeof img === "string" && img.length > 0) return img;
  if (typeof img === "object") {
    if (typeof img.uri === "string") return img.uri;
    if (typeof img.url === "string") return img.url;
    if (typeof img.publicUrl === "string") return img.publicUrl;
  }
  return null; // descarta números, objetos vacíos, requires, etc.
}

export default function GalleryPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { photos: rawPhotos, initialIndex = 0 } = route.params || {};

  // Filtrar antes de renderizar
  const photos = (rawPhotos || []).map(toUriString).filter(Boolean);
  const safeInitial = Math.min(initialIndex, Math.max(0, photos.length - 1));
  const [currentIndex, setCurrentIndex] = useState(safeInitial);

  if (photos.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "white", fontSize: 16, marginBottom: 24 }}>
          No hay fotos para mostrar
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: "#22c55e", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={safeInitial}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image
              source={{ uri: item }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}
      />

      <View style={styles.counter}>
        <Text style={styles.counterText}>{currentIndex + 1} / {photos.length}</Text>
      </View>

      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  slide: { width, height, justifyContent: "center", alignItems: "center" },
  image: { width, height },
  counter: {
    position: "absolute",
    top: 56,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  counterText: { color: "white", fontSize: 14 },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
