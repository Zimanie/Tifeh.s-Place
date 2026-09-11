import { supabase, isSupabaseConfigured } from './supabase';

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
}

export interface UserSession {
  id?: string;
  email: string;
  name: string;
  isAdmin: boolean;
  provider: 'email' | 'google';
  avatar?: string;
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

export function getStoredSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as UserSession;
    return {
      ...session,
      isAdmin: isAdminEmail(session.email),
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
  } catch (e) {
    console.error('Failed to save user session', e);
  }
}

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
  updates: { name?: string; email?: string; avatar?: string }
): Promise<{ session: UserSession; error?: string }> {
  const stored = getStoredSession();
  if (!stored) {
    return { session: null as any, error: 'No active session found.' };
  }

  const newEmail = updates.email ? updates.email.trim().toLowerCase() : stored.email;
  const newName = updates.name !== undefined ? updates.name.trim() : stored.name;
  const newAvatar = updates.avatar !== undefined ? updates.avatar : stored.avatar;
  const newIsAdmin = isAdminEmail(newEmail);

  // If Supabase is connected, update user metadata
  if (isSupabaseConfigured && supabase) {
    try {
      const updateData: any = {
        data: {
          full_name: newName,
          avatar_url: newAvatar,
        },
      };
      if (newEmail !== stored.email) {
        updateData.email = newEmail;
      }
      await supabase.auth.updateUser(updateData);
    } catch (e) {
      console.warn('Supabase updateUser error (continuing with local state):', e);
    }
  }

  const updatedSession: UserSession = {
    ...stored,
    email: newEmail,
    name: newName,
    avatar: newAvatar,
    isAdmin: newIsAdmin,
  };

  saveSession(updatedSession);
  return { session: updatedSession };
}

export async function deleteUserAccount(email: string): Promise<void> {
  // Clear Supabase session if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out during account deletion', e);
    }
  }

  clearSession();
}

/**
 * Supabase Email Sign In
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ session: UserSession; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return { session: null as any, error: error.message };
    }

    const user = data.user;
    const metaName = user?.user_metadata?.full_name || user?.user_metadata?.name;
    const metaAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

    const session: UserSession = {
      id: user?.id,
      email: user?.email || cleanEmail,
      name: metaName || cleanEmail.split('@')[0],
      avatar: metaAvatar || MODERN_AVATARS[0],
      isAdmin: isAdminEmail(user?.email || cleanEmail),
      provider: 'email',
    };
    saveSession(session);
    return { session };
  }

  // Local fallback
  const session: UserSession = {
    email: cleanEmail,
    name: cleanEmail.split('@')[0],
    avatar: MODERN_AVATARS[0],
    isAdmin: isAdminEmail(cleanEmail),
    provider: 'email',
  };
  saveSession(session);
  return { session };
}

/**
 * Supabase Email Sign Up
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
): Promise<{ session: UserSession; error?: string; message?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const avatar = MODERN_AVATARS[Math.floor(Math.random() * MODERN_AVATARS.length)];

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          avatar_url: avatar,
        },
      },
    });

    if (error) {
      return { session: null as any, error: error.message };
    }

    const user = data.user;
    const session: UserSession = {
      id: user?.id,
      email: user?.email || cleanEmail,
      name: fullName.trim() || cleanEmail.split('@')[0],
      avatar,
      isAdmin: isAdminEmail(user?.email || cleanEmail),
      provider: 'email',
    };

    if (data.session) {
      saveSession(session);
    }

    return {
      session,
      message: data.session
        ? undefined
        : 'Account created! If confirmation is required, please check your inbox.',
    };
  }

  // Local fallback
  const session: UserSession = {
    email: cleanEmail,
    name: fullName.trim() || cleanEmail.split('@')[0],
    avatar,
    isAdmin: isAdminEmail(cleanEmail),
    provider: 'email',
  };
  saveSession(session);
  return { session };
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
          prompt: 'consent',
        },
      },
    });
    if (error) {
      return { error: error.message };
    }
    return {};
  }

  return { error: 'Supabase credentials are not yet configured in .env' };
}
