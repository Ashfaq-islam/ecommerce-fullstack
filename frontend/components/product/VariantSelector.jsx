'use client'

import { useId } from 'react'

import styles from './VariantSelector.module.css'

function SizeGroup({ label, options, value, onSelect }) {
  const groupId = useId()

  if (options.length === 0) {
    return null
  }

  return (
    <fieldset className={styles.group} aria-describedby={`${groupId}-hint`}>
      <legend className={styles.legend}>{label}</legend>

      <div className={styles.sizes}>
        {options.map((option) => {
          const isSelected = option.value === value

          return (
            <button
              key={option.value}
              type="button"
              className={
                option.disabled
                  ? `${styles.size} ${styles.sizeDisabled}`
                  : isSelected
                    ? `${styles.size} ${styles.sizeSelected}`
                    : styles.size
              }
              onClick={() => onSelect(option.value)}
              disabled={option.disabled}
              aria-pressed={isSelected}
            >
              {option.value}
            </button>
          )
        })}
      </div>

      <p className={styles.hint} id={`${groupId}-hint`}>
        {value ?? 'Select a size'}
      </p>
    </fieldset>
  )
}

function ColorGroup({ label, options, value, onSelect }) {
  const groupId = useId()

  if (options.length === 0) {
    return null
  }

  return (
    <fieldset className={styles.group} aria-describedby={`${groupId}-hint`}>
      <legend className={styles.legend}>{label}</legend>

      <div className={styles.colors}>
        {options.map((option) => {
          const isSelected = option.value === value

          return (
            <button
              key={option.value}
              type="button"
              className={
                option.disabled
                  ? `${styles.swatch} ${styles.swatchDisabled}`
                  : isSelected
                    ? `${styles.swatch} ${styles.swatchSelected}`
                    : styles.swatch
              }
              style={{ '--swatch-color': option.swatch }}
              onClick={() => onSelect(option.value)}
              disabled={option.disabled}
              aria-pressed={isSelected}
              aria-label={option.value}
              title={option.value}
            >
              <span className={styles.swatchFill} aria-hidden="true" />
              <span className={styles.swatchStrike} aria-hidden="true" />
            </button>
          )
        })}
      </div>

      <p className={styles.hint} id={`${groupId}-hint`}>
        {value ?? 'Select a colour'}
      </p>
    </fieldset>
  )
}

export default function VariantSelector({
  sizeLabel = 'Size',
  colorLabel = 'Colour',
  sizeOptions = [],
  colorOptions = [],
  selectedSize = null,
  selectedColor = null,
  onSelectSize,
  onSelectColor,
}) {
  return (
    <div className={styles.selector}>
      <SizeGroup
        label={sizeLabel}
        options={sizeOptions}
        value={selectedSize}
        onSelect={onSelectSize}
      />

      <ColorGroup
        label={colorLabel}
        options={colorOptions}
        value={selectedColor}
        onSelect={onSelectColor}
      />
    </div>
  )
}
