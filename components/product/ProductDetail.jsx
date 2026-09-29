'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

import { useCart } from '@/hooks/useCart'
import { formatPrice, getDiscountPercent } from '@/lib/format'

import ProductGallery from './ProductGallery'
import VariantSelector from './VariantSelector'
import styles from './ProductDetail.module.css'

const LOW_STOCK_THRESHOLD = 5
const ADDED_FEEDBACK_MS = 2500

function collectValues(variants, key) {
  const values = []

  for (const variant of variants) {
    const value = variant[key]
    if (value != null && !values.includes(value)) {
      values.push(value)
    }
  }

  return values
}

function describeStock(stock) {
  if (stock == null) {
    return { label: 'Select an option to check availability', tone: 'neutral' }
  }

  if (stock <= 0) {
    return { label: 'Out of stock', tone: 'danger' }
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return { label: `Only ${stock} left in stock`, tone: 'warning' }
  }

  return { label: 'In stock', tone: 'success' }
}

export default function ProductDetail({ product, swatches = {} }) {
  const variants = useMemo(() => product.variants ?? [], [product.variants])
  const hasSizeAxis = variants.some((variant) => variant.size != null)

  const { addItem } = useCart()

  const [selectedVariantId, setSelectedVariantId] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [validationMessage, setValidationMessage] = useState(null)
  const [isAdded, setIsAdded] = useState(false)
  const addedTimerRef = useRef(null)

  useEffect(
    () => () => {
      if (addedTimerRef.current) {
        clearTimeout(addedTimerRef.current)
      }
    },
    [],
  )

  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? null
  const selectedSize = selectedVariant?.size ?? null
  const selectedColor = selectedVariant?.color ?? null

  const images = useMemo(() => {
    const gallery = []

    if (selectedVariant?.image) {
      const qualifier = [selectedVariant.size, selectedVariant.color].filter(Boolean).join(', ')
      gallery.push({
        src: selectedVariant.image,
        alt: qualifier ? `${product.name}, ${qualifier}` : product.name,
      })
    }

    gallery.push({ src: product.image, alt: product.name })

    if (product.imageHover) {
      gallery.push({ src: product.imageHover, alt: `${product.name}, alternate view` })
    }

    return gallery
  }, [product, selectedVariant])

  const sizeOptions = useMemo(() => {
    if (!hasSizeAxis) {
      return []
    }

    return collectValues(variants, 'size').map((value) => ({
      value,
      disabled: !variants.some(
        (variant) =>
          variant.size === value &&
          (selectedColor == null || variant.color === selectedColor) &&
          variant.stock > 0,
      ),
    }))
  }, [variants, hasSizeAxis, selectedColor])

  const colorOptions = useMemo(
    () =>
      collectValues(variants, 'color').map((value) => ({
        value,
        swatch: swatches[value] ?? 'var(--color-surface-muted)',
        disabled: !variants.some(
          (variant) =>
            variant.color === value &&
            (selectedSize == null || variant.size === selectedSize) &&
            variant.stock > 0,
        ),
      })),
    [variants, swatches, selectedSize],
  )

  const price = selectedVariant?.price ?? product.price
  const compareAtPrice = selectedVariant ? selectedVariant.compareAtPrice : product.compareAtPrice
  const discount = getDiscountPercent(price, compareAtPrice)
  const stock = selectedVariant?.stock ?? null
  const stockStatus = describeStock(stock)

  const maxQuantity = stock != null && stock > 0 ? stock : 1
  const safeQuantity = Math.min(Math.max(1, quantity), maxQuantity)
  const canDecrease = safeQuantity > 1
  const canIncrease = safeQuantity < maxQuantity

  const selectVariant = (variant) => {
    if (!variant) {
      return
    }

    setSelectedVariantId(variant.id)
    setValidationMessage(null)
    setIsAdded(false)
  }

  const handleSelectSize = (size) => {
    selectVariant(
      variants.find(
        (variant) =>
          variant.size === size &&
          variant.stock > 0 &&
          (selectedColor == null || variant.color === selectedColor),
      ) ??
        variants.find((variant) => variant.size === size && variant.stock > 0),
    )
  }

  const handleSelectColor = (color) => {
    selectVariant(
      variants.find(
        (variant) =>
          variant.color === color &&
          variant.stock > 0 &&
          (selectedSize == null || variant.size === selectedSize),
      ) ??
        variants.find((variant) => variant.color === color && variant.stock > 0),
    )
  }

  const handleAddToCart = () => {
    if (!selectedVariant) {
      setValidationMessage(
        hasSizeAxis
          ? 'Choose a size and a colour before adding to cart.'
          : 'Choose a colour before adding to cart.',
      )
      return
    }

    addItem(product, selectedVariant, safeQuantity)
    setValidationMessage(null)
    setIsAdded(true)

    if (addedTimerRef.current) {
      clearTimeout(addedTimerRef.current)
    }

    addedTimerRef.current = setTimeout(() => setIsAdded(false), ADDED_FEEDBACK_MS)
  }

  return (
    <div className={styles.layout}>
      <div className={styles.galleryColumn}>
        <ProductGallery
          key={selectedVariant?.id ?? 'base'}
          images={images}
          badge={product.badge}
          priority
        />
      </div>

      <div className={styles.info}>
        <div className={styles.heading}>
          {product.brand ? (
            <Link className={styles.brand} href={`/shop?category=${product.category}`}>
              {product.brand}
            </Link>
          ) : null}
          <h1 className={styles.title}>{product.name}</h1>
        </div>

        <div className={styles.priceBlock}>
          <span className={styles.price}>{formatPrice(price)}</span>
          {compareAtPrice ? (
            <>
              <span className={styles.compareAt}>{formatPrice(compareAtPrice)}</span>
              {discount ? <span className={styles.discount}>Save {discount}%</span> : null}
            </>
          ) : null}
        </div>

        <p className={styles.stock} data-tone={stockStatus.tone}>
          {stockStatus.label}
        </p>

        {product.description ? (
          <p className={styles.description}>{product.description}</p>
        ) : null}

        <VariantSelector
          sizeOptions={sizeOptions}
          colorOptions={colorOptions}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          onSelectSize={handleSelectSize}
          onSelectColor={handleSelectColor}
        />

        <div className={styles.purchase}>
          <div className={styles.quantity}>
            <span className={styles.quantityLabel} id="quantity-label">
              Quantity
            </span>
            <div className={styles.quantityControls} aria-labelledby="quantity-label">
              <button
                type="button"
                className={styles.quantityButton}
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                disabled={!canDecrease}
                aria-label="Decrease quantity"
              >
                &minus;
              </button>
              <span className={styles.quantityValue} aria-live="polite">
                {safeQuantity}
              </span>
              <button
                type="button"
                className={styles.quantityButton}
                onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
                disabled={!canIncrease}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            className={isAdded ? `${styles.addToCart} ${styles.addToCartDone}` : styles.addToCart}
            onClick={handleAddToCart}
            aria-disabled={!selectedVariant}
          >
            {isAdded ? 'Added to cart' : 'Add to Cart'}
          </button>
        </div>

        {validationMessage ? (
          <p className={styles.validation} role="alert">
            {validationMessage}
          </p>
        ) : null}
      </div>
    </div>
  )
}
