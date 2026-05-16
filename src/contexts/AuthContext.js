import React, { createContext, useContext, useState, useEffect } from "react";
import { saveData, loadData, STORAGE_KEYS } from "../services/storageService";
import { AVATARS } from "../data/avatarAssets";
import { supabase } from "../services/supabase";
import { getProfile, upsertProfile, signOut as supabaseSignOut } from "../services/authService";

export const AuthContext = createContext();
export default AuthContext;

// --- ACHIEVEMENTS SYSTEM ---
const ACHIEVEMENTS = {
  first_message: {
    id: "first_message",
    name: "Primer Rugido",
    icon: "🎤",
    desc: "Envía tu primer mensaje",
    reward: 10,
    category: "basic",
  },
  ten_messages: {
    id: "ten_messages",
    name: "Conversador",
    icon: "💬",
    desc: "Envía 10 mensajes",
    reward: 25,
    category: "engagement",
  },
  fifty_messages: {
    id: "fifty_messages",
    name: "Orador",
    icon: "📢",
    desc: "Envía 50 mensajes",
    reward: 50,
    category: "engagement",
  },
  day7: {
    id: "day7",
    name: "Una Semana Juntos",
    icon: "📅",
    desc: "7 días en la manada",
    reward: 100,
    category: "milestone",
  },
  day30: {
    id: "day30",
    name: "Un Mes de Magia",
    icon: "🌙",
    desc: "30 días en la manada",
    reward: 200,
    category: "milestone",
  },
  premium_upgrade: {
    id: "premium_upgrade",
    name: "Élite de la Manada",
    icon: "👑",
    desc: "Compra un plan premium",
    reward: 150,
    category: "premium",
  },
  gift_collector: {
    id: "gift_collector",
    name: "Coleccionista de Regalos",
    icon: "🎁",
    desc: "Compra 5 regalos",
    reward: 300,
    category: "premium",
  },
  all_moods: {
    id: "all_moods",
    name: "Camaleón de la Manada",
    icon: "🎭",
    desc: "Usa todos los 5 moods",
    reward: 75,
    category: "engagement",
  },
};

// --- PERMISOS POR PLAN (MEJORADO) ---
const PLAN_FEATURES = {
  free: {
    supermatch: false,
    sendImages: false,
    typingIndicator: false,
    privatePhotos: false,
    soundEffects: false,
    messageLimit: 10,
    voiceMessages: false,
    gifs: false,
    frameColor: "#gray",
    nameColor: "#fff",
    discoverySwipes: 5,
    badgeShowcase: false,
  },
  mensual: {
    supermatch: true,
    sendImages: true,
    typingIndicator: true,
    privatePhotos: false,
    soundEffects: true,
    messageLimit: 100,
    voiceMessages: false,
    gifs: true,
    frameColor: "#22c55e",
    nameColor: "#22c55e",
    discoverySwipes: 50,
    badgeShowcase: true,
  },
  trimestral: {
    supermatch: true,
    sendImages: true,
    typingIndicator: true,
    privatePhotos: true,
    soundEffects: true,
    messageLimit: 500,
    voiceMessages: true,
    gifs: true,
    frameColor: "#3b82f6",
    nameColor: "#60a5fa",
    discoverySwipes: 999,
    badgeShowcase: true,
    customNameColor: true,
  },
  anual: {
    supermatch: true,
    sendImages: true,
    typingIndicator: true,
    privatePhotos: true,
    soundEffects: true,
    messageLimit: 99999,
    voiceMessages: true,
    gifs: true,
    frameColor: "#a78bfa",
    nameColor: "#c084fc",
    discoverySwipes: 99999,
    badgeShowcase: true,
    customNameColor: true,
    premiumBadge: "👑",
  },
};

