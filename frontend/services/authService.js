import { ApiError, request } from '@/lib/apiClient'
import { decodeToken } from '@/lib/token'

export const TOKEN_STORAGE_KEY = 'shopstore-auth-token'

// The seed demo account, resolved through the same transport as everything else
// so it works in both data-source modes and never reaches into the data layer.
// These are not real credentials; a live API would expose a demo account
// differently. Falls back to empty strings rather than rejecting, because the
// login page only renders it as an optional convenience hint.
let demoCredentials = { email: '', password: '' }
let demoCredentialsLoaded = false

/** Seed credentials for the mock backend, exposed for the login form's hint. */
export async function getDemoCredentials() {
  if (!demoCredentialsLoaded) {
    demoCredentialsLoaded = true
    try {
      const { demo } = await request('/auth/demo')
      if (demo) {
        demoCredentials = demo
      }
    } catch {
      // No demo account available; the form simply omits the hint.
    }
  }

  return demoCredentials
}

function toErrorMessage(error, fallback) {
  if (error instanceof ApiError && error.message) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

/** Reads the persisted token, or `null` when storage is unavailable. */
export function getStoredToken() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

function writeToken(token) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } catch {
    // A blocked storage leaves the user signed in for this tab only.
  }
}

function clearStoredToken() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // Nothing else to do.
  }
}

/**
 * Auth service. Every function keeps the signature and resolved shape a real
 * DCMS auth API would use, so the hooks and pages do not change when the mock
 * transport is swapped for `fetch`.
 *
 * Note on the token: `login` and `register` return it but do NOT write it to
 * storage. Persisting the session is `useAuth`'s job (it owns that state), so
 * a token only lands in `TOKEN_STORAGE_KEY` once the hook handles the result.
 * Calling these directly therefore leaves you signed out until you call
 * `writeToken(result.token)` yourself.
 */

/** Resolves `{ token, user }`. Rejects with a 401 `ApiError` on bad credentials. */
export async function login(email, password) {
  try {
    return await request('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
  } catch (error) {
    throw new ApiError(toErrorMessage(error, 'We could not sign you in. Please try again.'), {
      status: error instanceof ApiError ? error.status : 500,
      code: error instanceof ApiError ? error.code : 'login_failed',
    })
  }
}

/** Resolves `{ token, user }` and signs the new account straight in. */
export async function register(userData) {
  try {
    return await request('/auth/register', {
      method: 'POST',
      body: {
        name: userData?.name,
        email: userData?.email,
        phone: userData?.phone,
        password: userData?.password,
      },
    })
  } catch (error) {
    throw new ApiError(
      toErrorMessage(error, 'We could not create your account. Please try again.'),
      {
        status: error instanceof ApiError ? error.status : 500,
        code: error instanceof ApiError ? error.code : 'register_failed',
      },
    )
  }
}

/** Creates a signup request (self-registration disabled in DCMS). */
export async function createSignupRequest({ name, email, phone, address }) {
  try {
    return await request('/signup_requests', {
      method: 'POST',
      body: {
        name,
        email,
        phone,
        address: address ?? undefined,
        status: 'pending',
      },
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      throw new ApiError('This email has already requested an account.', {
        status: 409,
        code: 'signup_request_conflict',
      })
    }

    // Everything that is not a duplicate email gets the same message: the raw
    // DCMS text is aimed at developers, not shoppers.
    throw new ApiError('We could not process your request. Please try again.', {
      status: error instanceof ApiError ? error.status : 500,
      code: 'signup_request_failed',
    })
  }
}

/**
 * Resolves the signed-in user, or `null` when there is no usable session.
 * An expired or unparseable token is cleared on the way out.
 */
export async function getCurrentUser() {
  const token = getStoredToken()

  if (!token || !decodeToken(token)) {
    clearStoredToken()
    return null
  }

  try {
    const { user } = await request('/auth/me', { method: 'GET', token })
    return user
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearStoredToken()
      return null
    }

    throw error
  }
}

/** Resolves `true` once the token is gone. */
export async function logout() {
  clearStoredToken()
  return true
}

export { writeToken }
