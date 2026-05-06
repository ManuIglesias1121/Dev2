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
