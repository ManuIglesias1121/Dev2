let AsyncStorage = null;

async function getStorage() {
  if (AsyncStorage) return AsyncStorage;
  try {
    const mod = await import("@react-native-async-storage/async-storage");
    AsyncStorage = mod.default;
    return AsyncStorage;
  } catch {
    return null;
  }
}

export async function saveData(key, value) {
  const storage = await getStorage();
  if (!storage) return false;
  try {
    await storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export async function loadData(key, fallback = null) {
  const storage = await getStorage();
  if (!storage) return fallback;
  try {
    const raw = await storage.getItem(key);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export async function removeData(key) {
  const storage = await getStorage();
  if (!storage) return;
  try {
    await storage.removeItem(key);
  } catch {}
}

export async function clearAll() {
  const storage = await getStorage();
  if (!storage) return;
  try {
    await storage.clear();
  } catch {}
}

// ---------------------------------------------------------
// Almacenamiento SEGURO (cifrado) — para credenciales sensibles
// como la contraseña usada en login biométrico. Usa expo-secure-store
// (Keystore en Android / Keychain en iOS). Solo guarda strings.
// ---------------------------------------------------------
let SecureStore = null;

async function getSecureStore() {
  if (SecureStore) return SecureStore;
  try {
    const mod = await import("expo-secure-store");
    SecureStore = mod;
    return SecureStore;
  } catch {
    return null;
  }
}

export async function saveSecure(key, value) {
  const store = await getSecureStore();
  if (!store) return false;
  try {
    await store.setItemAsync(key, String(value));
    return true;
  } catch {
    return false;
  }
}

export async function loadSecure(key, fallback = null) {
  const store = await getSecureStore();
  if (!store) return fallback;
  try {
    const raw = await store.getItemAsync(key);
    return raw != null ? raw : fallback;
  } catch {
    return fallback;
  }
}

export async function removeSecure(key) {
  const store = await getSecureStore();
  if (!store) return;
  try {
    await store.deleteItemAsync(key);
  } catch {}
}

// Claves del storage
export const STORAGE_KEYS = {
  USER_PROFILE: "user_profile",
  CHATS: "chats",
  CHAT_CONTACTS: "chat_contacts",
  DELETED_CONTACTS: "deleted_contacts",
  MATCHES: "matches",
  SWIPE_HISTORY: "swipe_history",
  SETTINGS: "app_settings",
  ONBOARDING_DONE: "onboarding_done",
  BLOCKED_USERS: "blocked_users",
};
