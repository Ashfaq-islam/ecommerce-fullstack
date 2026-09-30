import { getCategories } from '@/services/categoryService'
import { getAll } from '@/services/productService'

/**
 * Builds the header mega-menu columns.
 *
 * This exists because the menu used to be a hardcoded list of categories and
 * sub-category links pointing at `/categories/...` routes that were never
 * created, so every entry in it was a dead link. The columns are now derived
 * from the catalogue and every href is a real filtered `/shop` URL, which is
 * the one listing route the app actually has.
 *
 * Called from the root layout (a server component) and passed to the client
 * `Header`, since the menu itself cannot await during render.
 *
 * The result is memoised for the lifetime of the server process. The root layout
 * wraps every route, so without this the artificial service latency lands on the
 * time-to-first-byte of each dynamic request. When the real transport lands this
 * is the spot to swap in a cached/revalidated fetch.
 */
let cachedColumns = null

export async function getNavigationColumns() {
  if (cachedColumns === null) {
    cachedColumns = Promise.all([getCategories(), getAll({})])
      .then(([categories, products]) =>
        categories.map((category) => {
          const brands = [
            ...new Set(
              products
                .filter((product) => product.category === category.slug)
                .map((product) => product.brand)
                .filter(Boolean),
            ),
          ]

          return {
            id: category.slug,
            title: category.name,
            href: `/shop?category=${encodeURIComponent(category.slug)}`,
            links: [
              {
                id: `${category.slug}-all`,
                label: `All ${category.name}`,
                href: `/shop?category=${encodeURIComponent(category.slug)}`,
              },
              ...brands.map((brand) => ({
                id: `${category.slug}-${brand}`,
                label: brand,
                href: `/shop?category=${encodeURIComponent(category.slug)}&brand=${encodeURIComponent(brand)}`,
              })),
            ],
          }
        }),
      )
      .catch((error) => {
        // Never cache a failure, otherwise one transient error is permanent.
        cachedColumns = null
        throw error
      })
  }

  return cachedColumns
}