// --- REGALOS MEJORADOS CON LIMITED TIME OFFERS ---
const GIFT_FEATURES = {
  llama_romantica: {
    name: "Llamada Romántica",
    icon: "📞",
    price: "$2.99",
    color: "#ec4899",
    description: "Llamadas de voz especiales",
    features: ["voiceCall", "voiceMessages"],
    isLimited: false,
  },
  lluvia_flores: {
    name: "Lluvia de Flores",
    icon: "🌹",
    price: "$1.99",
    color: "#f43f5e",
    description: "Efectos románticos en mensajes",
    features: ["messageAnimation", "flowerEffects"],
    isLimited: true,
    expiresIn: "24h",
    discount: 0.5,
  },
  fuego_pasion: {
    name: "Fuego de Pasión",
    icon: "🔥",
    price: "$3.99",
    color: "#ff6b35",
    description: "Efectos especiales calientes",
    features: ["hotAnimation", "passionEmojis"],
    isLimited: false,
  },
  luna_magica: {
    name: "Luna Mágica",
    icon: "🌙",
    price: "$2.49",
    color: "#667eea",
    description: "Tema nocturno mágico",
    features: ["magicTheme", "glowEffect"],
    isLimited: false,
  },
  caos_animal: {
    name: "Caos Animal",
    icon: "🐾",
    price: "$4.99",
    color: "#22c55e",
    description: "Efectos salvajes y emojis dinámicos",
    features: ["animalReactions", "wildAnimations"],
    isLimited: false,
  },
  regalo_misterioso: {
    name: "Sorpresa Misteriosa",
    icon: "🎁",
    price: "$9.99",
    color: "#a78bfa",
    description: "Desbloquea sorpresas secretas",
    features: ["dailySurprise", "randomEffects", "secretMessages"],
    isLimited: true,
    expiresIn: "48h",
    discount: 0.3,
  },
  rosas_eternas: {
    name: "Rosas Eternas",
    icon: "🌹",
    price: "$1.49",
    color: "#f472b6",
    description: "Marcadores especiales en chat",
    features: ["favoriteMessages", "pinMessages"],
    isLimited: false,
  },
  baile_salvaje: {
    name: "Baile Salvaje",
    icon: "💃",
    price: "$3.49",
    color: "#fbbf24",
    description: "Emojis danzantes y movimiento",
    features: ["danceEmojis", "vibrationPattern"],
    isLimited: true,
    expiresIn: "12h",
    discount: 0.25,
  },
};

