import CategoryTiles from '@/components/home/CategoryTiles'
import FeaturedGrid from '@/components/home/FeaturedGrid'
import HeroBanner from '@/components/home/HeroBanner'

export default function Home() {
  return (
    <>
      <HeroBanner />
      <CategoryTiles />
      <FeaturedGrid />
    </>
  )
}
