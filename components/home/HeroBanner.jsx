import Image from 'next/image'
import Link from 'next/link'

import styles from './HeroBanner.module.css'

const HERO = {
  image: '/images/hero.svg',
  eyebrow: 'New season, same low prices',
  headline: 'Everyday essentials delivered to your door',
  subtext:
    'Shop thousands of products with cash on delivery available in all 64 districts.',
  ctaLabel: 'Shop Now',
  ctaHref: '/shop',
}

export default function HeroBanner() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <Image
        src={HERO.image}
        alt=""
        fill
        preload
        sizes="100vw"
        className={styles.image}
      />
      <div className={styles.scrim} />

      <div className={styles.content}>
        <p className={styles.eyebrow}>{HERO.eyebrow}</p>
        <h1 id="hero-heading" className={styles.headline}>
          {HERO.headline}
        </h1>
        <p className={styles.subtext}>{HERO.subtext}</p>
        <Link className={styles.cta} href={HERO.ctaHref}>
          {HERO.ctaLabel}
        </Link>
      </div>
    </section>
  )
}
