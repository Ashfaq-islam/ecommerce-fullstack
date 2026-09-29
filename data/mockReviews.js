/**
 * Mock customer reviews, keyed to the ids in `mockProducts.js`.
 *
 * Every value is fixed: no `Math.random()`, no `Date.now()`. A review feed that
 * reshuffles on every render makes the empty state, the "load more" pagination
 * and the relative dates impossible to test by hand, so the data below is
 * deterministic and safe to assert against.
 *
 * Coverage is deliberately uneven so every state in the UI has a fixture:
 *   prod_0001 — no reviews at all, exercises the empty state.
 *   prod_0002 — five reviews, fits on one page.
 *   prod_0003 — twenty reviews, exercises "load more".
 *
 * The shape mirrors what a real reviews endpoint is expected to return, so
 * components do not change when the mock is replaced by a live API.
 */

const MOCK_REVIEWS = [
  {
    id: 'rev-001',
    productId: 'prod_0003',
    userId: 'user-001',
    userName: 'Rahim Ahmed',
    rating: 5,
    title: 'Genuinely looks like real leather',
    body: 'Ordered the black jacket for Eid and it arrived in two days. The material is stiff for the first day, then it moulds to your shoulders and feels like real leather. Stitching around the zip and cuffs is clean, no loose threads anywhere. Worth the price.',
    createdAt: '2026-09-20T09:15:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-002',
    productId: 'prod_0003',
    userId: 'user-002',
    userName: 'Karim Hossain',
    rating: 5,
    title: 'Best jacket I own',
    body: 'I have bought three leather-look jackets over the last four years and this one is by far the best. The lining is not scratchy and the inner pocket is actually usable. It survives a full Dhaka commute in the humidity without peeling.',
    createdAt: '2026-09-14T18:40:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-003',
    productId: 'prod_0003',
    userId: 'user-021',
    userName: 'Jannatul Ferdous',
    rating: 4,
    title: 'Soft leather, warm enough for October',
    body: 'Bought it for the two weeks of October when the evenings turn cool. The material is softer than I expected and it does not stick to the skin. Only note: the zip is a little stiff for the first few uses.',
    createdAt: '2026-09-08T11:30:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-004',
    productId: 'prod_0003',
    userId: 'user-003',
    userName: 'Fatima Rahman',
    rating: 4,
    title: 'Nice jacket, size runs large',
    body: 'Quality is good and the colour is a proper black, not grey. I normally wear M and took S as advised in the size chart, but the shoulders are still slightly wide. Sizing down is the right call if you want a fitted look.',
    createdAt: '2026-09-02T11:05:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-005',
    productId: 'prod_0002',
    userId: 'user-004',
    userName: 'Sarah Ahmed',
    rating: 5,
    title: 'The cargo pockets are actually useful',
    body: 'Bought these for daily wear and they have held up to two months of washing. The six pockets are deep enough for a phone and keys without the whole leg sagging. Fabric is thick but not stiff.',
    createdAt: '2026-09-12T14:20:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-006',
    productId: 'prod_0003',
    userId: 'user-005',
    userName: 'Tanvir Hasan',
    rating: 5,
    title: 'Perfect for the winter',
    body: 'Wore it through a full January and I was fine without a heavy sweater underneath. The collar sits flat and does not flap in the wind, which was my main complaint with the last jacket I owned.',
    createdAt: '2026-08-28T20:10:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-007',
    productId: 'prod_0002',
    userId: 'user-006',
    userName: 'Nusrat Jahan',
    rating: 4,
    title: 'Good fit, slightly long',
    body: 'The baggy fit is exactly as advertised. For me they are an inch too long in the leg, so I got them tailored. Delivery was quick and the packaging was neat. Four stars only because of the length for shorter wearers.',
    createdAt: '2026-08-19T08:30:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-008',
    productId: 'prod_0003',
    userId: 'user-007',
    userName: 'Imran Kabir',
    rating: 3,
    title: 'Good, but the zip sticks',
    body: 'The jacket itself is solid and the leather finish has not cracked yet. The main zip however catches halfway sometimes and needs a second pull. Fixable, but it is annoying when you are in a hurry.',
    createdAt: '2026-08-06T16:45:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-009',
    productId: 'prod_0003',
    userId: 'user-022',
    userName: 'Anisur Rahman',
    rating: 4,
    title: 'Good jacket, cuffs could be tighter',
    body: 'Everything is as described and the finish still looks new after a few wears. The one thing I would change is the wrist cuffs, which stay a little open on a slim wrist. Easy to leave the top button undone and it stops mattering.',
    createdAt: '2026-08-14T13:15:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-010',
    productId: 'prod_0003',
    userId: 'user-008',
    userName: 'Ayesha Siddiqua',
    rating: 4,
    title: 'Stylish, runs slim through the body',
    body: 'Looks great and the cut is flattering. I have a slightly fuller build and it pulls a little across the chest when I sit down. The seller swapped me to a larger size without any argument, which counts for a lot.',
    createdAt: '2026-07-21T12:00:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-011',
    productId: 'prod_0003',
    userId: 'user-009',
    userName: 'Rafi Islam',
    rating: 5,
    title: 'Second one I have bought',
    body: 'Bought the first one as a gift and liked it enough to order a second for myself. Same quality as the first delivery, no batch differences. The brand seems consistent, which is rare now.',
    createdAt: '2026-07-09T10:25:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-012',
    productId: 'prod_0002',
    userId: 'user-010',
    userName: 'Mitu Akter',
    rating: 5,
    title: 'Exactly what I wanted',
    body: 'Simple, sturdy and the right amount of room in the thigh. These replaced a pair of jeans for me in the office. I am usually between 32 and 34 and took 32, the fit is true.',
    createdAt: '2026-06-30T09:00:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-013',
    productId: 'prod_0003',
    userId: 'user-011',
    userName: 'Shakib Al Hasan',
    rating: 5,
    title: 'Stands up to heavy use',
    body: 'I ride a motorbike and this has been rained on twice. It wiped clean with a dry cloth and the shoulders have not started flaking, unlike a cheaper jacket I bought last year that peeled in a month.',
    createdAt: '2026-06-15T17:35:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-014',
    productId: 'prod_0003',
    userId: 'user-023',
    userName: 'Rehnuma Tabassum',
    rating: 5,
    title: 'Finished beautifully',
    body: 'The seams are pressed flat and nothing is glued or stapled visibly, which is where cheaper jackets give themselves away. I have worn it for a month of office commutes and it still looks new.',
    createdAt: '2026-06-24T08:20:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-015',
    productId: 'prod_0003',
    userId: 'user-012',
    userName: 'Farhana Akter',
    rating: 2,
    title: 'Smell and finish',
    body: 'The jacket arrived with a strong chemical smell that took a week of airing to fade, and the finish is slightly shiny rather than matte. It is still wearable, but I expected a more premium surface for this price.',
    createdAt: '2026-05-27T13:50:00Z',
    verifiedPurchase: false,
  },
  {
    id: 'rev-016',
    productId: 'prod_0003',
    userId: 'user-013',
    userName: 'Sajib Hossain',
    rating: 4,
    title: 'Solid everyday jacket',
    body: 'No complaints after three months. Buttons are solid metal and have not come loose. Only small thing is that the inside lining is a little thin, so it is not a jacket for the very cold days.',
    createdAt: '2026-05-09T19:20:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-017',
    productId: 'prod_0002',
    userId: 'user-024',
    userName: 'Jashim Uddin',
    rating: 4,
    title: 'Sturdy, rides well on a bike',
    body: 'I wear these on the rickshaw commute every day. The reinforced knees have not gone soft, and the buttoned back pockets keep my phone from bouncing. They wash fine, though I air dry them rather than tumble dry.',
    createdAt: '2026-05-05T15:55:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-018',
    productId: 'prod_0002',
    userId: 'user-014',
    userName: 'Maliha Tasnim',
    rating: 3,
    title: 'Good fabric, odd waist',
    body: 'The material feels durable and the colour is true to the photos. The waistband sits higher than I expected and the belt loops are placed a little awkwardly. Not a dealbreaker but worth knowing.',
    createdAt: '2026-04-22T11:10:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-019',
    productId: 'prod_0003',
    userId: 'user-015',
    userName: 'Rubel Mia',
    rating: 5,
    title: 'Bought two more for my brothers',
    body: 'Ordered three in the end. The jacket keeps its shape, the black has not faded at all after multiple washes, and the delivery guy was polite about the swapping. Very happy with this purchase.',
    createdAt: '2026-04-03T15:40:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-020',
    productId: 'prod_0003',
    userId: 'user-025',
    userName: 'Nazmul Haque',
    rating: 3,
    title: 'Nice finish, ordered the wrong size',
    body: 'The jacket is clearly good quality and I have no complaint about the material. I ordered L by mistake out of habit, and swapping to M was done without any hassle in three days, so the seller handled it well.',
    createdAt: '2026-04-16T16:30:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-021',
    productId: 'prod_0003',
    userId: 'user-016',
    userName: 'Sharmin Akter',
    rating: 1,
    title: 'Not for me',
    body: 'The shoulders were far too wide on me and the length stopped above the hip, so it looked like a cropped jacket. The quality is fine, it simply does not suit my body shape and the size chart was not much help.',
    createdAt: '2026-03-18T10:05:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-022',
    productId: 'prod_0003',
    userId: 'user-017',
    userName: 'Habibur Rahman',
    rating: 5,
    title: 'Exactly as pictured',
    body: 'The photos do not oversell it. Same black, same cut, same finish. Sleeves have the right length with a small tab to shorten them if needed, which I used.',
    createdAt: '2026-03-02T18:00:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-023',
    productId: 'prod_0003',
    userId: 'user-018',
    userName: 'Sadia Afrin',
    rating: 4,
    title: 'Warm and lightweight',
    body: 'Surprisingly warm for something that looks so thin. I have worn it on cool evenings and windy mornings and it blocks the wind well. The only thing I would change is adding another inside pocket.',
    createdAt: '2026-02-19T14:25:00Z',
    verifiedPurchase: true,
  },
  {
    id: 'rev-024',
    productId: 'prod_0003',
    userId: 'user-019',
    userName: 'Arif Chowdhury',
    rating: 5,
    title: 'Great value',
    body: 'I compared three similar jackets in this range and this one has the best stitching by a clear margin. Delivery took four days to Chattogram, packaging was proper and there was no damage.',
    createdAt: '2026-02-11T09:50:00Z',
    verifiedPurchase: false,
  },
  {
    id: 'rev-025',
    productId: 'prod_0003',
    userId: 'user-020',
    userName: 'Tanvir Hasan',
    rating: 5,
    title: 'Second review, still happy',
    body: 'Came back to leave a note after six months of wear. No cracking on the elbows, no loose threads, zip still smooth. This jacket has held up better than anything else I own from the same price bracket.',
    createdAt: '2026-01-28T20:15:00Z',
    verifiedPurchase: true,
  },
]

export const mockReviews = MOCK_REVIEWS

/**
 * Reviews for one product, newest first. A copy is returned so a caller that
 * sorts or paginates the result cannot mutate the shared module state.
 */
export function getMockReviewsForProduct(productId) {
  return MOCK_REVIEWS.filter((review) => review.productId === productId)
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

/**
 * Aggregate view of a product's ratings: the mean to one decimal, the number of
 * reviews, and the per-star count keyed 1-5. Keys are always present, so the UI
 * can render a zero-height bar without a missing-value branch.
 */
export function getReviewSummary(productId) {
  const reviews = getMockReviewsForProduct(productId)
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  let total = 0

  for (const review of reviews) {
    const rating = review.rating

    if (rating >= 1 && rating <= 5) {
      distribution[rating] += 1
      total += rating
    }
  }

  const count = reviews.length

  return {
    average: count === 0 ? 0 : Math.round((total / count) * 10) / 10,
    count,
    distribution,
  }
}
