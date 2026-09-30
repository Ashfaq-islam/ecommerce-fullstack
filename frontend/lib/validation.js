/** Bangladeshi mobile numbers are 11 digits starting with 01. */
export const PHONE_PATTERN = /^01\d{9}$/

export const PHONE_PLACEHOLDER = '01XXXXXXXXX'

// Deliberately permissive: one @, no spaces, a dotted domain with a 2+ char TLD.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[a-z]{2,}$/i

export const MIN_PASSWORD_LENGTH = 8

function toTrimmed(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function isValidPhone(value) {
  return PHONE_PATTERN.test(toTrimmed(value).replace(/[\s-]/g, ''))
}

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(toTrimmed(value))
}

/**
 * Resolves a `?next=` value to a same-origin path, or returns `fallback`.
 *
 * Naively checking `startsWith('/') && !startsWith('//')` is not enough, because
 * a URL parser treats a backslash as a path separator: `/\evil.com` is a
 * protocol-relative URL that would send the user off-site, yet it passes both
 * checks. ASCII control characters are discarded by the parser too, so a value
 * like `/<tab>/evil.com` collapses to `//evil.com`. Both are normalised away
 * before the check, leaving only genuine single-slash relative paths.
 */
export function getSafeRedirectPath(next, fallback = '/account') {
  if (typeof next !== 'string' || next.length === 0) {
    return fallback
  }

  const normalized = next
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/\\/g, '/')

  if (!normalized.startsWith('/') || normalized.startsWith('//')) {
    return fallback
  }

  return normalized
}

/**
 * Strength signal for the register form. Returns a score from 0 to 4 plus a
 * short label, so the UI can render a meter without owning the rules.
 */
export function getPasswordStrength(value) {
  const password = typeof value === 'string' ? value : ''
  let score = 0

  if (password.length >= MIN_PASSWORD_LENGTH) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password) && /[^\w\s]/.test(password)) score += 1

  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']

  return { score, label: labels[score] }
}
