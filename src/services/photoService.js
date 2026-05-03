import { supabase } from "./supabase";

const AVATARS_BUCKET = "avatars";
const EXCLUSIVE_BUCKET = "exclusive-photos";
const MAX_PUBLIC_PHOTOS = 6;
const MAX_EXCLUSIVE_PHOTOS = 12;

export { MAX_PUBLIC_PHOTOS, MAX_EXCLUSIVE_PHOTOS };

async function uriToBlob(uri) {
  const response = await fetch(uri);
  return response.blob();
}

function getExtension(uri) {
  const ext = uri.split(".").pop()?.split("?")[0]?.toLowerCase();
  return ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
}

// Sube la foto de perfil principal (avatar)
export async function uploadAvatar(userId, localUri) {
  const ext = getExtension(localUri);
  const path = `${userId}/avatar.${ext}`;
  const blob = await uriToBlob(localUri);

  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, blob, { contentType: `image/${ext}`, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Sube una foto pública del perfil (visible para todos)
export async function uploadPublicPhoto(userId, localUri) {
  const ext = getExtension(localUri);
  const path = `${userId}/${Date.now()}.${ext}`;
  const blob = await uriToBlob(localUri);

  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, blob, { contentType: `image/${ext}` });

  if (error) throw error;

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Sube una foto exclusiva (solo visible para usuarios premium)
export async function uploadExclusivePhoto(userId, localUri) {
  const ext = getExtension(localUri);
  const path = `${userId}/${Date.now()}.${ext}`;
  const blob = await uriToBlob(localUri);

  const { error } = await supabase.storage
    .from(EXCLUSIVE_BUCKET)
    .upload(path, blob, { contentType: `image/${ext}` });

  if (error) throw error;

  return path; // Guardamos el path, no la URL (necesita signed URL para verse)
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
