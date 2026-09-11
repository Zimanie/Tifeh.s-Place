// Authentication helper & admin detection
export const DEFAULT_ADMIN_EMAILS = [
  'savyzeus101@gmail.com',
  'admin@tifehsplace.ng',
  'admin@gmail.com',
];

const SESSION_STORAGE_KEY = 'tifehs_user_session_v1';
const CUSTOM_ADMIN_GMAIL_KEY = 'tifehs_admin_gmail_v1';

export interface UserSession {
  email: string;
  name: string;
  isAdmin: boolean;
  provider: 'email' | 'google';
  avatar?: string;
}

export function getCustomAdminGmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CUSTOM_ADMIN_GMAIL_KEY);
}

export function setCustomAdminGmail(email: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_ADMIN_GMAIL_KEY, email.trim().toLowerCase());
}

export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  
  // Check any custom admin Gmail stored
  const custom = getCustomAdminGmail();
  if (custom && custom === clean) {
    return true;
  }

  // Check default admin emails (including savyzeus101@gmail.com)
  if (DEFAULT_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === clean)) {
    return true;
  }

  // Check standard admin address prefixes/domains
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
    // Recalculate isAdmin in case rules updated
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
