import { supabase } from "./supabase";
import { signOut } from "./authService";
import { clearAll } from "./storageService";

/**
 * Elimina la cuenta del usuario actualmente autenticado.
 *
 * Cobertura actual (cliente-only, sin service role):
 *  1. Marca deletion_requested_at en profiles (audit trail).
 *  2. Borra las fotos del usuario en los buckets de Storage.
 *  3. Borra la fila de profiles → CASCADE elimina likes, matches, messages,
 *     super_matches, profile_visits, events, event_attendees, event_messages,
 *     security_violations, user_blocks, user_reports, consent_log.
 *  4. signOut y clearAll de AsyncStorage.
 *
 * Pendiente (requiere Edge Function con service_role):
 *  - Borrar el row de auth.users. Hasta que exista la Edge Function,
 *    la cuenta de Auth queda huérfana (sin perfil ni datos asociados).
 *    El usuario puede re-registrarse con el mismo email reusando la Auth row.
 *    Si querés borrar también auth.users, crear una Edge Function
 *    "delete-user" que invoque supabase.auth.admin.deleteUser(userId).
 */
export async function deleteMyAccount() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error("No hay sesión activa");

  const userId = session.user.id;

  // 1. Audit trail: marcar la solicitud de eliminación antes de borrar.
  // (Si el borrado falla, queda el rastro de que el usuario solicitó eliminar).
  try {
    await supabase
      .from("profiles")
      .update({ deletion_requested_at: new Date().toISOString() })
      .eq("id", userId);
  } catch (e) {
    console.warn("No se pudo marcar deletion_requested_at:", e?.message || e);
  }

  // 2. Borrar fotos del usuario en Storage
  await deleteUserStorage(userId);

  // 3. Borrar el perfil — el CASCADE de Postgres se encarga del resto
  const { error: deleteError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (deleteError) {
    // Si RLS impide borrar, lanzamos para que la UI muestre el error
    throw new Error(`No se pudo eliminar el perfil: ${deleteError.message}`);
  }

  // 4. Cerrar sesión y limpiar storage local
  try { await signOut(); } catch {}
  try { await clearAll(); } catch {}

  return { ok: true };
}

/**
 * Borra todos los archivos del usuario en los 3 buckets conocidos.
 * Best-effort: si algún bucket no existe o falla, seguimos.
 */
async function deleteUserStorage(userId) {
  const buckets = ["avatars", "exclusive-photos", "chat-images"];
  for (const bucket of buckets) {
    try {
      const { data: files } = await supabase
        .storage
        .from(bucket)
        .list(userId, { limit: 1000 });

      if (files && files.length > 0) {
        const paths = files.map((f) => `${userId}/${f.name}`);
        await supabase.storage.from(bucket).remove(paths);
      }
    } catch (e) {
      console.warn(`No se pudieron borrar archivos del bucket ${bucket}:`, e?.message || e);
    }
  }
}
