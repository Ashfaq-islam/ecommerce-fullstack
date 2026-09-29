/**
 * HTTP client and the single mock/DCMS switch for the whole app.
 *
 * Services never import mock data and never call `fetch`. They call `request()`,
 * which resolves through one of two transports based on `NEXT_PUBLIC_DATA_SOURCE`:
 *
 *   NEXT_PUBLIC_DATA_SOURCE=mock   (default)  in-process handlers over data/mock*.js
 *   NEXT_PUBLIC_DATA_SOURCE=dcms               real HTTP to NEXT_PUBLIC_DCMS_API_URL
 *
 * Every response is normalised to the same shapes, and every failure is thrown as
 * an `ApiError` carrying at least `{ message, status }`, so `ErrorState` and the
 * form error branches can render something useful without knowing the source.
 *
 * ---------------------------------------------------------------------------
 * DCMS ENDPOINT CONTRACT
 *
 * Paths below are the ones the app calls today. They are the agreed shape for
 * Part 4, where each real path is confirmed. `request(path, ...)` forwards the
 * same `path`, `method` and `query` to the DCMS, so only the strings in
 * `resolveDcmsPath` need to change once the real routes are known — no service
 * or component edits.
 *
 *   path                    method  query / body                        resolves to
 *   ----------------------  ------  ---------------------------------  ---------------------------
 *   /products               GET     category, brand, badge, size,      Product[]
 *                                    color, minPrice, maxPrice,
 *                                    limit, featured
 *   /products/facets        GET     —                                  Facets
 *   /products/:slug         GET     — (slug in path)                   Product | null
 *   /categories             GET     limit                              Category[]
 *   /meta/districts         GET     —                                  string[]
 *   /meta/colors            GET     —                                  ColorSwatch[]
 *   /auth/register          POST    { name, email, phone, password }   { token, user }
 *   /auth/login             POST    { email, password }                { token, user }
 *   /auth/me                GET     — (bearer token)                  { user }
 *   /orders                 POST    { items, shippingAddress,          Order
 *                                         paymentMethod }
 *   /orders/mine            GET     — (bearer token)                  { orders: Order[] }
 *
 * Auth: an explicit `token` argument always wins, because it identifies the
 * signed-in shopper. Otherwise the static `NEXT_PUBLIC_DCMS_API_KEY` is sent, so
 * public catalogue reads still authenticate against a private DCMS.
 *
 * Note: `NEXT_PUBLIC_*` values are inlined at build time, so flipping
 * `NEXT_PUBLIC_DATA_SOURCE` requires a rebuild, not just a restart.
 * ---------------------------------------------------------------------------
 */

import { MOCK_CATEGORIES } from '@/data/mockCategories'
import { COLOR_SWATCHES } from '@/data/mockColors'
import { MOCK_ORDERS, ORDER_STATUS_LABELS } from '@/data/mockOrders'
import { MOCK_PRODUCTS } from '@/data/mockProducts'
import { MOCK_USERS, toPublicUser } from '@/data/mockUsers'
import { DISTRICTS } from '@/data/districts'
import { createToken, decodeToken } from '@/lib/token'

export const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE ?? 'mock'
export const DCMS_API_URL = process.env.NEXT_PUBLIC_DCMS_API_URL ?? ''
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api'

const DCMS_API_KEY = process.env.NEXT_PUBLIC_DCMS_API_KEY ?? ''

const isDcms = DATA_SOURCE === 'dcms'

const CATALOGUE_LATENCY_MS = 300
const AUTH_LATENCY_MS = 650
const ORDER_LATENCY_MS = 900

const LOCAL_USERS_KEY = 'shopstore-mock-users'
const LOCAL_ORDERS_KEY = 'shopstore-mock-orders'

// --- errors -----------------------------------------------------------------

/**
 * Normalised transport error. `message` is always human-readable and `status` is
 * always a number, so callers never have to guard before rendering.
 */
export class ApiError extends Error {
  constructor(message, { status = 500, code = 'unknown_error' } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = Number.isFinite(status) ? status : 500
    this.code = code
  }
}

const GENERIC_MESSAGE = 'We could not reach the store. Please try again in a moment.'

