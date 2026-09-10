// Indian phone / WhatsApp utilities (backend mirror of src/utils/phone.js).
// Storage format: +919876543210. Display format (+91 98765 43210) is frontend-only.

const digitsOnly = (v) => String(v ?? '').replace(/\D/g, '');

function extractTenDigits(input) {
  let d = digitsOnly(input);
  if (!d) return '';
  if (d.length === 12 && d.startsWith('91')) return d.slice(2);
  if (d.length === 11 && d.startsWith('0')) return d.slice(1);
  return d;
}

function isValidIndianMobile(input) {
  const ten = extractTenDigits(input);
  return /^[6-9]\d{9}$/.test(ten);
}

function normalizeIndianPhone(input) {
  const ten = extractTenDigits(input);
  if (!/^[6-9]\d{9}$/.test(ten)) return null;
  return `+91${ten}`;
}

function isValidPincode(input) {
  return /^[1-9]\d{5}$/.test(String(input ?? '').trim());
}

module.exports = { extractTenDigits, isValidIndianMobile, normalizeIndianPhone, isValidPincode };
