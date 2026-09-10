// Meta Pixel event helper — safe no-op when the pixel is blocked/not loaded.
// Never pass personal data (no email/phone/name) in event params.

export const PIXEL_ID = '1140087122521999';

export function trackPixelEvent(event, params) {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      if (params === undefined) window.fbq('track', event);
      else window.fbq('track', event, params);
    }
  } catch {
    // Pixel must never break the shop experience.
  }
}
