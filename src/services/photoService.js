import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { supabase } from "./supabase";

const AVATARS_BUCKET = "avatars";
const CHAT_IMAGES_BUCKET = "chat-images";

// Tope unificado de fotos por perfil (sin distinción premium)
export const MAX_PHOTOS = 12;

async function uriToArrayBuffer(uri) {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return decode(base64);
}

function getExtension(uri) {
  const ext = uri.split(".").pop()?.split("?")[0]?.toLowerCase();
  return ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
}

// Sufijo único — evita colisión de timestamps en uploads paralelos
function uniqueSuffix() {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Sube la foto de perfil principal (avatar). Filename único para evitar caché RN.
export async function uploadAvatar(userId, localUri) {
  const ext = getExtension(localUri);
  const path = `${userId}/avatar_${uniqueSuffix()}.${ext}`;
  const arrayBuffer = await uriToArrayBuffer(localUri);

  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new Error("La imagen está vacía o no se pudo leer del dispositivo");
  }

  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, arrayBuffer, { contentType: `image/${ext}` });

  if (error) throw error;

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Sube una foto del perfil (visible para todos)
export async function uploadProfilePhoto(userId, localUri) {
  const ext = getExtension(localUri);
  const path = `${userId}/${uniqueSuffix()}.${ext}`;
  const arrayBuffer = await uriToArrayBuffer(localUri);

  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new Error("La imagen está vacía o no se pudo leer del dispositivo");
  }

  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, arrayBuffer, { contentType: `image/${ext}` });

  if (error) throw error;

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Alias compat — código viejo puede seguir importando uploadPublicPhoto
export const uploadPublicPhoto = uploadProfilePhoto;

// Sube una imagen para mandar en chat
export async function uploadChatImage(userId, localUri) {
  const ext = getExtension(localUri);
  const path = `${userId}/${uniqueSuffix()}.${ext}`;
  const arrayBuffer = await uriToArrayBuffer(localUri);

  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new Error("La imagen está vacía o no se pudo leer del dispositivo");
  }

  const { error } = await supabase.storage
    .from(CHAT_IMAGES_BUCKET)
    .upload(path, arrayBuffer, { contentType: `image/${ext}` });

  if (error) throw error;

  const { data } = supabase.storage.from(CHAT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Elimina una foto del perfil dada su URL completa
export async function deleteProfilePhoto(url) {
  const match = url.match(/\/avatars\/(.+)$/);
  if (!match) return;
  const { error } = await supabase.storage.from(AVATARS_BUCKET).remove([match[1]]);
  if (error) throw error;
}

// Guarda el array de fotos en la tabla profiles
export async function savePhotosToProfile(userId, { photos } = {}) {
  if (photos === undefined) return;

  const { error } = await supabase
    .from("profiles")
    .update({ photos })
    .eq("id", userId);

  if (error) throw error;
}
