const WHATSAPP_STORAGE_KEY = 'tifehs_boutique_whatsapp_v1';

/**
 * Retrieves the active WhatsApp number for order dispatch & customer concierge.
 * Checks localStorage first (configured via Admin), then .env (VITE_WHATSAPP_NUMBER),
 * and defaults to Nigerian boutique line.
 */
export function getBoutiqueWhatsAppNumber(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(WHATSAPP_STORAGE_KEY);
    if (saved && saved.trim()) {
      return saved.trim().replace(/[^0-9]/g, '');
    }
  }
  const envNumber = (((import.meta as any).env?.VITE_WHATSAPP_NUMBER as string) || '').trim();
  if (envNumber) {
    return envNumber.replace(/[^0-9]/g, '');
  }
  return '2348120000000';
}

/**
 * Saves a new WhatsApp number from the Admin portal or Settings.
 */
export function setBoutiqueWhatsAppNumber(number: string): void {
  if (typeof window === 'undefined') return;
  const clean = number.replace(/[^0-9]/g, '');
  if (clean) {
    localStorage.setItem(WHATSAPP_STORAGE_KEY, clean);
  }
}

/**
 * Prettifies the WhatsApp number for display
 */
export function formatWhatsAppDisplay(number: string): string {
  const clean = number.replace(/[^0-9]/g, '');
  if (clean.startsWith('234') && clean.length >= 13) {
    return `+234 ${clean.slice(3, 6)} ${clean.slice(6, 9)} ${clean.slice(9)}`;
  }
  if (clean.startsWith('234')) {
    return `+234 (0) ${clean.slice(3)}`;
  }
  return `+${clean}`;
}