/**
 * Coerces anything thrown anywhere in either transport into an `ApiError` with a
 * usable `{ message, status }`. Network failures, `AbortError`s, string throws
 * and plain `Error`s all collapse to the same shape.
 */
export function normalizeError(error, fallbackMessage = GENERIC_MESSAGE) {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return new ApiError('The request was cancelled.', {
        status: 0,
        code: 'aborted',
      })
    }

    // A bare `fetch` TypeError is almost always DNS/CORS/offline.
    const isNetworkFailure = error instanceof TypeError
    return new ApiError(isNetworkFailure ? fallbackMessage : error.message, {
      status: isNetworkFailure ? 503 : 500,
      code: isNetworkFailure ? 'network_error' : 'unknown_error',
    })
  }

  return new ApiError(fallbackMessage, { status: 500, code: 'unknown_error' })
}

// --- shared query helpers ---------------------------------------------------

function toSelection(value) {
  if (value == null) {
    return []
  }

  const raw = Array.isArray(value) ? value : [value]
  return [...new Set(raw.filter((entry) => typeof entry === 'string' && entry))]
}

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function matchesSelection(values, selection) {
  const owned = Array.isArray(values) ? values : []
  return selection.some((entry) => owned.includes(entry))
}

/** Serialises arrays as repeated keys, matching how a real API receives filters. */
function toSearchParams(query) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value == null || value === '') {
      continue
    }

    for (const entry of Array.isArray(value) ? value : [value]) {
      if (entry != null && entry !== '') {
        params.append(key, String(entry))
      }
    }
  }

  return params
}

// --- mock transport ---------------------------------------------------------

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function readStore(key, seed) {
  if (typeof window === 'undefined') {
    return seed
  }

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return seed
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : seed
  } catch {
    return seed
  }
}

function writeStore(key, value) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // A blocked or full storage should not break the mock API.
  }
}

/** Seed users plus anyone registered in this browser, newest last. */
function getUsers() {
  return readStore(LOCAL_USERS_KEY, MOCK_USERS)
}

function getOrders() {
  return readStore(LOCAL_ORDERS_KEY, MOCK_ORDERS)
}

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function requireString(body, field) {
  const value = body?.[field]
  return typeof value === 'string' ? value.trim() : ''
}

function requireSession(token) {
  const payload = decodeToken(token)

  if (!payload) {
    throw new ApiError('Your session has expired. Please sign in again.', {
      status: 401,
      code: 'token_invalid',
    })
  }

  return payload
}

function applyProductFilters(products, filters) {
  const { category, brand, badge, size, color, minPrice, maxPrice, limit } = filters

  const categorySelection = toSelection(category)
  const brandSelection = toSelection(brand)
  const badgeSelection = toSelection(badge)
  const sizeSelection = toSelection(size)
  const colorSelection = toSelection(color)

  let result = products

  if (categorySelection.length > 0) {
    result = result.filter((product) => categorySelection.includes(product.category))
  }

  if (brandSelection.length > 0) {
    result = result.filter((product) => brandSelection.includes(product.brand))
  }

  if (badgeSelection.length > 0) {
    result = result.filter((product) => badgeSelection.includes(product.badge))
  }

  if (sizeSelection.length > 0) {
    result = result.filter((product) => matchesSelection(product.sizes, sizeSelection))
  }

  if (colorSelection.length > 0) {
    result = result.filter((product) => matchesSelection(product.colors, colorSelection))
  }

  const floor = toNumber(minPrice)
  if (floor !== null) {
    result = result.filter((product) => product.price >= floor)
  }

  const ceiling = toNumber(maxPrice)
  if (ceiling !== null) {
    result = result.filter((product) => product.price <= ceiling)
  }

  const max = toNumber(limit)
  if (max !== null && max >= 0) {
    result = result.slice(0, max)
  }

  return result
}

function selectFeatured(products, limit) {
  const badged = products.filter((product) => Boolean(product.badge))
  const source = badged.length > 0 ? badged : products
  const inStock = source.filter((product) =>
    product.variants.some((variant) => variant.stock > 0),
  )

  const bounded = (list) => {
    const max = toNumber(limit)
    return max !== null && max >= 0 ? list.slice(0, max) : list
  }

  const featured = bounded(inStock)
  return featured.length > 0 ? featured : bounded(source)
}

