/**
 * JWT-style token helpers for the mock auth backend.
 *
 * The token is a real three-segment `header.payload.signature` string so the
 * client code that reads it would be unchanged against a real DCMS auth API.
 * The signature is a non-cryptographic stand-in: it exists so the shape is
 * right, not to be verified. Client code must never trust a token it decodes
 * here for anything but a cache key or a subject hint.
 */

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

function base64UrlEncode(value) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))

  return new TextDecoder().decode(bytes)
}

export function createToken(user, { now = Date.now(), ttlMs = TOKEN_TTL_MS } = {}) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      iat: Math.floor(now / 1000),
      exp: Math.floor((now + ttlMs) / 1000),
    }),
  )

  return `${header}.${payload}.${base64UrlEncode(`${user.id}:${now}`)}`
}

/** Returns the decoded payload, or `null` for anything malformed or expired. */
export function decodeToken(token, { now = Date.now() } = {}) {
  if (typeof token !== 'string') {
    return null
  }

  const segments = token.split('.')
  if (segments.length !== 3) {
    return null
  }

  try {
    const payload = JSON.parse(base64UrlDecode(segments[1]))

    if (typeof payload !== 'object' || payload === null || typeof payload.exp !== 'number') {
      return null
    }

    if (payload.exp * 1000 <= now) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export function isTokenExpired(token, options) {
  return decodeToken(token, options) === null
}
