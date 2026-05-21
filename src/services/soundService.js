import { Vibration } from "react-native";
import { loadData, saveData } from "./storageService";

const NOTIFICATION_SOUND = require("../../assets/sounds/notification.mp3");

const SOUND_PREFS_KEY = "sound_preferences";

const DEFAULT_PREFS = {
  masterEnabled: true,
  mode: "sound", // "both" | "sound" | "vibration" | "silent" — default solo sonido
  features: {
    chatMessage: true,
    superMatch: true,
  },
};

let cachedPrefs = null;

export async function getSoundPreferences() {
  if (cachedPrefs) return cachedPrefs;
  const saved = await loadData(SOUND_PREFS_KEY, DEFAULT_PREFS);
  cachedPrefs = {
    ...DEFAULT_PREFS,
    ...saved,
    features: { ...DEFAULT_PREFS.features, ...(saved?.features || {}) },
  };
  return cachedPrefs;
}

export async function setSoundPreferences(prefs) {
  cachedPrefs = prefs;
  await saveData(SOUND_PREFS_KEY, prefs);
}

export async function updateFeaturePreference(featureKey, enabled) {
  const prefs = await getSoundPreferences();
  prefs.features[featureKey] = enabled;
  await setSoundPreferences({ ...prefs });
}

export async function setMode(mode) {
  const prefs = await getSoundPreferences();
  await setSoundPreferences({ ...prefs, mode });
}

export async function setMasterEnabled(enabled) {
  const prefs = await getSoundPreferences();
  await setSoundPreferences({ ...prefs, masterEnabled: enabled });
}

const VIBRATION_PATTERNS = {
  chatMessage: 30,
  newMatch: [0, 60, 50, 60],
  superMatch: [0, 80, 60, 80, 60, 80],
  notification: [0, 40, 30, 40],
  swipe: 15,
};

let Haptics = null;
async function getHaptics() {
  if (Haptics) return Haptics;
  try {
    Haptics = await import("expo-haptics");
    return Haptics;
  } catch {
    return null;
  }
}

let Audio = null;
let cachedSound = null;
async function getAudio() {
  if (Audio) return Audio;
  try {
    const mod = await import("expo-av");
    Audio = mod.Audio;
    return Audio;
  } catch {
    return null;
  }
}

// Carga el sonido una sola vez y lo reusa (evita recrear cada vez)
async function getCachedSound() {
  if (cachedSound) return cachedSound;
  try {
    const AudioMod = await getAudio();
    if (!AudioMod) return null;
    await AudioMod.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    const { sound } = await AudioMod.Sound.createAsync(NOTIFICATION_SOUND, {
      volume: 0.7,
      shouldPlay: false,
    });
    cachedSound = sound;
    return cachedSound;
  } catch (e) {
    console.warn("No se pudo cargar el sonido:", e?.message);
    return null;
  }
}

async function playSound() {
  try {
    const sound = await getCachedSound();
    if (!sound) return;
    await sound.replayAsync(); // replay desde el inicio aunque ya esté sonando
  } catch {}
}

const HAPTIC_TYPES = {
  chatMessage: "impactLight",
  newMatch: "notificationSuccess",
  superMatch: "notificationSuccess",
  notification: "impactMedium",
  swipe: "selection",
};

export async function playFeedback(featureKey) {
  const prefs = await getSoundPreferences();

  if (!prefs.masterEnabled) return;
  if (!prefs.features[featureKey]) return;
  if (prefs.mode === "silent") return;

  // Vibración (solo si el usuario explícitamente la activó)
  if (prefs.mode === "both" || prefs.mode === "vibration") {
    const pattern = VIBRATION_PATTERNS[featureKey] ?? 30;
    try {
      Vibration.vibrate(pattern);
    } catch {}
  }

  if (prefs.mode === "both" || prefs.mode === "sound") {
    await playSound();
  }
}