function buildFacets(products) {
  const collect = (key) => {
    const seen = new Set()

    for (const product of products) {
      for (const value of product[key] ?? []) {
        seen.add(value)
      }
    }

    // First-seen order keeps the merchandising order chosen in the data file
    // instead of imposing an alphabetical sort on sizes and colours.
    return [...seen]
  }

  const prices = products.map((product) => product.price).filter(Number.isFinite)

  return {
    sizes: collect('sizes'),
    colors: collect('colors'),
    // `brand` and `badge` are single strings per product, not arrays, so they are
    // collected separately. Passing them to `collect` would spread the string
    // into individual characters.
    brands: [...new Set(products.map((product) => product.brand).filter(Boolean))],
    badges: [...new Set(products.map((product) => product.badge).filter(Boolean))],
    // Slugs that actually appear on a product, so callers can intersect this
    // with the category list rather than offering filters that return nothing.
    productCategories: [...new Set(products.map((product) => product.category).filter(Boolean))],
    priceRange: {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    },
  }
}

// Test seam. Lets a harness observe what the mock handlers actually received,
// which is the only way to catch a handler reading the wrong argument. Not used
// by application code.
const mockObserver = { onCall: null }

export function __setMockObserver(fn) {
  mockObserver.onCall = typeof fn === 'function' ? fn : null
}

// --- mock handlers: one per route, mirroring what a real DCMS would do -------
//
// Each entry is `[handler, latencyMs]` and is called as
// `handler(query, { body, token, params })`, so a handler never has to guess which
// of its parameters carries the request body. Returning `{ status, body }` mirrors
// an HTTP response; `body` is what `request()` resolves to.

