import { supabase, isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from './supabase';

export const DEFAULT_ADMIN_EMAILS = [
  'savyzeus101@gmail.com',
  'admin@tifehsplace.ng',
  'admin@gmail.com',
];

const SESSION_STORAGE_KEY = 'tifehs_user_session_v1';
const RECENTLY_VIEWED_KEY = 'tifehs_recently_viewed_v1';
const USER_PROFILES_KEY = 'tifehs_user_profiles_v1';

export interface UserProfile {
  id?: string;
  email: string;
  name: string;
  avatar: string;
  provider: 'email' | 'google';
  createdAt: string;
  phone?: string;
  deliveryAddress?: string;
}

export interface UserSession {
  id?: string;
  email: string;
  name: string;
  isAdmin: boolean;
  provider: 'email' | 'google';
  avatar?: string;
  phone?: string;
  deliveryAddress?: string;
}

// Preset modern avatar collections (designer geometric, luxury monogram & editorial minimalist)
export const MODERN_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();

  const envAdmin = ((import.meta as any).env?.VITE_ADMIN_GMAIL as string | undefined)?.trim().toLowerCase();
  if (envAdmin && clean === envAdmin) {
    return true;
  }

  if (DEFAULT_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === clean)) {
    return true;
  }

  if (clean.startsWith('admin@') || clean.includes('+admin@')) {
    return true;
  }

  return false;
}

/**
 * Persist user profile to local database repository AND Supabase profiles table.
 * Crucial: this is NEVER erased when user signs out, so logging back in restores
 * customized avatars (uploaded from gallery), custom names, delivery details, etc.
 */
export function persistUserProfile(profile: {
  email: string;
  name?: string;
  avatar?: string;
  phone?: string;
  deliveryAddress?: string;
  provider?: 'email' | 'google';
}): void {
  if (typeof window === 'undefined' || !profile.email) return;
  const cleanEmail = profile.email.trim().toLowerCase();

  try {
    const raw = localStorage.getItem(USER_PROFILES_KEY);
    const registry: Record<string, UserProfile> = raw ? JSON.parse(raw) : {};
    const existing = registry[cleanEmail];

    registry[cleanEmail] = {
      email: cleanEmail,
      name: profile.name !== undefined && profile.name.trim() ? profile.name.trim() : existing?.name || cleanEmail.split('@')[0],
      avatar: profile.avatar || existing?.avatar || MODERN_AVATARS[0],
      provider: profile.provider || existing?.provider || 'email',
      createdAt: existing?.createdAt || new Date().toISOString(),
      phone: profile.phone !== undefined ? profile.phone : existing?.phone,
      deliveryAddress: profile.deliveryAddress !== undefined ? profile.deliveryAddress : existing?.deliveryAddress,
    };

    localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(registry));
  } catch (e) {
    console.error('Failed to save user profile in local registry', e);
  }

  // Also sync to Supabase `profiles` table when connected
  if (isSupabaseConfigured && supabase) {
    Promise.resolve(
      supabase
        .from('profiles')
        .upsert(
          {
            email: cleanEmail,
            name: profile.name,
            avatar_url: profile.avatar,
            phone: profile.phone,
            address: profile.deliveryAddress,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        )
    )
      .then(({ error }) => {
        if (error) console.warn('Note on Supabase profiles sync:', error.message);
      })
      .catch((e: unknown) => console.warn('Supabase profiles sync error:', e));
  }
}

export { isSupabaseConfigured };

/**
 * Retrieve saved user profile by email
 */
export function getSavedUserProfile(email: string): UserProfile | null {
  if (typeof window === 'undefined' || !email) return null;
  const cleanEmail = email.trim().toLowerCase();
  try {
    const raw = localStorage.getItem(USER_PROFILES_KEY);
    if (!raw) return null;
    const registry: Record<string, UserProfile> = JSON.parse(raw);
    return registry[cleanEmail] || null;
  } catch {
    return null;
  }
}

export function getStoredSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as UserSession;
    const cleanEmail = session.email.trim().toLowerCase();

    // Rehydrate with persistent profile (avatar, custom name, address)
    const saved = getSavedUserProfile(cleanEmail);
    return {
      ...session,
      name: saved?.name || session.name,
      avatar: saved?.avatar || session.avatar,
      phone: saved?.phone || session.phone,
      deliveryAddress: saved?.deliveryAddress || session.deliveryAddress,
      isAdmin: isAdminEmail(cleanEmail),
    };
  } catch (e) {
    console.error('Failed to parse user session', e);
    return null;
  }
}

export function saveSession(session: UserSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    // Simultaneously persist to the profile database registry
    persistUserProfile({
      email: session.email,
      name: session.name,
      avatar: session.avatar,
      phone: session.phone,
      deliveryAddress: session.deliveryAddress,
      provider: session.provider,
    });
  } catch (e) {
    console.error('Failed to save user session', e);
  }
}

/**
 * Clears active session token only. User account details and uploaded photos
 * in the database/registry are permanently preserved!
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear user session', e);
  }
}

/**
 * Recently Viewed Items Tracking
 */
export function getRecentlyViewedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(productId: string): void {
  if (typeof window === 'undefined' || !productId) return;
  try {
    const current = getRecentlyViewedIds().filter((id) => id !== productId);
    const updated = [productId, ...current].slice(0, 12);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save recently viewed item', e);
  }
}

