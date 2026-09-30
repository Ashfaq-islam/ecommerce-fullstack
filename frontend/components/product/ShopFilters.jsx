'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { useProductFacets } from '@/hooks/useProductFacets'
import { formatPrice } from '@/lib/format'
import {
  buildFilterQuery,
  getActiveFilterCount,
  parseFilters,
  toggleFacetValue,
} from '@/lib/filters'

import styles from './ShopFilters.module.css'

const DESKTOP_QUERY = '(min-width: 1024px)'

const FACET_GROUPS = [
  { paramKey: 'category', title: 'Category' },
  { paramKey: 'brand', title: 'Brand' },
  { paramKey: 'badge', title: 'Highlights' },
  { paramKey: 'size', title: 'Size' },
  { paramKey: 'color', title: 'Colour' },
]

function FilterIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function FacetGroup({ title, name, options, selected, onToggle }) {
  const groupId = useId()

  if (options.length === 0) {
    return null
  }

  return (
    <fieldset className={styles.group}>
      <legend className={styles.groupTitle}>{title}</legend>
      <div className={styles.groupBody}>
        {options.map((option) => {
          const value = option.value ?? option
          const label = option.label ?? option
          const id = `${groupId}-${name}-${value}`

          return (
            <div className={styles.checkRow} key={value}>
              <input
                className={styles.checkbox}
                type="checkbox"
                id={id}
                name={name}
                value={value}
                checked={selected.includes(value)}
                onChange={() => onToggle(name, value)}
              />
              <label className={styles.checkLabel} htmlFor={id}>
                {label}
              </label>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}

function PriceGroup({ priceRange, minPrice, maxPrice, draft, onDraftChange, onApply, onReset }) {
  const groupId = useId()
  const minId = `${groupId}-min`
  const maxId = `${groupId}-max`

  return (
    <fieldset className={styles.group}>
      <legend className={styles.groupTitle}>Price</legend>

      <div className={styles.priceRow}>
        <div className={styles.priceField}>
          <label className={styles.priceLabel} htmlFor={minId}>
            Min
          </label>
          <input
            className={styles.priceInput}
            id={minId}
            type="number"
            inputMode="numeric"
            min={priceRange.min}
            max={priceRange.max}
            step={100}
            placeholder={String(priceRange.min)}
            value={draft.minPrice}
            onChange={(event) => onDraftChange('minPrice', event.target.value)}
          />
        </div>

        <span className={styles.priceSeparator} aria-hidden="true">
          –
        </span>

        <div className={styles.priceField}>
          <label className={styles.priceLabel} htmlFor={maxId}>
            Max
          </label>
          <input
            className={styles.priceInput}
            id={maxId}
            type="number"
            inputMode="numeric"
            min={priceRange.min}
            max={priceRange.max}
            step={100}
            placeholder={String(priceRange.max)}
            value={draft.maxPrice}
            onChange={(event) => onDraftChange('maxPrice', event.target.value)}
          />
        </div>
      </div>

      <p className={styles.priceHint}>
        {formatPrice(priceRange.min)} – {formatPrice(priceRange.max)}
      </p>

      <div className={styles.priceActions}>
        <button type="button" className={styles.applyButton} onClick={onApply}>
          Apply
        </button>
        {minPrice != null || maxPrice != null ? (
          <button type="button" className={styles.resetButton} onClick={onReset}>
            Reset
          </button>
        ) : null}
      </div>
    </fieldset>
  )
}

export default function ShopFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { categories, brands, badges, sizes, colors, priceRange, isLoading, error } =
    useProductFacets()

  const [isOpen, setIsOpen] = useState(false)
  const panelId = useId()
  const closeButtonRef = useRef(null)

  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  const activeCount = getActiveFilterCount(filters)

  // Seeding the draft during render (rather than in an effect) keeps the
  // inputs in step with the URL when filters are reset or navigated back to.
  const priceKey = `${filters.minPrice ?? ''}:${filters.maxPrice ?? ''}`
  const [priceDraft, setPriceDraft] = useState({ key: priceKey, minPrice: '', maxPrice: '' })

  if (priceDraft.key !== priceKey) {
    setPriceDraft({
      key: priceKey,
      minPrice: filters.minPrice == null ? '' : String(filters.minPrice),
      maxPrice: filters.maxPrice == null ? '' : String(filters.maxPrice),
    })
  }

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const mediaQuery = window.matchMedia(DESKTOP_QUERY)

    if (mediaQuery.matches) {
      return
    }

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    return () => {
      body.style.overflow = previousOverflow
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const navigate = (nextFilters) => {
    const query = buildFilterQuery(nextFilters, searchParams)
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const handleToggle = (paramKey, value) => {
    navigate({ ...filters, [paramKey]: toggleFacetValue(filters[paramKey], value) })
  }

  const handleDraftChange = (field, value) => {
    setPriceDraft((current) => ({ ...current, [field]: value }))
  }

  const handlePriceApply = () => {
    navigate({
      ...filters,
      minPrice: priceDraft.minPrice === '' ? null : priceDraft.minPrice,
      maxPrice: priceDraft.maxPrice === '' ? null : priceDraft.maxPrice,
    })
  }

  const handlePriceReset = () => {
    setPriceDraft((current) => ({ ...current, minPrice: '', maxPrice: '' }))
    navigate({ ...filters, minPrice: null, maxPrice: null })
  }

  const handleClearAll = () => {
    setPriceDraft((current) => ({ ...current, minPrice: '', maxPrice: '' }))
    navigate({})
  }

  const facetOptions = {
    category: categories.map((category) => ({ value: category.slug, label: category.name })),
    brand: brands.map((brand) => ({ value: brand, label: brand })),
    badge: badges.map((badge) => ({ value: badge, label: badge })),
    size: sizes.map((size) => ({ value: size, label: size })),
    color: colors.map((color) => ({ value: color, label: color })),
  }

  return (
    <>
      <div className={styles.mobileBar}>
        <button
          type="button"
          className={styles.mobileTrigger}
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls={panelId}
        >
          <FilterIcon />
          <span>Filters</span>
          {activeCount > 0 ? <span className={styles.countBadge}>{activeCount}</span> : null}
        </button>
      </div>

      {isOpen ? <div className={styles.scrim} onClick={() => setIsOpen(false)} /> : null}

      <aside
        id={panelId}
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
        role={isOpen ? 'dialog' : undefined}
        aria-modal={isOpen ? true : undefined}
        aria-label="Product filters"
      >
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Filters</h2>

          <div className={styles.panelActions}>
            {activeCount > 0 ? (
              <button type="button" className={styles.clearButton} onClick={handleClearAll}>
                Clear all
              </button>
            ) : null}

            <button
              type="button"
              ref={closeButtonRef}
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close filters"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className={styles.panelBody}>
          {error ? (
            <p className={styles.facetStatus} role="alert">
              We could not load the filters. Please try again in a moment.
            </p>
          ) : isLoading ? (
            <p className={styles.facetStatus} aria-busy="true">
              <span className="screenReaderOnly">Loading filters</span>
            </p>
          ) : (
            <>
              {FACET_GROUPS.map((group) => (
                <FacetGroup
                  key={group.paramKey}
                  title={group.title}
                  name={group.paramKey}
                  options={facetOptions[group.paramKey]}
                  selected={filters[group.paramKey]}
                  onToggle={handleToggle}
                />
              ))}

              <PriceGroup
                priceRange={priceRange}
                minPrice={filters.minPrice}
                maxPrice={filters.maxPrice}
                draft={priceDraft}
                onDraftChange={handleDraftChange}
                onApply={handlePriceApply}
                onReset={handlePriceReset}
              />
            </>
          )}
        </div>

        <div className={styles.panelFooter}>
          <button type="button" className={styles.showResultsButton} onClick={() => setIsOpen(false)}>
            Show results
          </button>
        </div>
      </aside>
    </>
  )
}
