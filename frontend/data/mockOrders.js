/**
 * Mock order history used by the account page. Regenerated against the current
 * catalogue so the product ids, variant ids and image paths always resolve;
 * totals come from the real shipping rule rather than being hand-written.
 */
export const MOCK_ORDERS = [
    {
      id: 'ord_9001',
      orderNumber: 'SHP-260512-4471',
      userId: 'usr_1001',
      placedAt: '2026-05-12T10:24:00.000Z',
      status: 'delivered',
      paymentMethod: 'cod',
      items: [
        {
          productId: 'prod_0002',
          variantId: 'var_0002_l_black',
          name: 'Men\'s Baggy Fit Cargo Pants in Black',
          image: '/images/products/variants/baggy-fit-cargo-pants-black--black.svg',
          size: 'L',
          color: 'Black',
          price: 1300,
          quantity: 1,
        },
      ],
      shippingAddress: {
        fullName: 'Ashfaq Sarkar',
        phone: '01712345678',
        address: 'House 12, Road 5, Dhanmondi',
        district: 'Dhaka',
        city: 'Dhaka',
      },
      subtotal: 1300,
      shipping: 80,
      total: 1380,
    },
    {
      id: 'ord_9002',
      orderNumber: 'SHP-260721-1183',
      userId: 'usr_1001',
      placedAt: '2026-07-21T16:02:00.000Z',
      status: 'shipped',
      paymentMethod: 'cod',
      items: [
        {
          productId: 'prod_0014',
          variantId: 'var_0014_m_black',
          name: 'Unisex Bootcut Jeans in Black',
          image: '/images/products/variants/unisex-bootcut-jeans-black--black.svg',
          size: 'M',
          color: 'Black',
          price: 1850,
          quantity: 1,
        },
        {
          productId: 'prod_0020',
          variantId: 'var_0020_one-size_black',
          name: 'Heavyweight Canvas Tote',
          image: '/images/products/variants/heavyweight-canvas-tote--black.svg',
          size: 'One Size',
          color: 'Black',
          price: 890,
          quantity: 2,
        },
      ],
      shippingAddress: {
        fullName: 'Ashfaq Sarkar',
        phone: '01712345678',
        address: 'House 12, Road 5, Dhanmondi',
        district: 'Dhaka',
        city: 'Dhaka',
      },
      subtotal: 3630,
      shipping: 0,
      total: 3630,
    },
    {
      id: 'ord_9003',
      orderNumber: 'SHP-260905-6620',
      userId: 'usr_1002',
      placedAt: '2026-09-05T08:45:00.000Z',
      status: 'processing',
      paymentMethod: 'cod',
      items: [
        {
          productId: 'prod_0001',
          variantId: 'var_0001_m_teal',
          name: 'Teal Drop Shoulder T-shirt',
          image: '/images/products/variants/teal-drop-shoulder-tee--teal.svg',
          size: 'M',
          color: 'Teal',
          price: 650,
          quantity: 3,
        },
      ],
      shippingAddress: {
        fullName: 'Nusrat Jahan',
        phone: '01812345678',
        address: 'Flat 4B, House 22, Road 7, Banani',
        district: 'Dhaka',
        city: 'Dhaka',
      },
      subtotal: 1950,
      shipping: 80,
      total: 2030,
    },
  ]

export const ORDER_STATUS_LABELS = {
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}
