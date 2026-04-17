import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PolaroidFrame from "../components/PolaroidFrame";
import AuthContext from "../contexts/AuthContext";
import { useFeatures } from "../contexts/AuthContext";
import { MoodSelector, getMoodColors } from "../components/MoodSelector";
import { saveData, loadData, STORAGE_KEYS } from "../services/storageService";

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
        {!item.fromMe && <Text style={styles.paw}>🐾</Text>}
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
  "🐾 Estoy aquí...",
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
  const { user } = useContext(AuthContext);
  const { hasFeature } = useFeatures();

  const name = params.name ?? user?.chatContact?.name ?? "Luna Wolf";
  const photo = params.photo ?? user?.chatContact?.photo ?? "https://randomuser.me/api/portraits/women/44.jpg";
  const contactId = params.contactId ?? "default";
  const chatKey = `${STORAGE_KEYS.CHATS}_${contactId}`;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const [moonPhase] = useState(getMoonPhase(new Date()));
  const [bgColors, setBgColors] = useState(["#0f172a", "#1e293b"]);

  const flatListRef = useRef(null);

  // Cargar mensajes del storage
  useEffect(() => {
    async function loadMessages() {
      const saved = await loadData(chatKey, []);
      if (saved.length === 0) {
        const welcome = [{ id: 1, text: `Hola! Soy ${name} 👋`, fromMe: false, created_at: new Date().toISOString() }];
        setMessages(welcome);
        saveData(chatKey, welcome);
      } else {
        setMessages(saved);
      }
    }
    loadMessages();
  }, [contactId]);

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

  const sendMessage = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");

    if (hasFeature("soundEffects")) Vibration.vibrate(20);

    const newMsg = { id: Date.now(), text, fromMe: true, created_at: new Date().toISOString() };
    const updated = [...messages, newMsg];
    setMessages(updated);
    persistMessages(updated);
    scrollToBottom();

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
      if (hasFeature("soundEffects")) Vibration.vibrate(40);
      scrollToBottom();
    }, 1200 + Math.random() * 800);
  };

  const sendImage = async () => {
    if (!hasFeature("sendImages")) {
      alert("Necesitás un plan premium para enviar imágenes 📦");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      const msg = { id: Date.now(), image: result.assets[0].uri, fromMe: true, created_at: new Date().toISOString() };
      const updated = [...messages, msg];
      setMessages(updated);
      persistMessages(updated);
      scrollToBottom();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginRight: 4 }}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("ProfileDetail", { profile: { display_name: name, avatar: photo, photos: [photo], primary_theriotype: "Wolf" } })}
            style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
          >
            <Image source={{ uri: photo }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10, borderWidth: 2, borderColor: "#22c55e" }} />
            <View>
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>{name}</Text>
              <Text style={{ color: "#22c55e", fontSize: 12 }}>
                {otherTyping && hasFeature("typingIndicator") ? "escribiendo..." : "En línea 🟢"}
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={{ color: "white", fontSize: 20, marginRight: 8 }}>{moonPhase}</Text>
          <MoodSelector />
        </View>

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
        <View style={styles.inputArea}>
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
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(0,0,0,0.5)",
    gap: 8,
  },
  iconBtn: { padding: 8, justifyContent: "center" },
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
