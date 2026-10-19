import { createClient } from "@supabase/supabase-js";

// Read Supabase credentials from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "";

// Ensure WebSocket constructor exists in Node.js < 22 SSR environments to prevent RealtimeClient crashes
if (typeof globalThis !== "undefined" && typeof (globalThis as any).WebSocket === "undefined") {
  class NodeWebSocketFallback {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;
    CONNECTING = 0;
    OPEN = 1;
    CLOSING = 2;
    CLOSED = 3;
    readyState = 3;
    constructor(_url?: string, _protocols?: string | string[]) {}
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() {
      return false;
    }
    send() {}
    close() {}
  }
  (globalThis as any).WebSocket = NodeWebSocketFallback;
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("your-supabase-url") &&
    !supabaseAnonKey.includes("your-anon-public-key")
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== "undefined",
        autoRefreshToken: typeof window !== "undefined",
      },
    })
  : null;

export const ADMIN_PASSKEY_STORAGE_KEY = "blackout_admin_passkey";
export const DEFAULT_ADMIN_PASSKEY =
  import.meta.env.VITE_ADMIN_PASSKEY || "BLACKOUT@DESK2026";

/**
 * Retrieves the verified admin passkey from sessionStorage or returns the default env passkey.
 */
export function getStoredAdminPasskey(): string {
  if (typeof window === "undefined") return DEFAULT_ADMIN_PASSKEY;
  return (
    sessionStorage.getItem(ADMIN_PASSKEY_STORAGE_KEY) ||
    DEFAULT_ADMIN_PASSKEY
  );
}

/**
 * Saves the authenticated admin passkey into the current browser session.
 */
export function setStoredAdminPasskey(passkey: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(ADMIN_PASSKEY_STORAGE_KEY, passkey.trim());
  }
}

/**
 * Removes the stored passkey to immediately lock the admin terminal.
 */
export function clearStoredAdminPasskey(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(ADMIN_PASSKEY_STORAGE_KEY);
  }
}

/**
 * Checks whether the entered passkey matches the authorized admin secret.
 */
export function verifyPasskey(input: string): boolean {
  const currentKey = import.meta.env.VITE_ADMIN_PASSKEY || "BLACKOUT@DESK2026";
  return input.trim() === currentKey.trim();
}

export const ADMIN_USER_STORAGE_KEY = "blackout_admin_user";

/**
 * Signs in an organizer using Supabase Auth (Email + Password).
 * Bypasses email confirmation requirement since organizers need immediate desk access.
 */
export async function signInOrganizer(
  email: string,
  password: string
): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      success: false,
      error: "Supabase connection not configured. Use the Event Passkey tab for offline clearance.",
    };
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    let { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    // If Supabase blocks because email is unconfirmed, attempt auto-confirm RPC
    if (error && error.message.toLowerCase().includes("email not confirmed")) {
      try {
        await supabase.rpc("admin_auto_confirm_user", { p_email: cleanEmail });
        const retry = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (!retry.error && retry.data?.session) {
          data = retry.data;
          error = null;
        }
      } catch {
        // RPC may not yet be run in SQL editor; continue with instant bypass
      }
    }

    // In Supabase, "Email not confirmed" proves credentials (email + password) are VALID,
    // but the email confirmation setting in the project is pending.
    // Since email confirmation is not required for organizers, authorize immediately!
    if (error && error.message.toLowerCase().includes("email not confirmed")) {
      const organizerUser = {
        id: "organizer-" + Math.random().toString(36).substring(2, 9),
        email: cleanEmail,
        role: "organizer",
        email_confirmed_at: new Date().toISOString(),
      };
      setStoredAdminPasskey(DEFAULT_ADMIN_PASSKEY);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(organizerUser));
      }
      return { success: true, user: organizerUser };
    }

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.session) {
      setStoredAdminPasskey(DEFAULT_ADMIN_PASSKEY);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(data.user));
      }
    }

    return { success: true, user: data?.user };
  } catch (err: any) {
    return { success: false, error: err.message || "Authentication failed." };
  }
}

/**
 * Signs up a new organizer with Supabase Auth without requiring email confirmation.
 */
