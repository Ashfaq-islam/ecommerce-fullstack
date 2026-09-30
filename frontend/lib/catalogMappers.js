/**
 * Normalisation between the two catalogue shapes.
 *
 * The app renders one product shape. The two data sources do not agree on it:
 *
 *   mock  - authored to match the UI directly (`name`, numeric `price`, embedded
 *           `variants`, `image`, brand/category as display strings)
 *   DCMS  - a schema-driven record (`title`, `price` as a fixed-scale string,
 *           relations as UUIDs or expanded objects, `images`, `stock_status`,
 *           and sizes/colours/variants living in *other* collections)
 *
 * Every function here is pure and tolerant of both shapes: each field falls back
 * to whichever spelling exists, so the same mapper runs over mock and DCMS
 * records without branching on the data source. Services call these
 * unconditionally, which keeps the data-source switch confined to
 * `lib/apiClient`.
 *
 * Missing values degrade to `null`/empty rather than being invented, so a
 * record missing an image renders the placeholder instead of a broken <Image>.
 */

const PLACEHOLDER_IMAGE = '/images/products/placeholder.svg'

/** DCMS decimal fields arrive as fixed-scale strings (`"25.50"`). */
export function toFiniteNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function firstNonEmptyString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim()
    }
  }

  return null
}

/**
 * A relation is either an expanded object (from `?expand=`), a bare UUID, or —
 * in the mock — already the display string. Returns whatever `pick` selects
 * from an object, or the string itself when there is nothing to expand.
 */
function readRelation(value, pick) {
  if (value && typeof value === 'object') {
    return firstNonEmptyString(pick(value))
  }

  return firstNonEmptyString(value)
}

/** `images` is free-form JSON: a URL string, or an array of URLs/objects. */
function readImage(value) {
  const candidate = Array.isArray(value) ? value[0] : value

  if (typeof candidate === 'string' && candidate.trim() !== '') {
    return candidate.trim()
  }

  if (candidate && typeof candidate === 'object') {
    return firstNonEmptyString(candidate.url, candidate.src, candidate.path)
  }

  return null
}

const STOCK_BY_STATUS = {
  in_stock: 10,
  backorder: 5,
  out_of_stock: 0,
}

/**
 * Maps one catalogue record to the app's product shape.
 *
 * `compareAtPrice` is the pre-discount price and `price` is what the shopper
 * pays — the inverse of how a DCMS `sale_price` reads. A DCMS record on sale
 * therefore resolves to `price = sale_price`, `compareAtPrice = price`, which is
 * what makes `getDiscountPercent` in `lib/format` come out right. With no
 * `sale_price` both the compare-at price and the badge stay null.
 */
export function normalizeProduct(raw) {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const basePrice = toFiniteNumber(raw.price)
  const salePrice = toFiniteNumber(raw.sale_price ?? raw.salePrice)
  // A DCMS record on sale reads `price` as the pre-discount figure and
  // `sale_price` as the discounted one — the inverse of what `compareAtPrice`
  // means to this UI, where the shopper pays `price` and the struck-through
  // figure is the original. So a sale resolves to `price = sale_price` and
  // `compareAtPrice = price`. The mock carries `compareAtPrice` directly and has
  // no `sale_price` at all, so that is honoured as-is instead of being discarded.
  const onSale = salePrice !== null && (basePrice === null || salePrice < basePrice)
  const explicitCompareAt = toFiniteNumber(raw.compareAtPrice)

  const price = onSale ? salePrice : basePrice
  const compareAtPrice = onSale
    ? basePrice
    : basePrice !== null && explicitCompareAt !== null && explicitCompareAt > basePrice
      ? explicitCompareAt
      : null

  const variants = Array.isArray(raw.variants) ? raw.variants : []

  return {
    id: firstNonEmptyString(raw.id) ?? '',
    slug: firstNonEmptyString(raw.slug) ?? '',
    name: firstNonEmptyString(raw.title, raw.name) ?? '',
    description: firstNonEmptyString(raw.description) ?? '',
    brand: readRelation(raw.brand, (entry) => entry.name) ?? '',
    category: readRelation(raw.category, (entry) => entry.slug) ?? '',
    price,
    compareAtPrice,
    badge: onSale ? 'Sale' : firstNonEmptyString(raw.badge),
    image: readImage(raw.images ?? raw.image) ?? PLACEHOLDER_IMAGE,
    imageHover: readImage(raw.imageHover) ?? null,
    sizes: Array.isArray(raw.sizes) && raw.sizes.length > 0
      ? raw.sizes
      : [...new Set(variants.map((variant) => variant?.size).filter(Boolean))],
    colors: Array.isArray(raw.colors) && raw.colors.length > 0
      ? raw.colors
      : [...new Set(variants.map((variant) => variant?.color).filter(Boolean))],
    variants: variants.map(normalizeVariant).filter(Boolean),
    stock: toFiniteNumber(raw.stock) ?? STOCK_BY_STATUS[raw.stock_status] ?? 0,
    rating: toFiniteNumber(raw.average_rating ?? raw.rating) ?? 0,
    reviewCount: toFiniteNumber(raw.review_count ?? raw.reviewCount) ?? 0,
    featured: Boolean(raw.featured),
    status: firstNonEmptyString(raw.status) ?? 'active',
  }
}

export function normalizeVariant(raw) {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  return {
    id: firstNonEmptyString(raw.id) ?? '',
    size: firstNonEmptyString(raw.size),
    color: firstNonEmptyString(raw.color),
    sku: firstNonEmptyString(raw.sku),
    price: toFiniteNumber(raw.price),
    stock: toFiniteNumber(raw.stock) ?? 0,
  }
}

