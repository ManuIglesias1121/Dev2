import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { supabase } from "./supabase";

const AVATARS_BUCKET = "avatars";
const EXCLUSIVE_BUCKET = "exclusive-photos";
const CHAT_IMAGES_BUCKET = "chat-images";

// Límites de fotos según tipo de cuenta
const MAX_PUBLIC_PHOTOS_FREE = 6;
const MAX_PUBLIC_PHOTOS_PREMIUM = 12;
const MAX_EXCLUSIVE_PHOTOS = 12;

export function getMaxPublicPhotos(isPremium) {
  return isPremium ? MAX_PUBLIC_PHOTOS_PREMIUM : MAX_PUBLIC_PHOTOS_FREE;
}

// Backwards compat (default 6 si no se especifica)
export const MAX_PUBLIC_PHOTOS = MAX_PUBLIC_PHOTOS_FREE;
export { MAX_EXCLUSIVE_PHOTOS };

// Lee el archivo local y lo convierte a ArrayBuffer (método confiable en RN/Expo)
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

// Genera un sufijo único para evitar colisión de timestamps cuando se suben
// múltiples fotos en paralelo (Date.now() puede repetirse al milisegundo)
function uniqueSuffix() {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Sube la foto de perfil principal (avatar)
// Usa filename único para evitar caché de React Native
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

// Sube una foto pública del perfil (visible para todos)
export async function uploadPublicPhoto(userId, localUri) {
  const ext = getExtension(localUri);
  const path = `${userId}/${uniqueSuffix()}.${ext}`;
  const arrayBuffer = await uriToArrayBuffer(localUri);

  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, arrayBuffer, { contentType: `image/${ext}` });

  if (error) throw error;

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

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

// Sube una foto exclusiva (solo visible para usuarios premium)
export async function uploadExclusivePhoto(userId, localUri) {
  const ext = getExtension(localUri);
  const path = `${userId}/${uniqueSuffix()}.${ext}`;
  const arrayBuffer = await uriToArrayBuffer(localUri);

  // Verificar tamaño antes de subir (ArrayBuffer.byteLength)
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new Error("La imagen está vacía o no se pudo leer del dispositivo");
  }

  const { data, error } = await supabase.storage
    .from(EXCLUSIVE_BUCKET)
    .upload(path, arrayBuffer, { contentType: `image/${ext}` });

  if (error) throw error;
  if (!data?.path) throw new Error("Upload no devolvió path — falló silenciosamente");

  // Verificar que el archivo realmente quedó subido generando una signed URL
  // Si no se puede generar, el archivo no existe en el bucket
  const { error: verifyError } = await supabase.storage
    .from(EXCLUSIVE_BUCKET)
    .createSignedUrl(path, 60);

  if (verifyError) {
    throw new Error(`El archivo no quedó guardado: ${verifyError.message}`);
  }

  return path;
}

// Genera URL firmada temporal para fotos exclusivas (1 hora)
export async function getExclusivePhotoUrl(path) {
  const { data, error } = await supabase.storage
    .from(EXCLUSIVE_BUCKET)
    .createSignedUrl(path, 3600);

  if (error) throw error;
  return data.signedUrl;
}

// Genera URLs firmadas para un array de paths exclusivos
export async function getExclusivePhotoUrls(paths) {
  if (!paths || paths.length === 0) return [];
  const results = await Promise.allSettled(paths.map(getExclusivePhotoUrl));
  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);
}

// Elimina una foto pública dado su URL completa
export async function deletePublicPhoto(url) {
  const match = url.match(/\/avatars\/(.+)$/);
  if (!match) return;
  const { error } = await supabase.storage.from(AVATARS_BUCKET).remove([match[1]]);
  if (error) throw error;
}

// Elimina una foto exclusiva dado su path
export async function deleteExclusivePhoto(path) {
  const { error } = await supabase.storage.from(EXCLUSIVE_BUCKET).remove([path]);
  if (error) throw error;
}

// Guarda el array de fotos en la tabla profiles
export async function savePhotosToProfile(userId, { photos, exclusivePhotos } = {}) {
  const updates = {};
  if (photos !== undefined) updates.photos = photos;
  if (exclusivePhotos !== undefined) updates.exclusive_photos = exclusivePhotos;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) throw error;
}
