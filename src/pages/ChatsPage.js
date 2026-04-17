import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fakeChats } from "../data/fakeChats";

export default function ChatsPage() {
  const navigation = useNavigation();
  const [chats] = useState(fakeChats);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatRow}
      onPress={() =>
        navigation.navigate("ChatRoomPage", {
          chatId: item.chatId,
          name: item.other.display_name,
          photo: item.other.avatar,
        })
      }
    >
      <Image source={{ uri: item.other.avatar }} style={styles.avatar} />

      <View style={styles.info}>
        <Text style={styles.name}>{item.other.display_name}</Text>
        <Text style={styles.lastMsg}>
          {item.lastMessage ? item.lastMessage.text : "Sin mensajes aún"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus chats</Text>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.chatId.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black", padding: 16 },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#22c55e33",
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 14 },
  info: { flex: 1 },
  name: { color: "white", fontSize: 18, fontWeight: "700" },
  lastMsg: { color: "#aaa", marginTop: 4 },
});
