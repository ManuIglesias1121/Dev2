import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// Compatibilidad total: Web + Nativo
const extra =
  Constants.expoConfig?.extra || // iOS / Android
  Constants.manifest?.extra ||   // Web
  {};

console.log(">>> DEBUG SUPABASE CONFIG <<<");
console.log("SUPABASE URL:", extra.supabaseUrl);
console.log("SUPABASE KEY:", extra.supabaseAnonKey?.slice(0, 12));

if (!extra.supabaseUrl || !extra.supabaseAnonKey) {
  console.error("❌ ERROR: Supabase URL o KEY no están definidas.");
}

export const supabase = createClient(
  extra.supabaseUrl,
  extra.supabaseAnonKey
);
