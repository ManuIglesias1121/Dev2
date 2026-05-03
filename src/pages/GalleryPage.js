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

function resolveSource(img) {
  if (!img) return null;
  return typeof img === "string" ? { uri: img } : img;
}

export default function GalleryPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { photos, initialIndex = 0 } = route.params;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image
              source={resolveSource(item)}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}
      />

      {/* Contador */}
      <View style={styles.counter}>
        <Text style={styles.counterText}>{currentIndex + 1} / {photos.length}</Text>
      </View>

      {/* Botón cerrar */}
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
