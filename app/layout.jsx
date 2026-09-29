import './globals.css'

import CartHydration from '@/components/cart/CartHydration'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import ScrollToTop from '@/components/layout/ScrollToTop'
import { getNavigationColumns } from '@/services/navigationService'

export const metadata = {
  title: 'ShopStore | Online Marketplace',
  description:
    'Shop everyday essentials online with cash on delivery available in all 64 districts.',
}

export default async function RootLayout({ children }) {
  // Resolved here because the header is a client component and cannot await
  // during render. The navigation is derived from the catalogue, so it can never
  // point at a category that does not exist.
  const navColumns = await getNavigationColumns()

  return (
    <html lang="en">
      <body>
        <AnnouncementBar />
        <Header navColumns={navColumns} />
        <main className="appMain">{children}</main>
        <Footer />
        <ScrollToTop />
        <CartHydration />
      </body>
    </html>
  )
}