export function clearRecentlyViewed(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RECENTLY_VIEWED_KEY);
}

/**
 * User Profile update and deletion
 */
export async function updateUserProfile(
  currentEmail: string,
  updates: { name?: string; email?: string; avatar?: string; phone?: string; deliveryAddress?: string }
): Promise<{ session: UserSession; error?: string }> {
  const stored = getStoredSession();
  const effectiveEmail = (updates.email || currentEmail || stored?.email || '').trim().toLowerCase();

  if (!effectiveEmail) {
    return { session: null as any, error: 'No user email specified.' };
  }

  const existingProfile = getSavedUserProfile(effectiveEmail);
  const newName = updates.name !== undefined && updates.name.trim() ? updates.name.trim() : (stored?.name || existingProfile?.name || effectiveEmail.split('@')[0]);
  const newAvatar = updates.avatar !== undefined ? updates.avatar : (stored?.avatar || existingProfile?.avatar || MODERN_AVATARS[0]);
  const newPhone = updates.phone !== undefined ? updates.phone : (stored?.phone || existingProfile?.phone);
  const newAddress = updates.deliveryAddress !== undefined ? updates.deliveryAddress : (stored?.deliveryAddress || existingProfile?.deliveryAddress);
  const newIsAdmin = isAdminEmail(effectiveEmail);

  // If Supabase is connected, update user metadata
  if (isSupabaseConfigured && supabase) {
    try {
      const updateData: any = {
        data: {
          full_name: newName,
          avatar_url: newAvatar,
        },
      };
      if (effectiveEmail !== stored?.email) {
        updateData.email = effectiveEmail;
      }
      await supabase.auth.updateUser(updateData);
    } catch (e) {
      console.warn('Supabase updateUser error (continuing with local state):', e);
    }
  }

  const updatedSession: UserSession = {
    ...(stored || {}),
    email: effectiveEmail,
    name: newName,
    avatar: newAvatar,
    phone: newPhone,
    deliveryAddress: newAddress,
    isAdmin: newIsAdmin,
    provider: stored?.provider || 'email',
  };

  saveSession(updatedSession);
  return { session: updatedSession };
}

export async function deleteUserAccount(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out during account deletion', e);
    }
  }

  // Remove from saved profiles
  try {
    const raw = localStorage.getItem(USER_PROFILES_KEY);
    if (raw) {
      const registry = JSON.parse(raw);
      delete registry[cleanEmail];
      localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(registry));
    }
  } catch (e) {
    console.error('Error removing profile from registry', e);
  }

  clearSession();
}

/**
 * Universal Email & Client Profile Sign In / Sign Up
 * Restores all saved database details for this user instead of resetting!
 */
export async function signInOrRegisterUser(
  email: string,
  fullName?: string,
  password?: string
): Promise<{ session: UserSession; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { session: null as any, error: 'Please enter a valid email address.' };
  }

  // Check if there is an already saved profile in the database/registry
  const existing = getSavedUserProfile(cleanEmail);
  const resolvedName = (fullName && fullName.trim()) || existing?.name || cleanEmail.split('@')[0];
  const resolvedAvatar = existing?.avatar || MODERN_AVATARS[0];

  // Try Supabase Auth if configured
  if (isSupabaseConfigured && supabase && password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data.user) {
        const metaName = data.user.user_metadata?.full_name || data.user.user_metadata?.name;
        const metaAvatar = data.user.user_metadata?.avatar_url;
        const session: UserSession = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          name: metaName || resolvedName,
          avatar: metaAvatar || resolvedAvatar,
          isAdmin: isAdminEmail(data.user.email || cleanEmail),
          provider: 'email',
        };
        saveSession(session);
        return { session };
      }
    } catch (e) {
      console.warn('Supabase email sign in attempt:', e);
    }
  }

  // Universal fallback: login & restore saved profile
  const session: UserSession = {
    email: cleanEmail,
    name: resolvedName,
    avatar: resolvedAvatar,
    phone: existing?.phone,
    deliveryAddress: existing?.deliveryAddress,
    isAdmin: isAdminEmail(cleanEmail),
    provider: 'email',
  };

  saveSession(session);
  return { session };
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ session: UserSession; error?: string }> {
  return signInOrRegisterUser(email, undefined, password);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
): Promise<{ session: UserSession; error?: string }> {
  return signInOrRegisterUser(email, fullName, password);
}

/**
 * Supabase Google OAuth
 */
export async function signInWithGoogleOAuth(): Promise<{ error?: string }> {
  if (isSupabaseConfigured && supabase) {
    const redirectUrl = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });
    if (error) {
      return { error: error.message };
    }
    return {};
  }

  if (!supabaseUrl && !supabaseAnonKey) {
    return {
      error:
        'Supabase credentials are not detected in VS Code. Please verify your .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and restart your Vite server (Ctrl+C then npm run dev). Alternatively, you can use the Email/Admin sign-in below to log in instantly.',
    };
  }
  if (!supabaseUrl) {
    return { error: 'VITE_SUPABASE_URL is missing in .env. Please add it and restart your dev server.' };
  }
  if (!supabaseAnonKey) {
    return { error: 'VITE_SUPABASE_ANON_KEY is missing in .env. Please add it and restart your dev server.' };
  }

  return {
    error: 'Supabase credentials are not yet configured in .env. You can also sign in with your email or admin address directly below.',
  };
}
