import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AVATARS } from "../data/avatarAssets";

function resolveSource(img) {
  if (!img) return require("../../assets/logo1.png");
  return typeof img === "string" ? { uri: img } : img;
}
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PolaroidFrame from "../components/PolaroidFrame";
import AuthContext from "../contexts/AuthContext";
import { useFeatures } from "../contexts/AuthContext";
import { MoodSelector, getMoodColors } from "../components/MoodSelector";
import { saveData, loadData, STORAGE_KEYS } from "../services/storageService";
import { analyzeMessage, WARNING_MESSAGES, getCooldownHours, getCooldownMessage } from "../services/contentFilter";
import { blockUser, reportUser, REPORT_REASONS, callEmergency } from "../services/safetyService";
import { supabase } from "../services/supabase";
import { uploadChatImage } from "../services/photoService";
import {
  getOrCreateConversation,
  fetchMessages as fetchRealMessages,
  sendMessage as sendRealMessage,
  subscribeToMessages,
  markAsRead,
} from "../services/chatService";

function getMoonPhase(date) {
  const lp = 2551443;
  const now = date.getTime() / 1000;
  const new_moon = Date.UTC(1970, 0, 7, 20, 35, 0) / 1000;
  const phase = ((now - new_moon) % lp) / lp;
  if (phase < 0.1 || phase > 0.9) return "🌑";
  if (phase < 0.4) return "🌒";
  if (phase < 0.6) return "🌕";
  return "🌘";
}

function MessageItem({ item, hasReactionEmojis, hasMessageAnimation, hasDanceEmojis }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true, tension: 100 }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
      <View style={[styles.message, item.fromMe ? styles.me : styles.them]}>
        {!item.fromMe && <Text style={styles.paw}>💬</Text>}
        {item.image ? (
          <Image source={{ uri: item.image }} style={{ width: 180, height: 180, borderRadius: 14 }} />
        ) : (
          <Text style={styles.messageText}>
            {hasDanceEmojis && item.text?.includes("🎉") ? "💃 " + item.text + " 🕺" : item.text}
          </Text>
        )}
        {item.fromMe && <Text style={{ marginLeft: 6, fontSize: 14, opacity: 0.7 }}>🗡️</Text>}
      </View>
      <Text style={[styles.timestamp, { textAlign: item.fromMe ? "right" : "left", paddingHorizontal: 8 }]}>
        {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        {item.fromMe && " ✓"}
      </Text>
    </Animated.View>
  );
}

const AUTO_REPLIES = [
  "Estoy aquí...",
  "Me encanta hablar contigo 💕",
  "¿Qué tal tu día?",
  "¿Eres más de luna llena o luna nueva? 🌕",
  "Siento tu energía desde aquí 🔥",
  "Mi manada me espera, pero tú primero 😊",
];