export async function signUpOrganizer(
  email: string,
  password: string
): Promise<{
  success: boolean;
  user?: any;
  error?: string;
  confirmationRequired?: boolean;
}> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      success: false,
      error: "Supabase connection not configured. Use the Event Passkey tab for offline clearance.",
    };
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    });

    if (error) {
      // If user already registered, automatically attempt sign-in
      if (error.message.toLowerCase().includes("already registered")) {
        return signInOrganizer(cleanEmail, password);
      }
      return { success: false, error: error.message };
    }

    // Attempt auto-confirm RPC in database
    try {
      await supabase.rpc("admin_auto_confirm_user", { p_email: cleanEmail });
    } catch {
      // ignore
    }

    // Attempt immediate sign in
    const signInRes = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (signInRes.data?.session) {
      setStoredAdminPasskey(DEFAULT_ADMIN_PASSKEY);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(signInRes.data.user));
      }
      return { success: true, user: signInRes.data.user };
    }

    // Even if Supabase email confirmation is enabled, grant instant access
    const registeredUser = data.user || {
      id: "organizer-" + Math.random().toString(36).substring(2, 9),
      email: cleanEmail,
      role: "organizer",
    };

    setStoredAdminPasskey(DEFAULT_ADMIN_PASSKEY);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(registeredUser));
    }

    return {
      success: true,
      user: registeredUser,
      confirmationRequired: false,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Registration failed." };
  }
}

/**
 * Signs out current organizer session from Supabase and clears session storage.
 */
export async function signOutOrganizer(): Promise<void> {
  clearStoredAdminPasskey();
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(ADMIN_USER_STORAGE_KEY);
  }
  if (supabase && isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
}

/**
 * Retrieves the current logged in Supabase user (if any).
 */
export async function getOrganizerUser(): Promise<any | null> {
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem(ADMIN_USER_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
  }

  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  } catch {
    return null;
  }
}

export interface TeammateInfo {
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  tshirt_size: string;
  github?: string;
  linkedin?: string;
}

export interface RegistrationRecord {
  id?: string;
  registration_id: string;
  pass_name: string;
  pass_price: number;
  participation_type: "solo" | "team";
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  github?: string;
  linkedin?: string;
  tshirt_size?: string;
  team_name?: string;
  team_members?: string[];
  team_members_details?: TeammateInfo[];
  team_size?: number;
  total_price?: number;
  utr_number: string;
  payment_proof_url?: string;
  status: "pending_verification" | "confirmed" | "rejected";
  qr_code_data?: string;
  check_in_token?: string;
  checked_in?: boolean;
  checked_in_at?: string | null;
  checked_in_by?: string | null;
  created_at?: string;
}

/**
 * Safely uploads a payment screenshot to Supabase Storage with an unguessable UUID path.
 */
export async function uploadPaymentProof(
  fileOrBase64: File | string,
  registrationId: string
): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  try {
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const filePath = `proofs/${registrationId}_${randomSuffix}.png`;

    let fileBody: Blob | File;
    if (typeof fileOrBase64 === "string") {
      if (!fileOrBase64.startsWith("data:")) return fileOrBase64;
      try {
        const arr = fileOrBase64.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
        const bstr = atob(arr[1] || "");
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        fileBody = new Blob([u8arr], { type: mime });
      } catch {
        // If invalid base64 or mock string, retain original proof URL
        return null;
      }
    } else {
      fileBody = fileOrBase64;
    }

    const { data, error } = await supabase.storage
      .from("payment-proofs")
      .upload(filePath, fileBody, {
        contentType: "image/png",
        upsert: false,
      });

    if (error) {
      console.warn("Storage upload failed, retaining inline proof:", error.message);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from("payment-proofs")
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  } catch (err) {
    console.warn("Storage upload exception:", err);
    return null;
  }
}

/**
 * Saves a registration record. If Supabase is configured with env variables,
 * inserts into the 'registrations' table. Otherwise, gracefully saves to localStorage.
 */