// --- DISCOVERY PROFILES (Usuarios para swipear) ---
const DISCOVERY_PROFILES = [
  {
    id: 2,
    name: "Aiden Fox",
    photo: AVATARS["zorro-1"],
    age: 24,
    theriotype: "Fox",
    bio: "Astuto y misterioso 🦊",
    location: "Buenos Aires",
    isPremium: true,
    rating: 4.8,
    compatibility: 92,
  },
  {
    id: 3,
    name: "Iris Raven",
    photo: AVATARS["nyx-raven"],
    age: 26,
    theriotype: "Raven",
    bio: "Sabia y juguetona 🐦",
    location: "Buenos Aires",
    isPremium: false,
    rating: 4.5,
    compatibility: 85,
  },
  {
    id: 4,
    name: "Drake Tiger",
    photo: AVATARS["lobo-1"],
    age: 28,
    theriotype: "Tiger",
    bio: "Apasionado y protector 🐯",
    location: "Buenos Aires",
    isPremium: true,
    rating: 4.9,
    compatibility: 88,
  },
  {
    id: 5,
    name: "Nova Lynx",
    photo: AVATARS["lince-1"],
    age: 23,
    theriotype: "Lynx",
    bio: "Elegante y sofisticada 🐆",
    location: "Buenos Aires",
    isPremium: false,
    rating: 4.7,
    compatibility: 81,
  },
  {
    id: 6,
    name: "Sienna Deer",
    photo: AVATARS["bruna-deer"],
    age: 25,
    theriotype: "Deer",
    bio: "Suave y empatica 🦌",
    location: "Buenos Aires",
    isPremium: true,
    rating: 4.6,
    compatibility: 79,
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasStoredSession, setHasStoredSession] = useState(false);
  const [storedAuthUser, setStoredAuthUser] = useState(null);
  const [newUser, setNewUser] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [relationshipDays, setRelationshipDays] = useState(0);
  const [discoveryIndex, setDiscoveryIndex] = useState(0);
  const [blockedUsers, setBlockedUsers] = useState([]);
  // Conversation ID que el usuario está viendo en este momento (para no sonar notif si ya está ahí)
  const [activeConversationId, setActiveConversationId] = useState(null);

  // Al abrir: detectar sesión guardada pero NO auto-login (siempre pide auth)
  useEffect(() => {
    async function checkStoredSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setHasStoredSession(true);
          setStoredAuthUser(session.user);
        }
      } catch {}
      setLoading(false);
    }
    checkStoredSession();
  }, []);

  // Restaurar sesión tras autenticarse con huella (sin re-login con contraseña)
  const restoreStoredSession = async () => {
    if (storedAuthUser) {
      await loadUserProfile(storedAuthUser);
    }
  };

  async function loadUserProfile(authUser) {
    let profile = null;

    // 1. Intentar leer el perfil existente
    try {
      profile = await getProfile(authUser.id); // null si no existe (maybeSingle)
    } catch (e) {
      console.warn("No se pudo leer el perfil:", e.message);
    }

    // 2. Si no existe, crearlo (el trigger debería haberlo creado, pero por si falla)
    if (!profile) {
      const newProfile = {
        id: authUser.id,
        display_name:
          authUser.user_metadata?.display_name ||
          authUser.email?.split("@")[0] ||
          "Nuevo therian",
        is_premium: false,
      };
      try {
        profile = await upsertProfile(newProfile);
      } catch (e) {
        console.warn("No se pudo crear el perfil en DB:", e.message);
        profile = newProfile; // usar datos locales igual
      }
      setNewUser(true);
    }

    // 3. Siempre loguear al usuario, aunque falle la DB
    setUser({
      ...profile,
      email: authUser.email,
      supabaseId: authUser.id,
      avatar: profile.avatar_url || profile.avatar || null,
      bio: profile.biography || "",
      isPremium: profile.is_premium || false,
      photos: profile.photos || [],
      exclusive_photos: profile.exclusive_photos || [],
      swipesLeft: profile.is_premium ? 999 : 5,
      coins: profile.coins ?? 50,
      gifts: [],
      mood: "neutral",
      modsUsed: [],
    });
  }

  const setSessionUser = async (authUser) => {
    if (authUser) await loadUserProfile(authUser);
  };

  // Persistir bloqueados
  useEffect(() => {
    async function restoreBlocked() {
      const savedBlocked = await loadData(STORAGE_KEYS.BLOCKED_USERS);
      if (savedBlocked) setBlockedUsers(savedBlocked);
    }
    restoreBlocked();
  }, []);

  // Persistir bloqueados cuando cambian
  useEffect(() => {
    saveData(STORAGE_KEYS.BLOCKED_USERS, blockedUsers);
  }, [blockedUsers]);

  const blockUser = (userId) => {
    if (!userId) return;
    setBlockedUsers((prev) => prev.includes(userId) ? prev : [...prev, userId]);
  };

  const unblockUser = (userId) => {
    setBlockedUsers((prev) => prev.filter((id) => id !== userId));
  };

  const login = (email) => {
    if (!email) {
      return false;
    }

    setUser({
      id: 1,
      email,
      display_name: "Manu",
      avatar: AVATARS["lobo-1"],
      primary_theriotype: "Wolf",
      species_family: "Canidae",
      age: 26,
      bio: "Lobo solitario buscando manada 🐺",
      city: "Buenos Aires",
      country: "Argentina",
      latitude: -34.6037,
      longitude: -58.3816,
      isPremium: false,
      premiumPlan: "free",
      gifts: [],
      coins: 50,
      chatContact: {
        id: 1,
        name: "Luna Wolf",
        photo: AVATARS["loba-1"],
        isPremium: true,
        mood: "romantic",
        onlineStatus: "active",
        relationshipDays: 0,
      },
      mood: "neutral",
      messagesSentToday: 0,
      modsUsed: [],
      swipesLeft: 5,
    });

    // Simular 0 días al empezar
    setRelationshipDays(0);

    return true;
  };

  const logout = async () => {
    await supabaseSignOut().catch(() => {});
    setUser(null);
  };

  const updateUser = (partialUser) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return partialUser ? { ...partialUser } : currentUser;
      }

      return {
        ...currentUser,
        ...partialUser,
      };
    });
  };

  const matchProfile = (profileId) => {
    // Simular match con Luna
    setUser((currentUser) =>
      currentUser
        ? {
            ...currentUser,
            chatContact: {
              ...currentUser.chatContact,
              relationshipDays: 1,
            },
          }
        : currentUser
    );
    setRelationshipDays(1);
    nextProfile();
  };

  const nextProfile = () => {
    if (discoveryIndex < DISCOVERY_PROFILES.length - 1) {
      setDiscoveryIndex(discoveryIndex + 1);
    }
    swipeProfile();
  };

  const swipeProfile = () => {
    setUser((currentUser) =>
      currentUser
        ? {
            ...currentUser,
            swipesLeft: Math.max(0, (currentUser.swipesLeft || 5) - 1),
          }
        : currentUser
    );
  };

  const activatePremium = (plan) => {
    setUser((currentUser) =>
      currentUser
        ? {
            ...currentUser,
            isPremium: true,
            premiumPlan: plan,
            coins: (currentUser.coins || 0) + 100,
            swipesLeft: 999,
          }
        : currentUser
    );
  };

  const buyGift = (giftId) => {
    const gift = GIFT_FEATURES[giftId];
    if (!gift) return false;

    setUser((currentUser) => {
      if (!currentUser) return currentUser;

      const coinsCost = parseInt(gift.price.replace("$", "")) * 10;

      if ((currentUser.coins || 0) < coinsCost) {
        return currentUser;
      }

      return {
        ...currentUser,
        gifts: currentUser.gifts.includes(giftId)
          ? currentUser.gifts
          : [...currentUser.gifts, giftId],
        coins: (currentUser.coins || 0) - coinsCost,
      };
    });

    return true;
  };

  const addCoins = (amount) => {
    setUser((currentUser) =>
      currentUser
        ? { ...currentUser, coins: (currentUser.coins || 0) + amount }
        : currentUser
    );
  };

  const setMood = (moodType) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;

      const modsUsed = currentUser.modsUsed || [];
      if (!modsUsed.includes(moodType)) {
        modsUsed.push(moodType);
      }

      // Check achievement
      if (modsUsed.length === 5) {
        unlockAchievement("all_moods");
      }

      return { ...currentUser, mood: moodType, modsUsed };
    });
  };

  const unlockAchievement = (achievementId) => {
    if (!achievements.includes(achievementId)) {
      const achievement = ACHIEVEMENTS[achievementId];
      if (achievement) {
        setAchievements([...achievements, achievementId]);
        addCoins(achievement.reward);
      }
    }
  };

  const addDay = () => {
    setRelationshipDays((prev) => prev + 1);
    setUser((currentUser) =>
      currentUser
        ? {
            ...currentUser,
            chatContact: {
              ...currentUser.chatContact,
              relationshipDays: relationshipDays + 1,
            },
          }
        : currentUser
    );

    // Check milestones
    if (relationshipDays + 1 === 7) unlockAchievement("day7");
    if (relationshipDays + 1 === 30) unlockAchievement("day30");
  };

  const togglePremium = () => {
    setUser((currentUser) =>
      currentUser
        ? { ...currentUser, isPremium: !currentUser.isPremium }
        : currentUser
    );
  };

  const updateLocation = (city, country, latitude, longitude) => {
    setUser((currentUser) =>
      currentUser
        ? {
            ...currentUser,
            city: city || currentUser.city,
            country: country || currentUser.country,
            latitude: latitude || currentUser.latitude,
            longitude: longitude || currentUser.longitude,
          }
        : currentUser
    );
  };

  const recoverPassword = (email) => {
    console.log("Recuperación enviada a:", email);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        togglePremium,
        updateLocation,
        activatePremium,
        buyGift,
        addCoins,
        setMood,
        unlockAchievement,
        achievements,
        relationshipDays,
        addDay,
        matchProfile,
        nextProfile,
        discoveryIndex,
        discoveryProfiles: DISCOVERY_PROFILES,
        loading,
        newUser,
        setNewUser,
        hasStoredSession,
        restoreStoredSession,
        setSessionUser,
        swipeProfile,
        recoverPassword,
        blockUser,
        unblockUser,
        blockedUsers,
        activeConversationId,
        setActiveConversationId,
        PLAN_FEATURES,
        GIFT_FEATURES,
        ACHIEVEMENTS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// --- HOOK PARA VERIFICAR PERMISOS ---
export function useFeatures() {
  const { user, PLAN_FEATURES, GIFT_FEATURES } = useAuth();
  
  const hasFeature = (featureName) => {
    if (!user) return false;

    // Si es premium pero no tiene plan específico, asumir el más alto (anual)
    const isPremium = user.isPremium || user.is_premium || false;
    const plan = user.premiumPlan || (isPremium ? "anual" : "free");
    const planFeatures = PLAN_FEATURES[plan] || PLAN_FEATURES.free;
    if (planFeatures[featureName]) return true;

    // Verificar si viene de un regalo
    for (const giftId of user.gifts || []) {
      const gift = GIFT_FEATURES[giftId];
      if (gift && gift.features.includes(featureName)) {
        return true;
      }
    }

    return false;
  };

  return { hasFeature };
}
