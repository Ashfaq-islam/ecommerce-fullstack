const numberFormatter = new Intl.NumberFormat('en-BD', {
  maximumFractionDigits: 0,
})

const CURRENCY_SYMBOL = '৳'

export function formatPrice(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return ''
  }

  return `${CURRENCY_SYMBOL}${numberFormatter.format(value)}`
}

export function getDiscountPercent(price, compareAtPrice) {
  if (
    typeof price !== 'number' ||
    typeof compareAtPrice !== 'number' ||
    compareAtPrice <= price
  ) {
    return null
  }

  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}
