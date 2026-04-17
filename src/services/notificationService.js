let Notifications = null;
let Device = null;

async function getModules() {
  if (Notifications && Device) return { Notifications, Device };
  try {
    Notifications = await import("expo-notifications");
    Device = await import("expo-device");
    return { Notifications, Device };
  } catch {
    return { Notifications: null, Device: null };
  }
}

export async function setupNotifications() {
  const { Notifications: N } = await getModules();
  if (!N) return null;

  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  const token = await registerForPushNotificationsAsync();
  return token;
}

export async function registerForPushNotificationsAsync() {
  const { Notifications: N, Device: D } = await getModules();
  if (!N || !D) return null;

  if (!D.isDevice) return null;

  const { status: existing } = await N.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await N.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  try {
    const token = (await N.getExpoPushTokenAsync()).data;
    return token;
  } catch {
    return null;
  }
}

export async function scheduleLocalNotification({ title, body, data = {}, delaySeconds = 0 }) {
  const { Notifications: N } = await getModules();
  if (!N) return;
  try {
    await N.scheduleNotificationAsync({
      content: { title, body, data, sound: true },
      trigger: delaySeconds > 0 ? { seconds: delaySeconds } : null,
    });
  } catch {}
}

export async function sendMatchNotification(matchName) {
  await scheduleLocalNotification({
    title: "¡Nuevo Match! 🐾",
    body: `Tú y ${matchName} se han gustado mutuamente`,
    data: { type: "match" },
  });
}

export async function sendMessageNotification(senderName, preview) {
  await scheduleLocalNotification({
    title: `${senderName} te escribió 💬`,
    body: preview.length > 50 ? preview.substring(0, 47) + "..." : preview,
    data: { type: "message" },
  });
}

export async function sendSuperMatchNotification(senderName) {
  await scheduleLocalNotification({
    title: `¡Super Match de ${senderName}! ⭐`,
    body: "¡Alguien está muy interesado en conocerte!",
    data: { type: "supermatch" },
  });
}

export async function sendVisitorNotification(visitorName) {
  await scheduleLocalNotification({
    title: "Alguien visitó tu perfil 👀",
    body: `${visitorName} revisó tu perfil`,
    data: { type: "visitor" },
  });
}
