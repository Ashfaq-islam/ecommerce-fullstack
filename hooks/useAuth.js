'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

import * as authService from '@/services/authService'

/**
 * Auth state is shared through a module-level store rather than a provider so
 * any component can read the session without the tree being wrapped. The
 * snapshot is a stable object between updates, which is what
 * `useSyncExternalStore` needs to avoid re-render loops.
 */
const INITIAL_STATE = { status: 'loading', user: null }

let state = INITIAL_STATE
const listeners = new Set()

function emit(patch) {
  state = { ...state, ...patch }

  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => state
const getServerSnapshot = () => INITIAL_STATE

let sessionRequest = null

/**
 * Restores the session from the persisted token exactly once, however many
 * components mount. The in-flight promise is cached so a page with a header, a
 * form and a panel does not fire three `GET /auth/me` calls.
 */
function restoreSession() {
  if (!sessionRequest) {
    sessionRequest = authService
      .getCurrentUser()
      .catch(() => null)
      .then((user) => {
        emit({ status: user ? 'authenticated' : 'unauthenticated', user })
        return user
      })
  }

  return sessionRequest
}

function toMessage(error, fallback) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export function useAuth() {
  const { status, user } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    restoreSession()
  }, [])

  const login = useCallback(async (email, password) => {
    emit({ status: 'loading', user: null })

    try {
      const { token, user: nextUser } = await authService.login(email, password)
      authService.writeToken(token)
      emit({ status: 'authenticated', user: nextUser })
      return nextUser
    } catch (error) {
      emit({ status: 'unauthenticated', user: null })
      throw new Error(toMessage(error, 'We could not sign you in. Please try again.'))
    }
  }, [])

  const register = useCallback(async (userData) => {
    emit({ status: 'loading', user: null })

    try {
      const { token, user: nextUser } = await authService.register(userData)
      authService.writeToken(token)
      emit({ status: 'authenticated', user: nextUser })
      return nextUser
    } catch (error) {
      emit({ status: 'unauthenticated', user: null })
      throw new Error(toMessage(error, 'We could not create your account. Please try again.'))
    }
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    sessionRequest = null
    emit({ status: 'unauthenticated', user: null })
  }, [])

  const refreshSession = useCallback(() => restoreSession(), [])

  return {
    user,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated' && Boolean(user),
    login,
    register,
    logout,
    refreshSession,
  }
}