const routes = {
  'GET /products': [
    (query) => {
      if (query.featured) {
        return selectFeatured(MOCK_PRODUCTS, query.limit)
      }

      return applyProductFilters(MOCK_PRODUCTS, query)
    },
    CATALOGUE_LATENCY_MS,
  ],

  'GET /products/facets': [() => buildFacets(MOCK_PRODUCTS), CATALOGUE_LATENCY_MS],

  'GET /products/:slug': [
    (_query, { params }) => {
      // Slugs are stored lowercase, but product URLs are shareable and
      // hand-typed, so match case-insensitively rather than 404-ing.
      const target = String(params.slug ?? '').trim().toLowerCase()
      return MOCK_PRODUCTS.find((product) => product.slug.toLowerCase() === target) ?? null
    },
    CATALOGUE_LATENCY_MS,
  ],

  'GET /categories': [
    (query) => {
      const max = toNumber(query.limit)
      return max !== null && max >= 0 ? MOCK_CATEGORIES.slice(0, max) : [...MOCK_CATEGORIES]
    },
    CATALOGUE_LATENCY_MS,
  ],

  'GET /meta/districts': [() => DISTRICTS, CATALOGUE_LATENCY_MS],

  // Swatches are a name-to-hex map, not a list, so a shallow copy is returned to
  // keep callers from mutating the module-level object.
  'GET /meta/colors': [() => ({ ...COLOR_SWATCHES }), CATALOGUE_LATENCY_MS],

  'POST /auth/register': [
    (_query, { body }) => {
      const name = requireString(body, 'name')
      const email = normalizeEmail(body?.email)
      const phone = requireString(body, 'phone')
      const password = typeof body?.password === 'string' ? body.password : ''

      if (!name || !email || !phone || !password) {
        throw new ApiError('Name, email, phone and password are all required.', {
          status: 400,
          code: 'missing_fields',
        })
      }

      const users = getUsers()

      if (users.some((user) => normalizeEmail(user.email) === email)) {
        throw new ApiError('An account with that email already exists.', {
          status: 409,
          code: 'email_taken',
        })
      }

      const user = {
        id: `usr_${Date.now().toString(36)}`,
        name,
        email,
        phone,
        password,
        createdAt: new Date().toISOString(),
      }

      writeStore(LOCAL_USERS_KEY, [...users, user])

      return { status: 201, body: { token: createToken(user), user: toPublicUser(user) } }
    },
    AUTH_LATENCY_MS,
  ],

  'POST /auth/login': [
    (_query, { body }) => {
      const email = normalizeEmail(body?.email)
      const password = typeof body?.password === 'string' ? body.password : ''
      const user = getUsers().find((entry) => normalizeEmail(entry.email) === email)

      // One message for both cases so the form cannot be used to probe which
      // emails have accounts.
      if (!user || user.password !== password) {
        throw new ApiError('Incorrect email or password.', {
          status: 401,
          code: 'invalid_credentials',
        })
      }

      return { status: 200, body: { token: createToken(user), user: toPublicUser(user) } }
    },
    AUTH_LATENCY_MS,
  ],

  'GET /auth/demo': [
    () => {
      const seed = MOCK_USERS[0]

      return seed
        ? { status: 200, body: { demo: { email: seed.email, password: seed.password } } }
        : { status: 404, body: {} }
    },
    AUTH_LATENCY_MS,
  ],

  'GET /orders/status-labels': [
    () => ({ status: 200, body: { labels: { ...ORDER_STATUS_LABELS } } }),
    ORDER_LATENCY_MS,
  ],

  'GET /auth/me': [
    (_body, { token }) => {
      const payload = requireSession(token)
      const user = getUsers().find((entry) => entry.id === payload.sub)

      if (!user) {
        throw new ApiError('Your session has expired. Please sign in again.', {
          status: 401,
          code: 'token_invalid',
        })
      }

      return { status: 200, body: { user: toPublicUser(user) } }
    },
    AUTH_LATENCY_MS,
  ],

  'POST /orders': [
    (_query, { body, token }) => {
      const payload = requireSession(token)
      const items = Array.isArray(body?.items) ? body.items : []

      if (items.length === 0) {
        throw new ApiError('Your cart is empty. Add an item before placing an order.', {
          status: 400,
          code: 'cart_empty',
        })
      }

      const now = new Date()
      const stamp = [
        String(now.getFullYear()).slice(-2),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
      ].join('')
      const suffix = String(Math.floor(1000 + Math.random() * 9000))

      const order = {
        id: `ord_${now.getTime().toString(36)}`,
        orderNumber: `SHP-${stamp}-${suffix}`,
        userId: payload.sub,
        placedAt: now.toISOString(),
        status: 'processing',
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId ?? null,
          name: item.name,
          image: item.image,
          size: item.size ?? null,
          color: item.color ?? null,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: { ...(body?.shippingAddress ?? {}) },
        paymentMethod: body?.paymentMethod ?? 'cod',
        subtotal: body?.subtotal ?? 0,
        shipping: body?.shipping ?? 0,
        total: body?.total ?? 0,
        estimatedDelivery: body?.estimatedDelivery ?? null,
      }

      // Persisted so a placed order shows up in /orders/mine on the next visit.
      // This closes the gap where checkout confirmed an order that order history
      // had never heard of.
      writeStore(LOCAL_ORDERS_KEY, [order, ...getOrders()])

      return { status: 201, body: { order } }
    },
    ORDER_LATENCY_MS,
  ],

  'GET /orders/mine': [
    (_body, { token }) => {
      const payload = requireSession(token)

      const orders = getOrders()
        .filter((order) => order.userId === payload.sub)
        .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt))

      return { status: 200, body: { orders } }
    },
    ORDER_LATENCY_MS,
  ],
}

/** Exposed so the filter UI can render statuses without importing the data layer. */
export { ORDER_STATUS_LABELS }

function findRoute(method, path) {
  const exact = routes[`${method} ${path}`]
  if (exact) {
    return { handler: exact[0], latencyMs: exact[1], params: {} }
  }

  for (const [key, entry] of Object.entries(routes)) {
    const [routeMethod, routePath] = key.split(' ')
    if (routeMethod !== method || !routePath.includes(':')) {
      continue
    }

    const routeParts = routePath.split('/')
    const pathParts = path.split('/')
    if (routeParts.length !== pathParts.length) {
      continue
    }

    const params = {}
    let matched = true

    for (let index = 0; index < routeParts.length; index += 1) {
      if (routeParts[index].startsWith(':')) {
        params[routeParts[index].slice(1)] = decodeURIComponent(pathParts[index])
      } else if (routeParts[index] !== pathParts[index]) {
        matched = false
        break
      }
    }

    if (matched) {
      return { handler: entry[0], latencyMs: entry[1], params }
    }
  }

  return null
}

