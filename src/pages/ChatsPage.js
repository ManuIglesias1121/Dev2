import { useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function ChatsPage() {
  const { profile } = useContext(AuthContext);
  const navigation = useNavigation();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChats = async () => {
    if (!profile) return;

    const myId = profile.user_id;

    // 1) Buscar todos los chats donde participo
    const { data: chatRows } = await supabase
      .from('chats')
      .select('*')
      .or(`user1_id.eq.${myId},user2_id.eq.${myId}`)
      .order('created_at', { ascending: false });

    if (!chatRows) {
      setChats([]);
      setLoading(false);
      return;
    }

    // 2) Para cada chat, obtener el otro usuario
    const enriched = [];

    for (const chat of chatRows) {
      const otherId = chat.user1_id === myId ? chat.user2_id : chat.user1_id;

      const { data: otherProfile } = await supabase
        .from('therian_profiles')
        .select('*')
        .eq('user_id', otherId)
        .single();

      // 3) Obtener último mensaje
      const { data: lastMsg } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: false })
        .limit(1);

      enriched.push({
        chatId: chat.id,
        other: otherProfile,
        lastMessage: lastMsg?.[0] || null,
      });
    }

    setChats(enriched);
    setLoading(false);
  };

  useEffect(() => {
    loadChats();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatRow}
      onPress={() =>
        navigation.navigate('ChatRoom', {
          chatId: item.chatId,
          name: item.other.display_name,
          photo: item.other.avatar_url,
        })
      }
    >
      <Image source={{ uri: item.other.avatar_url }} style={styles.avatar} />

      <View style={styles.info}>
        <Text style={styles.name}>{item.other.display_name}</Text>
        <Text style={styles.lastMsg}>
          {item.lastMessage ? item.lastMessage.text : 'Sin mensajes aún'}
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
  container: { flex: 1, backgroundColor: 'black', padding: 16 },
  title: {
    color: 'white',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#22c55e33',
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 14 },
  info: { flex: 1 },
  name: { color: 'white', fontSize: 18, fontWeight: '700' },
  lastMsg: { color: '#aaa', marginTop: 4 },
});
