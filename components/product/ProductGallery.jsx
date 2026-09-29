'use client'

import { useState } from 'react'
import Image from 'next/image'

import styles from './ProductGallery.module.css'

const MAIN_IMAGE_SIZES = '(min-width: 1024px) 46vw, 100vw'
const THUMBNAIL_SIZES = '72px'

export default function ProductGallery({ images, badge = null, priority = false }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = images[activeIndex] ?? images[0]

  if (!activeImage) {
    return null
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.main}>
        <Image
          className={styles.mainImage}
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          sizes={MAIN_IMAGE_SIZES}
          priority={priority}
        />

        {badge ? <span className={styles.badge}>{badge}</span> : null}
      </div>

      {images.length > 1 ? (
        <ul className={styles.thumbnails}>
          {images.map((image, index) => (
            <li key={image.src}>
              <button
                type="button"
                className={index === activeIndex ? `${styles.thumbnail} ${styles.thumbnailActive}` : styles.thumbnail}
                onClick={() => setActiveIndex(index)}
                aria-current={index === activeIndex}
                aria-label={`Show image ${index + 1} of ${images.length}`}
              >
                <Image
                  className={styles.thumbnailImage}
                  src={image.src}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes={THUMBNAIL_SIZES}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
