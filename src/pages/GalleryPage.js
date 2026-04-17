// src/pages/GalleryPage.js

import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";

export default function GalleryPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { photos } = route.params;

  // Convertir photos a formato para ImageViewer
  const images = photos.map((url) => ({ url }));

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      
      {/* Botón de cerrar */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: "absolute",
          bottom: 40,
          left: 20,
          zIndex: 10,
          padding: 10,
          backgroundColor: "rgba(0,0,0,0.5)",
          borderRadius: 20,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#22c55e", fontSize: 32, fontWeight: "bold" }}>←</Text>
      </TouchableOpacity>

      {/* Galería con zoom */}
      <ImageViewer
        imageUrls={images}
        index={0}
        enableSwipeDown={true}
        onSwipeDown={() => navigation.goBack()}
        backgroundColor="black"
        renderIndicator={() => null} // Quitar indicadores si no los quieres
      />
    </View>
  );
}
