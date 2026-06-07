import { supabase } from "./supabase";

export async function signUp(email, password, displayName = null) {
  // Registro mínimo: solo email + contraseña. El display_name se autocompleta
  // en el AuthContext a partir del email si no se manda. La fecha de nacimiento
  // ya no se pide en el alta (se reemplazó por checkbox de mayoría).
  const options = displayName ? { data: { display_name: displayName } } : undefined;
  const { data, error } = await supabase.auth.signUp({ email, password, options });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle(); // null si no existe, sin lanzar error
  if (error) throw error;
  return data;
}

export async function upsertProfile(profile) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile)
    .select()
    .single();
  if (error) throw error;
  return data;
}
