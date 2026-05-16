import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

function resolveSource(img) {
  if (!img) return require("../../assets/logo1.png");
  return typeof img === "string" ? { uri: img } : img;
}

const gifts = [
  { id: 1, name: "👁️ Ver Visitantes", price: 1, feature: "Ver quién te visitó", duration: "24 horas" },
  { id: 2, name: "💎 Super Like", price: 1, feature: "Super Like ilimitado", duration: "12 horas" },
  { id: 3, name: "⭐ Destacar Perfil", price: 1, feature: "Perfil destacado", duration: "48 horas" },
];

export default function SuperMatchDetail({ route, navigation }) {
  const { match } = route.params || {};

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("Inicio");
  };

  if (!match || !match.sender) {
    return (
      <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity style={styles.floatingBackButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={{ color: 'red', fontSize: 20, textAlign: 'center' }}>
          Error: No se pudo cargar el Super Match.\nIntenta nuevamente.
        </Text>
      </View>
    );
  }

  const handleChat = () => {
    const senderId = match.sender?.id;
    const isRealUser = senderId && typeof senderId === "string" && senderId.length > 30;

    navigation.replace("ChatRoomPage", {
      name: match.sender.display_name,
      photo: match.sender.avatar,
      photos: match.sender?.photos || (match.sender.avatar ? [match.sender.avatar] : []),
      contactId: isRealUser ? senderId : `sm_${match.id}`,
      targetUserId: isRealUser ? senderId : null, // UUID → activa modo chat real
    });
  };

  const handleGift = (gift) => {
    alert(`¡Has desbloqueado "${gift.feature}" por ${gift.duration}!`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>
      <Text style={styles.superTitle}>¡Te han dado un Super Like!</Text>
      <TouchableOpacity
        onPress={() => {
          const photos = match.sender.photos?.length > 0 ? match.sender.photos : (match.sender.avatar ? [match.sender.avatar] : []);
          if (photos.length > 0) navigation.navigate("GalleryPage", { photos, initialIndex: 0 });
        }}
        activeOpacity={0.85}
      >
        <Image source={resolveSource(match.sender.avatar)} style={styles.avatar} />
        <View style={{ position: "absolute", bottom: 8, right: 4, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 10, padding: 4 }}>
          <Ionicons name="images-outline" size={14} color="white" />
        </View>
      </TouchableOpacity>
      <Text style={styles.name}>{match.sender.display_name}</Text>
      <Text style={styles.type}>{match.sender.primary_theriotype}</Text>
      <Text style={styles.stars}>✨✨✨</Text>

      <Text style={styles.giftTitle}>Regala una función premium temporal:</Text>
      <View style={styles.giftRow}>
        {gifts.map((gift) => (
          <TouchableOpacity key={gift.id} style={styles.giftBtn} onPress={() => handleGift(gift)}>
            <Text style={styles.giftIcon}>{gift.name}</Text>
            <Text style={styles.giftPrice}>{`USD ${gift.price}`}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.chatBtn} onPress={handleChat}>
        <Text style={styles.chatBtnText}>Chatear ahora</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  header: {
    width: "100%",
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
  },
  floatingBackButton: {
    position: "absolute",
    top: 24,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
  },
  headerSpacer: {
    width: 40,
  },
  superTitle: {
    color: "#22c55e",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 18,
    marginTop: 20,
    textAlign: "center",
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: "#22c55e",
    marginBottom: 16,
  },
  name: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  type: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 10,
  },
  stars: {
    fontSize: 32,
    color: "#ffd700",
    marginBottom: 18,
  },
  giftTitle: {
    color: "#22c55e",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  giftRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 4,
    marginBottom: 20,
    gap: 8,
  },
  giftBtn: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#22d3ee',
  },
  giftIcon: {
    fontSize: 13,
    marginBottom: 4,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  giftPrice: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 60,
    marginTop: 40,
    elevation: 8,
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  chatBtnText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: '#16a34a',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 6,
    textTransform: 'uppercase',
  },
});
