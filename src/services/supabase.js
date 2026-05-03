import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = "https://yjwfxlszftrniynurnju.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlqd2Z4bHN6ZnRybml5bnVybmp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTk2OTMsImV4cCI6MjA5MjY5NTY5M30.WbMuu4F0x0LbwrBrSMqGRYz4T11R8_p310CAqnlrv8U";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
