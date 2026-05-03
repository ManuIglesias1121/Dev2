// Mock de publicidad para Expo Go
// Cuando se haga EAS Build con react-native-google-mobile-ads, reemplazar por la implementación real

export async function showInterstitialAd() {
  // En producción: mostrar anuncio intersticial real
  return true;
}

export async function showRewardedAd(onRewarded) {
  // Simula el video con un delay y otorga la recompensa
  await new Promise((r) => setTimeout(r, 1500));
  onRewarded?.();
  return true;
}