async function mockRequest(path, { method, body, token, query }) {
  const match = findRoute(method, path)

  if (!match) {
    throw new ApiError(`No mock route for ${method} ${path}.`, {
      status: 404,
      code: 'route_not_found',
    })
  }

  await delay(match.latencyMs)

  mockObserver.onCall?.({
    method,
    path,
    query,
    body,
    hasToken: Boolean(token),
    params: match.params,
  })

  const result = await match.handler(query, { body, token, params: match.params })

  // Handlers that return a bare array/object are the simple "resolve the payload"
  // case; the rest mirror an HTTP status alongside the body.
  if (result && typeof result === 'object' && !Array.isArray(result) && 'body' in result) {
    return result.body
  }

  return result
}

// --- DCMS transport ---------------------------------------------------------

/**
 * Resolves the DCMS path for a logical route. The identity mapping below is
 * intentional: it documents the current contract and makes Part 4 a single-file
 * edit of this map rather than a hunt through every service.
 */
function resolveDcmsPath(path) {
  return path
}

function buildDcmsUrl(path, query) {
  const base = DCMS_API_URL.replace(/\/+$/, '')

  if (!base) {
    throw new ApiError(
      'NEXT_PUBLIC_DCMS_API_URL is not set, so the DCMS data source cannot be used.',
      { status: 500, code: 'missing_config' },
    )
  }

  const search = toSearchParams(query).toString()
  return `${base}${resolveDcmsPath(path)}${search ? `?${search}` : ''}`
}

function buildDcmsHeaders({ method, body, token }) {
  const headers = { Accept: 'application/json' }

  if (body != null) {
    headers['Content-Type'] = 'application/json'
  }

  // An explicit token identifies the shopper and must win; the static key is the
  // fallback for public catalogue reads against a private DCMS.
  const bearer = token || DCMS_API_KEY
  if (bearer) {
    headers.Authorization = `Bearer ${bearer}`
  }

  if (method === 'GET' || method === 'HEAD') {
    delete headers['Content-Type']
  }

  return headers
}

async function extractMessage(response) {
  try {
    const text = await response.text()
    if (!text) {
      return null
    }

    const parsed = JSON.parse(text)
    return parsed?.message ?? parsed?.error?.message ?? parsed?.error ?? null
  } catch {
    return null
  }
}

async function dcmsRequest(path, { method, body, token, query, signal }) {
  const url = buildDcmsUrl(path, query)

  let response
  try {
    response = await fetch(url, {
      method,
      headers: buildDcmsHeaders({ method, body, token }),
      body: body == null ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    // Network failure, DNS miss, CORS rejection, or an aborted request.
    throw normalizeError(error)
  }

  if (!response.ok) {
    const message = await extractMessage(response)
    throw new ApiError(
      message || `The store returned an error (${response.status}). Please try again.`,
      { status: response.status, code: 'dcms_error' },
    )
  }

  if (response.status === 204) {
    return null
  }

  try {
    return await response.json()
  } catch (error) {
    throw normalizeError(error, 'The store sent a response we could not read.')
  }
}

// --- public entry point -----------------------------------------------------

/**
 * Performs a logical request through whichever transport is configured.
 *
 * Resolves the response body. Throws an `ApiError` with `{ message, status }` for
 * every failure mode in both transports, so callers never see a raw `Error`,
 * a `TypeError` from `fetch`, or an unhandled rejection.
 */
export async function request(path, { method = 'GET', body = null, token = null, query = null, signal = null } = {}) {
  const upperMethod = method.toUpperCase()

  if (isDcms) {
    return dcmsRequest(path, {
      method: upperMethod,
      body,
      token,
      query,
      signal,
    })
  }

  return mockRequest(path, {
    method: upperMethod,
    body,
    token,
    query: query ?? {},
  })
}
