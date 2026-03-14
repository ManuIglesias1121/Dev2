import { useRoute } from "@react-navigation/native";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

// --- FASE LUNAR ---
function getMoonPhase(date) {
  const lp = 2551443;
  const now = date.getTime() / 1000;
  const new_moon = Date.UTC(1970, 0, 7, 20, 35, 0) / 1000;
  const phase = ((now - new_moon) % lp) / lp;

  if (phase < 0.1 || phase > 0.9) return "new";
  if (phase < 0.4) return "waxing";
  if (phase < 0.6) return "full";
  return "waning";
}

// --- MENSAJE ---
function MessageItem({ item }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [10, 0],
            }),
          },
        ],
      }}
    >
      <View style={[styles.message, item.fromMe ? styles.me : styles.them]}>
        {!item.fromMe && <Text style={styles.paw}>🐾</Text>}
        <Text style={styles.messageText}>{item.text}</Text>
        {item.fromMe && <Text style={styles.claw}>🗡️</Text>}
      </View>

      <Text style={styles.timestamp}>
        {new Date(item.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </Animated.View>
  );
}

// --- PÁGINA ---
export default function ChatRoomPage() {
  const route = useRoute();
  const params = route.params;

  if (!params) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "white" }}>Chat no encontrado</Text>
      </View>
    );
  }

  const { chatId, name, photo } = params;
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const [moon, setMoon] = useState(false);
  const [moonPhase, setMoonPhase] = useState("full");
  const [instinctAwake, setInstinctAwake] = useState(false);

  const flatListRef = useRef(null);
  const slashAnim = useRef(new Animated.Value(0)).current;

  const fadeOld = useRef(new Animated.Value(1)).current;
  const fadeNew = useRef(new Animated.Value(0)).current;

  const [oldColors, setOldColors] = useState(["#1a1a2e", "#312e81"]);
  const [newColors, setNewColors] = useState(["#1a1a2e", "#312e81"]);

  const sendSoundRef = useRef(null);
  const receiveSoundRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const loadSounds = async () => {
      try {
        const sendObj = await Audio.Sound.createAsync(
          require("../assets/sounds/scratch.mp3"),
          { volume: 0.8 }
        );
        const receiveObj = await Audio.Sound.createAsync(
          require("../assets/sounds/howl.mp3"),
          { volume: 0.8 }
        );

        if (mounted) {
          sendSoundRef.current = sendObj.sound;
          receiveSoundRef.current = receiveObj.sound;
        }
      } catch (e) {
        console.log("Error cargando sonidos:", e);
      }
    };

    loadSounds();

    return () => {
      mounted = false;
      sendSoundRef.current?.unloadAsync();
      receiveSoundRef.current?.unloadAsync();
    };
  }, []);

  const playSendSound = async () => {
    try {
      Vibration.vibrate(20);
      await sendSoundRef.current?.replayAsync();
    } catch (e) {
      console.log("Error al reproducir sendSound:", e);
    }
  };

  const playReceiveSound = async () => {
    try {
      Vibration.vibrate(40);
      await receiveSoundRef.current?.replayAsync();
    } catch (e) {
      console.log("Error al reproducir receiveSound:", e);
    }
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(
        data.map((m) => ({
          id: m.id,
          text: m.text,
          fromMe: m.sender_id === user.id,
          created_at: m.created_at,
        }))
      );
      scrollToBottom();
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    setMoonPhase(getMoonPhase(new Date()));
  }, []);

  useEffect(() => {
    const base = (() => {
      if (otherTyping) return ["#1e293b", "#334155"];

      switch (moonPhase) {
        case "new":
          return ["#000000", "#0f172a"];
        case "waxing":
          return ["#0f172a", "#1e293b"];
        case "full":
          return ["#1a1a2e", "#312e81"];
        case "waning":
          return ["#111827", "#1e293b"];
        default:
          return ["#1a1a2e", "#312e81"];
      }
    })();

    setOldColors([...newColors]);
    setNewColors([...base]);

    fadeOld.setValue(1);
    fadeNew.setValue(0);

    Animated.parallel([
      Animated.timing(fadeOld, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeNew, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [moonPhase, otherTyping]);

  useEffect(() => {
    Animated.timing(slashAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const m = payload.new;
          const fromMe = m.sender_id === user.id;

          setMessages((prev) => [
            ...prev,
            {
              id: m.id,
              text: m.text,
              fromMe,
              created_at: m.created_at,
            },
          ]);

          scrollToBottom();

          if (!fromMe) playReceiveSound();
          setInstinctAwake(false);
        }
      );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, user.id]);

  useEffect(() => {
    supabase.from("typing_status").upsert({
      chat_id: chatId,
      user_id: user.id,
      is_typing: input.length > 0,
    });
  }, [input, chatId, user.id]);

  useEffect(() => {
    const channel = supabase
      .channel("typing")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "typing_status",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          if (payload.new.user_id !== user.id) {
            setOtherTyping(payload.new.is_typing);
          }
        }
      );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, user.id]);

  useEffect(() => {
    if (messages.length === 0) return;

    setInstinctAwake(false);
    const timer = setTimeout(() => {
      setInstinctAwake(true);
    }, 60000);

    return () => clearTimeout(timer);
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input;
    setInput("");

    await playSendSound();

    await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: user.id,
      text,
    });
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 80);
  };

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeOld }]}>
        <LinearGradient colors={oldColors} style={StyleSheet.absoluteFill} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeNew }]}>
        <LinearGradient colors={newColors} style={StyleSheet.absoluteFill} />
      </Animated.View>

      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={{ uri: photo }} style={styles.avatar} />
          <Text style={styles.headerName}>{name}</Text>

          <TouchableOpacity
            onPress={() => setMoon(!moon)}
            style={{ marginLeft: "auto" }}
          >
            <Text style={{ color: "white", fontSize: 22 }}>
              {moon ? "🌑" : "🌕"}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageItem item={item} />}
          contentContainerStyle={styles.list}
        />

        {otherTyping && (
          <Text style={styles.typing}>🐾 Está escribiendo...</Text>
        )}

        {instinctAwake && !otherTyping && (
          <Text style={styles.instinct}>
            🐾 El instinto despierta… ¿sigues ahí?
          </Text>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ruge algo..."
            placeholderTextColor="#666"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendText}>Enviar</Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.slashOverlay,
            {
              opacity: slashAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
              transform: [
                {
                  translateX: slashAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 200],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.slashText}>🗡️</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#222",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  avatar: { width: 45, height: 45, borderRadius: 22 },
  headerName: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  list: { padding: 14 },
  message: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 6,
    maxWidth: "80%",
    flexDirection: "row",
    alignItems: "center",
  },
  me: {
    backgroundColor: "#1a3d2f",
    alignSelf: "flex-end",
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  them: {
    backgroundColor: "#2a2a2a",
    alignSelf: "flex-start",
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 16, color: "white", flexShrink: 1 },
  paw: { marginRight: 6, fontSize: 18 },
  claw: { marginLeft: 6, fontSize: 18 },
  timestamp: {
    color: "#ccc",
    fontSize: 10,
    marginBottom: 10,
    marginLeft: 4,
    fontStyle: "italic",
  },
  typing: {
    color: "#ddd",
    fontSize: 14,
    marginLeft: 20,
    marginBottom: 6,
  },
  instinct: {
    color: "#cbd5f5",
    fontSize: 13,
    marginLeft: 20,
    marginBottom: 6,
    fontStyle: "italic",
  },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#222",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  input: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "white",
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#22c55e",
    paddingHorizontal: 18,
    borderRadius: 20,
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontWeight: "bold" },
  slashOverlay: {
    position: "absolute",
    top: "40%",
    left: "10%",
  },
  slashText: {
    fontSize: 80,
    color: "rgba(255,255,255,0.25)",
  },
});