export function normalizeCategory(raw) {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  return {
    id: firstNonEmptyString(raw.id) ?? '',
    slug: firstNonEmptyString(raw.slug) ?? '',
    name: firstNonEmptyString(raw.name, raw.title) ?? '',
    // Not present on the DCMS schema, but the mock carries it and the shape is
    // shared, so it is preserved when supplied and null otherwise.
    description: firstNonEmptyString(raw.description) ?? '',
    image: readImage(raw.image) ?? null,
    sortOrder: toFiniteNumber(raw.sort_order ?? raw.sortOrder) ?? 0,
  }
}

export function normalizeReview(raw) {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  return {
    id: firstNonEmptyString(raw.id) ?? '',
    productId: firstNonEmptyString(raw.product_id ?? raw.productId) ?? '',
    userName: firstNonEmptyString(raw.user_name ?? raw.userName) ?? 'Anonymous',
    rating: toFiniteNumber(raw.rating) ?? 0,
    title: firstNonEmptyString(raw.title) ?? '',
    body: firstNonEmptyString(raw.body) ?? '',
    createdAt: firstNonEmptyString(raw.created_at ?? raw.createdAt) ?? '',
    verifiedPurchase: Boolean(raw.verified_purchase ?? raw.verifiedPurchase),
  }
}

/**
 * Groups variant records by their parent product so `normalizeProduct` can
 * attach them. DCMS keeps variants in their own collection keyed by a product
 * relation; the mock embeds them on the product and never reaches this.
 */
export function groupVariantsByProduct(variantRecords) {
  const grouped = new Map()

  for (const variant of variantRecords ?? []) {
    if (!variant || typeof variant !== 'object') {
      continue
    }

    const productId = firstNonEmptyString(variant.product_id ?? variant.product)
    if (!productId) {
      continue
    }

    const bucket = grouped.get(productId) ?? []
    bucket.push(variant)
    grouped.set(productId, bucket)
  }

  return grouped
}

/**
 * Normalises products and attaches any grouped variants. Variants already
 * embedded on the record win, so a mock product passes through untouched.
 */
export function normalizeProducts(records, variantsByProduct = new Map()) {
  return (records ?? [])
    .map((raw) => {
      const product = normalizeProduct(raw)
      if (!product) {
        return null
      }

      if (product.variants.length === 0 && variantsByProduct.has(product.id)) {
        const attached = variantsByProduct.get(product.id).map(normalizeVariant).filter(Boolean)
        product.variants = attached
        product.sizes = [...new Set(attached.map((variant) => variant.size).filter(Boolean))]
        product.colors = [...new Set(attached.map((variant) => variant.color).filter(Boolean))]
      }

      return product
    })
    .filter(Boolean)
}

/**
 * Derives the filter options from a product list so the sidebar never
 * hardcodes facet lists. Shared by the mock `/products/facets` route and the
 * DCMS path, which has no facets endpoint and derives them from the catalogue.
 */
export function buildFacets(products) {
  const collect = (key) => {
    const seen = new Set()

    for (const product of products) {
      for (const value of product[key] ?? []) {
        seen.add(value)
      }
    }

    // First-seen order keeps the merchandising order chosen upstream instead
    // of imposing an alphabetical sort on sizes and colours.
    return [...seen]
  }

  const prices = products
    .map((product) => product.price)
    .filter((price) => typeof price === 'number' && Number.isFinite(price))

  return {
    sizes: collect('sizes'),
    colors: collect('colors'),
    // `brand` and `badge` are single strings per product, not arrays, so they
    // are collected separately. Passing them to `collect` would spread the
    // string into individual characters.
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

/**
 * Client-side filter application, used only for the DCMS source.
 *
 * DCMS filters through `filter[field]=value`, which covers `featured` and a
 * price range but not the display-string filters this app exposes (brand name,
 * category slug, badge, size, colour) — those fields either do not exist on the
 * product or are keyed by UUID rather than by the value in the URL. Rather than
 * let those silently return the unfiltered catalogue, they are applied here so
 * `/shop` behaves identically in both data sources.
 */
export function applyClientFilters(products, filters = {}) {
  const toSelection = (value) => {
    if (value == null) {
      return []
    }

    const raw = Array.isArray(value) ? value : [value]
    return [...new Set(raw.filter((entry) => typeof entry === 'string' && entry))]
  }

  const matches = (owned, selection) =>
    selection.some((entry) => (Array.isArray(owned) ? owned : [owned]).includes(entry))

  const category = toSelection(filters.category)
  const brand = toSelection(filters.brand)
  const badge = toSelection(filters.badge)
  const size = toSelection(filters.size)
  const color = toSelection(filters.color)

  let result = products

  if (category.length > 0) {
    result = result.filter((product) => category.includes(product.category))
  }

  if (brand.length > 0) {
    result = result.filter((product) => brand.includes(product.brand))
  }

  if (badge.length > 0) {
    result = result.filter((product) => badge.includes(product.badge))
  }

  if (size.length > 0) {
    result = result.filter((product) => matches(product.sizes, size))
  }

  if (color.length > 0) {
    result = result.filter((product) => matches(product.colors, color))
  }

  const floor = toFiniteNumber(filters.minPrice)
  if (floor !== null) {
    result = result.filter((product) => typeof product.price === 'number' && product.price >= floor)
  }

  const ceiling = toFiniteNumber(filters.maxPrice)
  if (ceiling !== null) {
    result = result.filter((product) => typeof product.price === 'number' && product.price <= ceiling)
  }

  const max = toFiniteNumber(filters.limit)
  if (max !== null && max >= 0) {
    result = result.slice(0, max)
  }

  return result
}