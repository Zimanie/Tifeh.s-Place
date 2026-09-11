/**
 * Formats a number to Nigerian Naira (NGN - ₦) with comma grouping.
 * Example: 78500 -> ₦78,500
 */
export function formatNaira(amount: number): string {
  if (isNaN(amount)) return '₦0';
  return '₦' + Math.round(amount).toLocaleString('en-NG');
}

/**
 * Formats a date string to a human-readable luxury store receipt style
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}
