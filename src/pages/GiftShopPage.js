import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { showRewardedAd } from "../services/adService";

export default function GiftShopPage() {
  const { user, GIFT_FEATURES, buyGift, addCoins } = useAuth();
  const [selectedGift, setSelectedGift] = useState(null);
  const [justBought, setJustBought] = useState(null);
  const [watchingAd, setWatchingAd] = useState(false);
  const COINS_PER_AD = 50;

  const handleWatchAd = async () => {
    setWatchingAd(true);
    const rewarded = await showRewardedAd(() => {
      addCoins(COINS_PER_AD);
      Alert.alert("¡Ganaste monedas!", `+${COINS_PER_AD} monedas añadidas 💰`);
    });
    if (!rewarded) {
      Alert.alert("Sin publicidad disponible", "Intentá de nuevo en unos segundos.");
    }
    setWatchingAd(false);
  };

  const handleBuyGift = (giftId) => {
    const gift = GIFT_FEATURES[giftId];
    const coinsCost = parseInt(gift.price.replace("$", "")) * 10;

    if ((user?.coins || 0) < coinsCost) {
      Alert.alert(
        "Monedas insuficientes",
        `Necesitas ${coinsCost} monedas. Tienes ${user?.coins || 0}.`
      );
      return;
    }

    if (user?.gifts.includes(giftId)) {
      Alert.alert("Ya tienes este regalo", "Compra otro diferente");
      return;
    }

    buyGift(giftId);
    setJustBought(giftId);
    setTimeout(() => setJustBought(null), 2000);
  };

  const GiftCard = ({ giftId, gift }) => {
    const isOwned = user?.gifts.includes(giftId);
    const isBought = justBought === giftId;
    const finalPrice = gift.isLimited
      ? (parseInt(gift.price.replace("$", "")) * (1 - gift.discount)).toFixed(2)
      : gift.price.replace("$", "");

    return (
      <TouchableOpacity
        onPress={() => setSelectedGift(giftId)}
        style={[
          styles.giftCard,
          isBought && styles.giftCardBought,
          isOwned && styles.giftCardOwned,
        ]}
      >
        <LinearGradient
          colors={[gift.color + "44", gift.color + "22"]}
          style={styles.giftGradient}
        >
          {/* Limited Time Badge */}
          {gift.isLimited && (
            <View style={styles.limitedBadge}>
              <Text style={styles.limitedText}>⏰ {gift.expiresIn}</Text>
            </View>
          )}

          <Text style={styles.giftIcon}>{gift.icon}</Text>
          <Text style={styles.giftName}>{gift.name}</Text>
          <Text style={styles.giftDescription}>{gift.description}</Text>

          <View style={styles.giftFooter}>
            <View style={styles.priceContainer}>
              {gift.isLimited && (
                <Text style={styles.originalPrice}>
                  ${gift.price.replace("$", "")}
                </Text>
              )}
              <Text
                style={[
                  styles.giftPrice,
                  gift.isLimited && styles.discountedPrice,
                ]}
              >
                ${finalPrice}
              </Text>
            </View>
            {isOwned && (
              <Text style={styles.ownedBadge}>✓ Tuyo</Text>
            )}
          </View>

          {isBought && <Text style={styles.successMessage}>¡Comprado!</Text>}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a1a2e", "#312e81"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎁 Tienda de Regalos</Text>
          <View style={styles.coinsContainer}>
            <Text style={styles.coinsIcon}>💰</Text>
            <Text style={styles.coinsText}>{user?.coins || 0} monedas</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Compra regalos especiales para desbloquear funciones en tu chat. 
            Los regalos añaden efectos y características únicas.
          </Text>
        </View>

        {/* Regalos Grid */}
        <View style={styles.gridContainer}>
          {Object.entries(GIFT_FEATURES).map(([giftId, gift]) => (
            <GiftCard key={giftId} giftId={giftId} gift={gift} />
          ))}
        </View>

        {/* Detail View */}
        {selectedGift && (
          <View style={styles.detailOverlay}>
            <View style={styles.detailBox}>
              <TouchableOpacity
                onPress={() => setSelectedGift(null)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>

              <Text style={styles.detailIcon}>
                {GIFT_FEATURES[selectedGift].icon}
              </Text>
              <Text style={styles.detailName}>
                {GIFT_FEATURES[selectedGift].name}
              </Text>
              <Text style={styles.detailPrice}>
                {GIFT_FEATURES[selectedGift].price}
              </Text>

              <Text style={styles.detailDesc}>
                {GIFT_FEATURES[selectedGift].description}
              </Text>

              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>Desbloquea:</Text>
                {GIFT_FEATURES[selectedGift].features.map((feature) => (
                  <Text key={feature} style={styles.featureItem}>
                    ✨ {feature}
                  </Text>
                ))}
              </View>

              <TouchableOpacity
                style={styles.buyButton}
                onPress={() => {
                  handleBuyGift(selectedGift);
                  setSelectedGift(null);
                }}
                disabled={user?.gifts.includes(selectedGift)}
              >
                <Text style={styles.buyButtonText}>
                  {user?.gifts.includes(selectedGift)
                    ? "Ya posees este regalo ✓"
                    : "Comprar regalo"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Ver video para ganar monedas */}
        <TouchableOpacity
          style={[styles.watchAdButton, watchingAd && styles.watchAdButtonDisabled]}
          onPress={handleWatchAd}
          disabled={watchingAd}
        >
          {watchingAd ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.watchAdIcon}>▶️</Text>
              <View>
                <Text style={styles.watchAdTitle}>Ver video publicitario</Text>
                <Text style={styles.watchAdSubtitle}>Ganá {COINS_PER_AD} monedas gratis 💰</Text>
              </View>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  content: {
    paddingBottom: 60,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  coinsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  coinsIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  coinsText: {
    color: "#22c55e",
    fontWeight: "bold",
    fontSize: 16,
  },
  infoBox: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  infoText: {
    color: "#bbb",
    fontSize: 13,
    lineHeight: 18,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    justifyContent: "space-around",
  },
  giftCard: {
    width: "47%",
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  giftCardOwned: {
    borderColor: "#22c55e",
    borderWidth: 2,
  },
  giftCardBought: {
    borderColor: "#fbbf24",
  },
  giftGradient: {
    padding: 12,
    alignItems: "center",
  },
  giftIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  giftName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  giftDescription: {
    color: "#aaa",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 8,
  },
  giftFooter: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  giftPrice: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  discountedPrice: {
    color: "#fbbf24",
    fontSize: 14,
  },
  originalPrice: {
    color: "#666",
    fontSize: 10,
    textDecorationLine: "line-through",
  },
  limitedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  limitedText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
  ownedBadge: {
    color: "#22c55e",
    fontWeight: "bold",
    fontSize: 12,
  },
  successMessage: {
    color: "#fbbf24",
    position: "absolute",
    top: "50%",
    fontWeight: "bold",
    fontSize: 16,
  },
  detailOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  detailBox: {
    backgroundColor: "#1a1a2e",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    borderWidth: 1,
    borderColor: "#312e81",
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  detailIcon: {
    fontSize: 60,
    textAlign: "center",
    marginBottom: 12,
  },
  detailName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  detailPrice: {
    fontSize: 20,
    color: "#fbbf24",
    textAlign: "center",
    marginBottom: 12,
  },
  detailDesc: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  featuresContainer: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  featuresTitle: {
    color: "#3b82f6",
    fontWeight: "bold",
    marginBottom: 8,
  },
  featureItem: {
    color: "#bbb",
    fontSize: 12,
    marginLeft: 8,
    marginBottom: 4,
  },
  buyButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  watchAdButton: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: "rgba(234, 179, 8, 0.15)",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#ca8a04",
    justifyContent: "center",
  },
  watchAdButtonDisabled: {
    opacity: 0.5,
  },
  watchAdIcon: {
    fontSize: 24,
  },
  watchAdTitle: {
    color: "#fbbf24",
    fontWeight: "bold",
    fontSize: 15,
  },
  watchAdSubtitle: {
    color: "#a16207",
    fontSize: 12,
    marginTop: 2,
  },
});
