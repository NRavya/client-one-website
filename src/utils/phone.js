// Indian phone / WhatsApp utilities — single source of truth for +91 handling.
// Storage format: +919876543210 (no spaces, single +91).
// Display format: +91 98765 43210 (+91 separate, space after every 5 digits of the 10-digit number).

export const COUNTRY_CODE = '+91';
export const GUEST_PHONE_KEY = 'eskraft-guest-phone';

const digitsOnly = (v) => String(v ?? '').replace(/\D/g, '');

// Extract the 10-digit Indian mobile from any common input:
// "9876543210", "+919876543210", "+91 98765 43210", "91 9876543210", "09876543210"
export function extractTenDigits(input) {
  let d = digitsOnly(input);
  if (!d) return '';
  // Strip leading 91 country code when the total is 12 digits starting with 91
  if (d.length === 12 && d.startsWith('91')) return d.slice(2);
  // Strip single leading 0 (e.g. 09876543210 -> 9876543210)
  if (d.length === 11 && d.startsWith('0')) return d.slice(1);
  return d;
}

export function isValidIndianMobile(input) {
  const ten = extractTenDigits(input);
  return /^[6-9]\d{9}$/.test(ten);
}

// Normalize to storage format "+919876543210". Returns null when invalid.
export function normalizeIndianPhone(input) {
  const ten = extractTenDigits(input);
  if (!/^[6-9]\d{9}$/.test(ten)) return null;
  return `+91${ten}`;
}

// "9876543210" -> "98765 43210" (visual grouping only)
export function formatTenGrouping(ten) {
  const t = extractTenDigits(ten);
  if (t.length !== 10) return t;
  return `${t.slice(0, 5)} ${t.slice(5)}`;
}

// Any stored/raw value -> "+91 98765 43210" for customer-facing UI.
// Returns "" when the value is not a valid Indian mobile.
export function formatIndianDisplay(input) {
  const ten = extractTenDigits(input);
  if (!/^[6-9]\d{9}$/.test(ten)) return '';
  return `+91 ${formatTenGrouping(ten)}`;
}

// Live-format the 10-digit box while typing: keep max 10 digits, group as 5+5.
export function formatPhoneInput(input) {
  const ten = extractTenDigits(input).slice(0, 10);
  if (ten.length <= 5) return ten;
  return `${ten.slice(0, 5)} ${ten.slice(5)}`;
}

// Guest phone (localStorage) helpers — normalized storage, "" when absent/invalid.
export function getGuestPhone() {
  try {
    const raw = localStorage.getItem(GUEST_PHONE_KEY);
    if (!raw) return '';
    const ten = extractTenDigits(raw);
    if (!/^[6-9]\d{9}$/.test(ten)) return '';
    return `+91${ten}`;
  } catch {
    return '';
  }
}

export function setGuestPhone(normalizedOrRaw) {
  const n = normalizeIndianPhone(normalizedOrRaw);
  if (!n) return false;
  try {
    localStorage.setItem(GUEST_PHONE_KEY, n);
    return true;
  } catch {
    return false;
  }
}

// Resolve the effective phone for cart gating:
// logged-in profile phone wins, otherwise guest phone. Returns normalized or "".
export function resolveEffectivePhone(profilePhone) {
  const fromProfile = normalizeIndianPhone(profilePhone);
  if (fromProfile) return fromProfile;
  return getGuestPhone();
}