export default function ChatRoomPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params ?? {};
  const { user, setActiveConversationId } = useContext(AuthContext);
  const { hasFeature } = useFeatures();
  const insets = useSafeAreaInsets();

  const name = params.name ?? user?.chatContact?.name ?? "Luna Wolf";
  const photo = params.photo ?? user?.chatContact?.photo ?? AVATARS["loba-1"];
  const photos = params.photos ?? (photo ? [photo] : []);
  const contactId = params.contactId ?? "default";
  const targetUserId = params.targetUserId ?? null; // UUID del otro usuario (modo real)
  const isRealChat = !!(targetUserId && user?.supabaseId);
  const chatKey = `${STORAGE_KEYS.CHATS}_${contactId}`;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const [moonPhase] = useState(getMoonPhase(new Date()));
  const [bgColors, setBgColors] = useState(["#0f172a", "#1e293b"]);
  const [safetyMenu, setSafetyMenu] = useState(false);
  const [reportMenu, setReportMenu] = useState(false);
  const [strikes, setStrikes] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(null);
  const [chatBlocked, setChatBlocked] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const flatListRef = useRef(null);
  const STRIKES_KEY = `chat_strikes_${contactId}`;
  const COOLDOWN_KEY = `chat_cooldown_${contactId}`;

  // Marcar esta conversación como activa para silenciar la notificación global
  // mientras el usuario está leyendo este chat
  useEffect(() => {
    if (!conversationId) return;
    setActiveConversationId(conversationId);
    return () => setActiveConversationId(null);
  }, [conversationId, setActiveConversationId]);

  // Cargar strikes y cooldown del chat
  useEffect(() => {
    loadData(STRIKES_KEY, 0).then((s) => setStrikes(s));
    loadData(COOLDOWN_KEY, null).then((until) => {
      if (until && Date.now() < until) {
        setCooldownUntil(until);
      } else if (until === -1) {
        setChatBlocked(true);
      }
    });
  }, [contactId]);

  // Cargar mensajes — modo REAL (Supabase) o FAKE (AsyncStorage + bot)
  useEffect(() => {
    let unsubscribe;

    async function loadRealChat() {
      try {
        const conv = await getOrCreateConversation(user.supabaseId, targetUserId);
        setConversationId(conv.id);

        const msgs = await fetchRealMessages(conv.id);
        const formatted = msgs.map((m) => ({
          id: m.id,
          text: m.content,
          image: m.image_url,
          fromMe: m.sender_id === user.supabaseId,
          created_at: m.created_at,
          read_at: m.read_at,
        }));
        setMessages(formatted);

        await markAsRead(conv.id, user.supabaseId);

        // Suscripción en tiempo real (solo para mensajes de OTROS — los míos los agrego con optimistic update)
        unsubscribe = subscribeToMessages(conv.id, (newMsg) => {
          if (newMsg.sender_id === user.supabaseId) return; // Ignorar propios

          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [
              ...prev,
              {
                id: newMsg.id,
                text: newMsg.content,
                image: newMsg.image_url,
                fromMe: false,
                created_at: newMsg.created_at,
                read_at: newMsg.read_at,
              },
            ];
          });
          markAsRead(conv.id, user.supabaseId);
          scrollToBottom();
        });
      } catch (e) {
        console.error("Error cargando chat real:", e);
        Alert.alert("Error", "No se pudo cargar el chat: " + (e?.message || "intentá de nuevo"));
      }
    }

    async function loadFakeChat() {
      const saved = await loadData(chatKey, []);
      if (saved.length === 0) {
        const welcome = [{ id: 1, text: `Hola! Soy ${name} 👋`, fromMe: false, created_at: new Date().toISOString() }];
        setMessages(welcome);
        saveData(chatKey, welcome);
      } else {
        setMessages(saved);
      }
    }

    if (isRealChat) {
      loadRealChat();
    } else {
      loadFakeChat();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [contactId, targetUserId, isRealChat]);

  // Agrega el contacto a la lista cuando el usuario realmente interactúa
  // Si fue eliminado previamente, NO vuelve a la lista (se respeta el delete)
  const ensureContactInList = async () => {
    const deleted = await loadData(STORAGE_KEYS.DELETED_CONTACTS, []);
    if (deleted.includes(contactId)) return; // permanece eliminado

    const contacts = await loadData(STORAGE_KEYS.CHAT_CONTACTS, []);
    const exists = contacts.find((c) => c.contactId === contactId);
    if (!exists) {
      const updated = [{ contactId, name, photo }, ...contacts];
      await saveData(STORAGE_KEYS.CHAT_CONTACTS, updated);
    }
  };

  // Actualizar color de fondo según mood
  useEffect(() => {
    setBgColors(getMoodColors(user?.mood ?? "neutral"));
  }, [user?.mood]);

  const scrollToBottom = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const persistMessages = (msgs) => {
    saveData(chatKey, msgs);
  };

  const proceedToSend = async (text) => {
    if (isRealChat && conversationId) {
      // Modo REAL: enviar a Supabase
      const tempId = `temp_${Date.now()}`;
      const optimistic = { id: tempId, text, fromMe: true, created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, optimistic]);
      scrollToBottom();
      try {
        const sent = await sendRealMessage({
          conversationId,
          senderId: user.supabaseId,
          content: text,
        });
        // Reemplazar el optimista con el real
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { id: sent.id, text: sent.content, fromMe: true, created_at: sent.created_at }
              : m
          )
        );
      } catch (e) {
        console.error("Error enviando:", e);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        Alert.alert("Error", "No se pudo enviar el mensaje: " + (e?.message || "intentá de nuevo"));
      }
      return;
    }

    // Modo FAKE: AsyncStorage + bot
    const newMsg = { id: Date.now(), text, fromMe: true, created_at: new Date().toISOString() };
    const updated = [...messages, newMsg];
    setMessages(updated);
    persistMessages(updated);
    ensureContactInList();
    scrollToBottom();
    triggerAutoReply();
  };

  const applyStrike = async (text, analysis) => {
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    await saveData(STRIKES_KEY, newStrikes);

    // Log de violación
    try {
      supabase.from("security_violations").insert({
        user_id: user?.supabaseId,
        target_user_id: null,
        type: `chat_${analysis.type}`,
        context: { chat_contact: contactId, severity: analysis.severity },
      });
    } catch {}

    const cooldownHrs = getCooldownHours(newStrikes);
    if (cooldownHrs === -1) {
      await saveData(COOLDOWN_KEY, -1);
      setChatBlocked(true);
    } else {
      const until = Date.now() + cooldownHrs * 60 * 60 * 1000;
      await saveData(COOLDOWN_KEY, until);
      setCooldownUntil(until);
    }

    Alert.alert(
      "Mensaje no enviado",
      getCooldownMessage(newStrikes),
      [{ text: "Entendido" }]
    );
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (chatBlocked) {
      Alert.alert("Chat bloqueado", "No podés enviar mensajes en este chat por reincidencia.");
      return;
    }

    if (cooldownUntil && Date.now() < cooldownUntil) {
      const minutesLeft = Math.ceil((cooldownUntil - Date.now()) / 60000);
      Alert.alert("En período de espera", `Podés enviar mensajes en ${minutesLeft} minutos.`);
      return;
    }

    const text = input.trim();

    // Análisis pre-envío
    const analysis = analyzeMessage(text);
    if (analysis?.flagged) {
      const warning = WARNING_MESSAGES[analysis.type];
      Alert.alert(
        warning.title,
        `${warning.body}\n\n¿Querés revisar tu mensaje antes de enviarlo?`,
        [
          {
            text: "Editar",
            style: "cancel",
          },
          {
            text: "Enviar igual",
            style: "destructive",
            onPress: () => {
              setInput("");
              proceedToSend(text);
              applyStrike(text, analysis);
            },
          },
        ]
      );
      return;
    }

    setInput("");
    proceedToSend(text);
  };

  const triggerAutoReply = () => {

    if (hasFeature("typingIndicator")) setOtherTyping(true);

    setTimeout(() => {
      setOtherTyping(false);
      const reply = {
        id: Date.now() + 1,
        text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        fromMe: false,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => {
        const next = [...prev, reply];
        persistMessages(next);
        return next;
      });
      scrollToBottom();
    }, 1200 + Math.random() * 800);
  };

  const handleDeleteChat = () => {
    Alert.alert(
      "Eliminar chat",
      "¿Eliminar esta conversación? Se borrarán todos los mensajes.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            // Borrar mensajes
            await saveData(chatKey, []);
            // Sacar de la lista de chats
            const contacts = await loadData(STORAGE_KEYS.CHAT_CONTACTS, []);
            await saveData(STORAGE_KEYS.CHAT_CONTACTS, contacts.filter((c) => c.contactId !== contactId));
            // Marcar como eliminado para que no vuelva a auto-aparecer
            const deleted = await loadData(STORAGE_KEYS.DELETED_CONTACTS, []);
            if (!deleted.includes(contactId)) {
              await saveData(STORAGE_KEYS.DELETED_CONTACTS, [...deleted, contactId]);
            }
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleBlock = () => {
    Alert.alert(
      "Bloquear y reportar",
      `¿Bloquear a ${name}? No podrá contactarte y vos no la verás más.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Bloquear",
          style: "destructive",
          onPress: async () => {
            try {
              if (user?.supabaseId && params.targetUserId) {
                await blockUser(user.supabaseId, params.targetUserId);
              }
              const contacts = await loadData(STORAGE_KEYS.CHAT_CONTACTS, []);
              await saveData(STORAGE_KEYS.CHAT_CONTACTS, contacts.filter((c) => c.contactId !== contactId));
              navigation.goBack();
            } catch (e) {
              Alert.alert("Error", "No se pudo bloquear. Intentá de nuevo.");
            }
          },
        },
      ]
    );
  };

  const handleReport = (reason) => {
    if (!user?.supabaseId || !params.targetUserId) {
      Alert.alert("Reporte registrado", "Tu reporte fue enviado al equipo de moderación.");
      setReportMenu(false);
      return;
    }
    reportUser({
      reporterId: user.supabaseId,
      targetUserId: params.targetUserId,
      reason: reason.id,
    })
      .then(() => {
        Alert.alert(
          "Reporte enviado",
          `Gracias. Recibimos tu reporte por "${reason.label}". El equipo de moderación lo revisará en las próximas 24 horas.\n\n¿Querés también bloquear a esta persona?`,
          [
            { text: "No, gracias", style: "cancel" },
            { text: "Sí, bloquear", style: "destructive", onPress: handleBlock },
          ]
        );
      })
      .catch((e) => {
        Alert.alert("Error", "No se pudo enviar el reporte: " + (e?.message || "intentá de nuevo"));
      })
      .finally(() => setReportMenu(false));
  };

  const sendImage = async () => {
    if (!hasFeature("sendImages")) {
      Alert.alert("Premium requerido", "Necesitás un plan premium para enviar imágenes 📦");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const localUri = result.assets[0].uri;

    // Modo REAL: subir a Supabase + insertar mensaje
    if (isRealChat && conversationId && user?.supabaseId) {
      const tempId = `temp_${Date.now()}`;
      const optimistic = { id: tempId, image: localUri, fromMe: true, created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, optimistic]);
      scrollToBottom();
      try {
        const imageUrl = await uploadChatImage(user.supabaseId, localUri);
        const sent = await sendRealMessage({
          conversationId,
          senderId: user.supabaseId,
          imageUrl,
        });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { id: sent.id, image: sent.image_url, fromMe: true, created_at: sent.created_at }
              : m
          )
        );
      } catch (e) {
        console.error("Error enviando imagen:", e);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        Alert.alert("Error", "No se pudo enviar la foto: " + (e?.message || "intentá de nuevo"));
      }
      return;
    }

    // Modo FAKE: solo local
    const msg = { id: Date.now(), image: localUri, fromMe: true, created_at: new Date().toISOString() };
    const updated = [...messages, msg];
    setMessages(updated);
    persistMessages(updated);
    scrollToBottom();
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={insets.bottom}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginRight: 4 }}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <TouchableOpacity
              onPress={() => photos.length > 0 && navigation.navigate("GalleryPage", { photos, initialIndex: 0 })}
              style={{ marginRight: 10 }}
            >
              <Image source={resolveSource(photo)} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "#22c55e" }} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("ProfileDetail", { profile: { display_name: name, avatar: photo, photos, primary_theriotype: "Wolf" } })}
              style={{ flex: 1 }}
            >
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>{name}</Text>
              <Text style={{ color: "#22c55e", fontSize: 12 }}>
                {otherTyping && hasFeature("typingIndicator") ? "escribiendo..." : "En línea 🟢"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: "white", fontSize: 20, marginRight: 8 }}>{moonPhase}</Text>
          <TouchableOpacity onPress={() => setSafetyMenu(true)} style={{ padding: 6, marginRight: 4 }}>
            <Ionicons name="shield-outline" size={22} color="#fbbf24" />
          </TouchableOpacity>
          <MoodSelector />
        </View>

        {/* MENU DE SEGURIDAD */}
        <Modal visible={safetyMenu} transparent animationType="fade" onRequestClose={() => setSafetyMenu(false)}>
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setSafetyMenu(false)} activeOpacity={1}>
            <View style={styles.safetyModal}>
              <Text style={styles.safetyTitle}>🛡️ Seguridad</Text>
              <Text style={styles.safetySubtitle}>Tu seguridad es lo primero</Text>

              <TouchableOpacity style={styles.safetyOption} onPress={() => { setSafetyMenu(false); setReportMenu(true); }}>
                <Ionicons name="flag" size={22} color="#fbbf24" />
                <Text style={styles.safetyOptionText}>Reportar a {name}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.safetyOption} onPress={() => { setSafetyMenu(false); handleBlock(); }}>
                <Ionicons name="ban" size={22} color="#ef4444" />
                <Text style={styles.safetyOptionText}>Bloquear a {name}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.safetyOption} onPress={() => { setSafetyMenu(false); handleDeleteChat(); }}>
                <Ionicons name="trash-outline" size={22} color="#888" />
                <Text style={styles.safetyOptionText}>Eliminar este chat</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.safetyOption} onPress={() => { setSafetyMenu(false); navigation.navigate("SafetyCenter"); }}>
                <Ionicons name="information-circle" size={22} color="#22c55e" />
                <Text style={styles.safetyOptionText}>Centro de Seguridad</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.safetyOption, styles.emergencyOption]} onPress={() => { setSafetyMenu(false); callEmergency("144"); }}>
                <Ionicons name="call" size={22} color="white" />
                <Text style={[styles.safetyOptionText, { color: "white" }]}>Llamar 144 (urgencia)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.safetyCancel} onPress={() => setSafetyMenu(false)}>
                <Text style={{ color: "#888" }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* MODAL DE REPORTE */}
        <Modal visible={reportMenu} transparent animationType="slide" onRequestClose={() => setReportMenu(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.reportModal}>
              <Text style={styles.safetyTitle}>Reportar a {name}</Text>
              <Text style={styles.safetySubtitle}>Tu reporte es anónimo y será revisado en 24 hs</Text>
              {REPORT_REASONS.map((r) => (
                <TouchableOpacity key={r.id} style={styles.reportOption} onPress={() => handleReport(r)}>
                  <Text style={styles.reportText}>{r.label}</Text>
                  {r.severity === "critical" && <Text style={styles.criticalLabel}>URGENTE</Text>}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.safetyCancel} onPress={() => setReportMenu(false)}>
                <Text style={{ color: "#888" }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* MENSAJES */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MessageItem
              item={item}
              hasReactionEmojis={hasFeature("reactionEmojis")}
              hasMessageAnimation={hasFeature("messageAnimation")}
              hasDanceEmojis={hasFeature("danceEmojis")}
            />
          )}
          contentContainerStyle={{ padding: 14, paddingBottom: 10 }}
          onLayout={scrollToBottom}
          showsVerticalScrollIndicator={false}
        />

        {/* INPUT */}
        <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity onPress={sendImage} style={styles.iconBtn}>
            <Ionicons name="image-outline" size={22} color={hasFeature("sendImages") ? "#22c55e" : "#555"} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Ruge algo..."
            placeholderTextColor="#666"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            multiline
            maxLength={500}
          />

          <TouchableOpacity onPress={sendMessage} style={[styles.sendBtn, !input.trim() && { opacity: 0.4 }]} disabled={!input.trim()}>
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  message: {
    padding: 12,
    borderRadius: 18,
    marginBottom: 2,
    maxWidth: "80%",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  me: {
    backgroundColor: "#1a4028",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  them: {
    backgroundColor: "rgba(255,255,255,0.1)",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 16, color: "white", flexShrink: 1, lineHeight: 22 },
  paw: { marginRight: 6, fontSize: 14, opacity: 0.7 },
  timestamp: { color: "rgba(255,255,255,0.4)", fontSize: 10, marginBottom: 8 },
  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(0,0,0,0.5)",
    gap: 8,
  },
  iconBtn: { padding: 8, justifyContent: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  safetyModal: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
    width: "85%",
    borderWidth: 1,
    borderColor: "#333",
  },
  safetyTitle: { color: "white", fontSize: 18, fontWeight: "bold", textAlign: "center" },
  safetySubtitle: { color: "#888", fontSize: 13, textAlign: "center", marginTop: 4, marginBottom: 16 },
  safetyOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
  },
  safetyOptionText: { color: "white", fontSize: 15, fontWeight: "500" },
  emergencyOption: { backgroundColor: "#dc2626" },
  safetyCancel: {
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  reportModal: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "#333",
  },
  reportOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    marginBottom: 6,
  },
  reportText: { color: "white", fontSize: 14, flex: 1 },
  criticalLabel: { color: "#ef4444", fontSize: 10, fontWeight: "bold" },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "white",
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#16a34a",
    justifyContent: "center",
    alignItems: "center",
  },
});
