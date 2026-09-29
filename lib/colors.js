import { request } from '@/lib/apiClient'

/**
 * Colour swatch read for the product detail page.
 *
 * Returns a name-to-hex map (`{ Teal: '#0f766e', ... }`), not a list. Resolves to
 * an empty object rather than rejecting, so a failed swatch lookup cannot take
 * the whole product page down; `ProductDetail` falls back to no swatches.
 *
 * Asynchronous because it travels through the same apiClient transport as the
 * rest of the catalogue. The product page is a server component, so it awaits
 * this directly; no client component needs a synchronous variant.
 */
export async function getColorSwatches() {
  try {
    const swatches = await request('/meta/colors')
    return swatches && typeof swatches === 'object' && !Array.isArray(swatches) ? swatches : {}
  } catch {
    return {}
  }
}
