export const FACET_PARAM_KEYS = ['category', 'brand', 'badge', 'size', 'color']
export const PRICE_PARAM_KEYS = ['minPrice', 'maxPrice']

const FILTER_PARAM_KEYS = [...FACET_PARAM_KEYS, ...PRICE_PARAM_KEYS]

function toValueList(value) {
  if (value == null) {
    return []
  }

  const raw = Array.isArray(value) ? value : [value]
  const seen = new Set()

  for (const entry of raw) {
    if (typeof entry !== 'string') {
      continue
    }

    const trimmed = entry.trim()
    if (trimmed) {
      seen.add(trimmed)
    }
  }

  return [...seen]
}

function toSearchParams(source) {
  if (source instanceof URLSearchParams) {
    return new URLSearchParams(source)
  }

  const params = new URLSearchParams()

  if (source && typeof source === 'object') {
    for (const [key, value] of Object.entries(source)) {
      for (const entry of toValueList(value)) {
        params.append(key, entry)
      }
    }
  }

  return params
}

function readParam(source, key) {
  if (source instanceof URLSearchParams) {
    return toValueList(source.getAll(key))
  }

  if (source && typeof source === 'object') {
    return toValueList(source[key])
  }

  return []
}

function parsePrice(value) {
  const raw = Array.isArray(value) ? value[0] : value

  if (raw == null || raw === '') {
    return null
  }

  const parsed = Number(raw)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }

  return Math.round(parsed)
}

/**
 * Normalises anything query-param shaped (a `URLSearchParams` instance on the
 * client, a plain object from `searchParams` on the server) into the filter
 * shape the products hook consumes.
 */
export function parseFilters(searchParams) {
  const filters = {}

  for (const key of FACET_PARAM_KEYS) {
    filters[key] = readParam(searchParams, key)
  }

  filters.minPrice = parsePrice(readParam(searchParams, 'minPrice'))
  filters.maxPrice = parsePrice(readParam(searchParams, 'maxPrice'))

  return filters
}

/**
 * Writes the filter shape back onto a query string, leaving unrelated params
 * such as `sort` untouched.
 */
export function serializeFilters(filters, base) {
  const params = toSearchParams(base)

  for (const key of FILTER_PARAM_KEYS) {
    params.delete(key)
  }

  for (const key of FACET_PARAM_KEYS) {
    for (const value of toValueList(filters?.[key])) {
      params.append(key, value)
    }
  }

  const minPrice = parsePrice(filters?.minPrice)
  const maxPrice = parsePrice(filters?.maxPrice)

  if (minPrice != null) {
    params.set('minPrice', String(minPrice))
  }

  if (maxPrice != null) {
    params.set('maxPrice', String(maxPrice))
  }

  return params
}

export function buildFilterQuery(filters, base) {
  return serializeFilters(filters, base).toString()
}

export function toggleFacetValue(values, value) {
  const current = toValueList(values)

  return current.includes(value)
    ? current.filter((entry) => entry !== value)
    : [...current, value]
}

export function getActiveFilterCount(filters) {
  const facetCount = FACET_PARAM_KEYS.reduce(
    (total, key) => total + toValueList(filters?.[key]).length,
    0,
  )
  const hasPrice = filters?.minPrice != null || filters?.maxPrice != null

  return facetCount + (hasPrice ? 1 : 0)
}