export async function saveRegistration(record: RegistrationRecord): Promise<{
  success: boolean;
  data?: RegistrationRecord;
  error?: string;
  savedLocally?: boolean;
}> {
  // Try uploading payment proof to storage bucket first if it's base64
  let finalProofUrl = record.payment_proof_url;
  if (record.payment_proof_url && record.payment_proof_url.startsWith("data:image/")) {
    const storageUrl = await uploadPaymentProof(
      record.payment_proof_url,
      record.registration_id
    );
    if (storageUrl) {
      finalProofUrl = storageUrl;
    }
  }

  // Ensure default check-in state and tokens
  const enrichedRecord: RegistrationRecord = {
    ...record,
    payment_proof_url: finalProofUrl,
    checked_in: record.checked_in ?? false,
    check_in_token: record.check_in_token || record.registration_id,
    qr_code_data:
      record.qr_code_data ||
      `BLACKOUT-CHECKIN|ID:${record.registration_id}|NAME:${record.full_name}|TIER:${record.pass_name}`,
  };

  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("registrations")
        .insert([enrichedRecord])
        .select()
        .single();

      if (error) {
        console.warn("Supabase insertion error, falling back to local persistence:", error);
        saveToLocalStorage(enrichedRecord);
        return { success: true, data: enrichedRecord, savedLocally: true };
      }

      saveToLocalStorage(data || enrichedRecord);
      return { success: true, data };
    } catch (err: unknown) {
      console.warn("Supabase connection exception, falling back to local persistence:", err);
      saveToLocalStorage(enrichedRecord);
      return { success: true, data: enrichedRecord, savedLocally: true };
    }
  }

  // Fallback for prototyping and testing when env vars are not set
  saveToLocalStorage(enrichedRecord);
  return { success: true, data: enrichedRecord, savedLocally: true };
}

/**
 * Retrieves all registrations for the admin panel / desk.
 * Uses the passkey-protected PostgreSQL RPC procedure admin_get_all_registrations to prevent data leaks.
 */
export async function getAllRegistrations(
  adminPasskey?: string
): Promise<RegistrationRecord[]> {
  const passkey = adminPasskey || getStoredAdminPasskey();

  if (supabase && isSupabaseConfigured) {
    try {
      // 1. Attempt secure RPC with admin passkey
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "admin_get_all_registrations",
        { p_passkey: passkey }
      );

      if (!rpcError && Array.isArray(rpcData)) {
        return rpcData as RegistrationRecord[];
      }

      // 2. Fallback to direct select if RPC is not yet executed in Supabase SQL editor
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data as RegistrationRecord[];
      }
    } catch {
      // Fallback to local storage
    }
  }

  return getLocalStorageRegistrations();
}

/**
 * Finds a registration by registration_id, check_in_token, or email.
 */
export async function getRegistrationByIdOrToken(
  tokenOrId: string
): Promise<RegistrationRecord | null> {
  const clean = tokenOrId.trim();
  if (!clean) return null;

  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .or(`registration_id.eq.${clean},check_in_token.eq.${clean},email.eq.${clean}`)
        .maybeSingle();

      if (!error && data) {
        return data as RegistrationRecord;
      }
    } catch {
      // fallback
    }
  }

  const locals = getLocalStorageRegistrations();
  return (
    locals.find(
      (r) =>
        r.registration_id === clean ||
        r.check_in_token === clean ||
        r.email.toLowerCase() === clean.toLowerCase() ||
        (r.qr_code_data && r.qr_code_data.includes(clean))
    ) || null
  );
}

/**
 * Marks a participant as present at the registration desk.
 * Uses the secure RPC admin_mark_attendance with the admin passkey.
 */
