import { AVATARS } from "./avatarAssets";

export const fakeChats = [
  {
    chatId: 1,
    other: {
      display_name: "Lyra",
      avatar: AVATARS["loba-1"],
    },
    lastMessage: {
      text: "¿Sigues ahí?",
      created_at: "2024-01-01T12:00:00Z",
    },
  },
  {
    chatId: 2,
    other: {
      display_name: "Zephyr",
      avatar: AVATARS["zorro-1"],
    },
    lastMessage: {
      text: "Me encantó hablar contigo",
      created_at: "2024-01-02T15:30:00Z",
    },
  },
  {
    chatId: 3,
    other: {
      display_name: "Vixie",
      avatar: AVATARS["fox-f-1"],
    },
    lastMessage: null,
  },
];