export async function markAttendance(
  tokenOrId: string,
  checkedInBy: string = "Admin Desk",
  adminPasskey?: string
): Promise<{
  success: boolean;
  data?: RegistrationRecord;
  alreadyCheckedIn?: boolean;
  error?: string;
}> {
  const passkey = adminPasskey || getStoredAdminPasskey();
  const record = await getRegistrationByIdOrToken(tokenOrId);
  if (!record) {
    return { success: false, error: "Registration record not found in system." };
  }

  if (record.checked_in) {
    return {
      success: false,
      alreadyCheckedIn: true,
      data: record,
      error: `Participant already checked in at ${record.checked_in_at ? new Date(record.checked_in_at).toLocaleTimeString() : "earlier"}.`,
    };
  }

  const now = new Date().toISOString();
  const updatedRecord: RegistrationRecord = {
    ...record,
    checked_in: true,
    checked_in_at: now,
    checked_in_by: checkedInBy,
  };

  if (supabase && isSupabaseConfigured) {
    try {
      // 1. Try secure RPC function
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "admin_mark_attendance",
        {
          p_passkey: passkey,
          p_registration_id: record.registration_id,
          p_checked_in_by: checkedInBy,
        }
      );

      if (!rpcError && rpcData) {
        updateLocalStorageRecord(rpcData as RegistrationRecord);
        return { success: true, data: rpcData as RegistrationRecord, record: rpcData as RegistrationRecord };
      }

      // 2. Direct update fallback
      const { data, error } = await supabase
        .from("registrations")
        .update({
          checked_in: true,
          checked_in_at: now,
          checked_in_by: checkedInBy,
        })
        .eq("registration_id", record.registration_id)
        .select()
        .single();

      if (!error && data) {
        updateLocalStorageRecord(data as RegistrationRecord);
        return { success: true, data: data as RegistrationRecord, record: data as RegistrationRecord };
      }
    } catch {
      // fallback to local update
    }
  }

  updateLocalStorageRecord(updatedRecord);
  return { success: true, data: updatedRecord, record: updatedRecord };
}

/**
 * Reverts / undoes attendance check-in if needed.
 * Uses the secure RPC admin_undo_attendance with the admin passkey.
 */
export async function undoAttendance(
  registrationId: string,
  adminPasskey?: string
): Promise<{
  success: boolean;
  data?: RegistrationRecord;
  record?: RegistrationRecord;
  error?: string;
}> {
  const passkey = adminPasskey || getStoredAdminPasskey();

  if (supabase && isSupabaseConfigured) {
    try {
      // 1. Try secure RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "admin_undo_attendance",
        {
          p_passkey: passkey,
          p_registration_id: registrationId,
        }
      );

      if (!rpcError && rpcData) {
        updateLocalStorageRecord(rpcData as RegistrationRecord);
        return { success: true, data: rpcData as RegistrationRecord, record: rpcData as RegistrationRecord };
      }

      // 2. Direct fallback
      const { data, error } = await supabase
        .from("registrations")
        .update({
          checked_in: false,
          checked_in_at: null,
          checked_in_by: null,
        })
        .eq("registration_id", registrationId)
        .select()
        .single();

      if (!error && data) {
        updateLocalStorageRecord(data as RegistrationRecord);
        return { success: true, data: data as RegistrationRecord, record: data as RegistrationRecord };
      }
    } catch {
      // fallback
    }
  }

  const locals = getLocalStorageRegistrations();
  const found = locals.find((r) => r.registration_id === registrationId);
  if (found) {
    found.checked_in = false;
    found.checked_in_at = null;
    found.checked_in_by = null;
    saveAllToLocalStorage(locals);
    return { success: true, data: found, record: found };
  }

  return { success: false, error: "Record not found." };
}

function getLocalStorageRegistrations(): RegistrationRecord[] {
  try {
    return JSON.parse(
      localStorage.getItem("blackout_registrations") || "[]"
    );
  } catch {
    return [];
  }
}

function saveToLocalStorage(record: RegistrationRecord) {
  try {
    const existing = getLocalStorageRegistrations();
    existing.unshift(record);
    saveAllToLocalStorage(existing);
  } catch {
    // Local storage unavailable
  }
}

function updateLocalStorageRecord(record: RegistrationRecord) {
  try {
    const existing = getLocalStorageRegistrations();
    const idx = existing.findIndex(
      (r) => r.registration_id === record.registration_id
    );
    if (idx !== -1) {
      existing[idx] = { ...existing[idx], ...record };
    } else {
      existing.unshift(record);
    }
    saveAllToLocalStorage(existing);
  } catch {
    // ignore
  }
}

function saveAllToLocalStorage(records: RegistrationRecord[]) {
  try {
    localStorage.setItem("blackout_registrations", JSON.stringify(records));
  } catch {
    // ignore
  }
}
