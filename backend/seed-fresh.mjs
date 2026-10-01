// backend/seed-fresh.mjs
// Run: node seed-fresh.mjs

import { readFileSync } from 'fs';

const API = 'http://localhost:8080/api/v1';
const AUTH_URL = 'http://localhost:8080/auth/login';
const ADMIN_EMAIL = 'ashfaqislam223539@gmail.com';
const ADMIN_PASSWORD = 'Admin@2026!';

const raw = JSON.parse(readFileSync('./seed-data/raw-mock.json', 'utf-8'));
const mockProducts = raw.Products.MOCK_PRODUCTS;
const mockReviews = raw.Reviews.mockReviews;

let token;
const stats = {
  deleted: 0,
  products: { created: 0, failed: 0, skipped: 0 },
  variants: { created: 0, failed: 0, skipped: 0 },
  reviews: { created: 0, failed: 0, skipped: 0 },
  patches: { updated: 0, failed: 0 },
};

function slugify(s) {
  return String(s ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function login() {
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const body = await res.json();
  if (!res.ok || !body.token) {
    throw new Error(`Login failed: ${JSON.stringify(body)}`);
  }
  token = body.token;
  console.log('✓ Logged in');
}

async function apiGetAllPages(collection) {
  let all = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${API}/${collection}?page=${page}&limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json().catch(() => ({}));
    const rows = body?.data ?? [];
    all = all.concat(rows);
    if (rows.length < 100) break;
    page++;
  }
  return all;
}

async function apiPost(path, payload, label) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (res.ok) return { data: body.data, skipped: false };
  if (res.status === 409) {
    console.log(`  SKIP (409): ${label}`);
    return { data: null, skipped: true };
  }
  console.error(`  FAIL (${res.status}): ${label}`, JSON.stringify(body).slice(0, 200));
  return { data: null, skipped: false };
}

async function apiPatch(path, payload, label) {
  const res = await fetch(`${API}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (res.ok) return await res.json();
  const body = await res.json().catch(() => ({}));
  console.error(`  PATCH FAIL (${res.status}): ${label}`, JSON.stringify(body).slice(0, 200));
  return null;
}

async function apiDelete(path, label) {
  const res = await fetch(`${API}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok || res.status === 404) return true;
  console.error(`  DELETE FAIL (${res.status}): ${label}`);
  return false;
}

async function main() {
  // Step 1: Login
  await login();

  // Step 2: Fetch categories and brands -> UUID maps
  const categories = await apiGetAllPages('categories');
  const brands = await apiGetAllPages('brands');
  const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
  const brandByName = Object.fromEntries(brands.map((b) => [b.name, b.id]));
  const brandBySlug = Object.fromEntries(brands.map((b) => [b.slug, b.id]));
  console.log(`✓ Loaded ${categories.length} categories, ${brands.length} brands`);

  // Step 3: Delete all existing products
  const existingProducts = await apiGetAllPages('products');
  console.log(`\n=== Deleting ${existingProducts.length} existing products ===`);
  for (const p of existingProducts) {
    const ok = await apiDelete(`/products/${p.id}`, p.slug);
    if (ok) {
      stats.deleted++;
      process.stdout.write('.');
    }
  }
  console.log(`\n✓ Deleted ${stats.deleted} products`);

  // Step 4: Create products from mock
  console.log(`\n=== Creating ${mockProducts.length} products ===`);
  const productIdBySlug = {};
  const mockProductIdToSlug = {};

  for (const mp of mockProducts) {
    mockProductIdToSlug[mp.id] = mp.slug;

    const brandUuid = brandByName[mp.brand] || brandBySlug[slugify(mp.brand)];
    const categoryUuid = categoryBySlug[mp.category];

    if (!brandUuid || !categoryUuid) {
      console.error(`  MISSING relation for ${mp.slug}: brand=${mp.brand}, category=${mp.category}`);
      stats.products.failed++;
      continue;
    }

    const payload = {
      title: mp.name,
      slug: mp.slug,
      description: mp.description ?? '',
      brand: brandUuid,
      category: categoryUuid,
      price: String(mp.price),
      images: [mp.image, mp.imageHover].filter(Boolean),
      status: 'active',
      stock_status: 'in_stock',
      featured: mp.badge === 'Sale',
      ...(mp.compareAtPrice != null ? { sale_price: String(mp.compareAtPrice) } : {}),
    };

    const { data: created, skipped } = await apiPost('/products', payload, `product:${mp.slug}`);
    if (created) {
      productIdBySlug[mp.slug] = created.id;
      stats.products.created++;
      process.stdout.write('.');
    } else if (skipped) {
      stats.products.skipped++;
    } else {
      stats.products.failed++;
    }
  }
  console.log(
    `\n✓ Products: ${stats.products.created} created, ${stats.products.skipped} skipped, ${stats.products.failed} failed`
  );

  // Step 5: Create variants
  console.log(`\n=== Creating variants ===`);
  for (const mp of mockProducts) {
    const productUuid = productIdBySlug[mp.slug];
    if (!productUuid) continue;

    for (const v of mp.variants ?? []) {
      const sku = v.id || `${mp.slug}-${v.size ?? ''}-${v.color ?? ''}`.toLowerCase().replace(/\s+/g, '-');
      const payload = {
        product: productUuid,
        size: v.size,
        color: v.color,
        sku,
        stock: v.stock ?? 0,
        ...(v.price != null ? { price: String(v.price) } : {}),
      };
      const { data: created, skipped } = await apiPost('/variants', payload, `variant:${sku}`);
      if (created) {
        stats.variants.created++;
        if (stats.variants.created % 20 === 0) process.stdout.write('.');
      } else if (skipped) {
        stats.variants.skipped++;
      } else {
        stats.variants.failed++;
      }
    }
  }
  console.log(
    `\n✓ Variants: ${stats.variants.created} created, ${stats.variants.skipped} skipped, ${stats.variants.failed} failed`
  );

  // Step 6: Create reviews
  console.log(`\n=== Creating ${mockReviews.length} reviews ===`);
  const reviewsPerProduct = {};

  for (const r of mockReviews) {
    const slug = mockProductIdToSlug[r.productId];
    const productUuid = productIdBySlug[slug];
    if (!productUuid) {
      stats.reviews.failed++;
      continue;
    }

    const payload = {
      product: productUuid,
      user_name: r.userName,
      rating: r.rating,
      title: r.title,
      body: r.body,
      status: 'approved',
      verified_purchase: !!r.verifiedPurchase,
      helpful_up: 0,
      helpful_down: 0,
    };

    const { data: created, skipped } = await apiPost('/reviews', payload, `review:${r.id}`);
    if (created) {
      stats.reviews.created++;
      reviewsPerProduct[slug] = reviewsPerProduct[slug] || [];
      reviewsPerProduct[slug].push(r.rating);
      process.stdout.write('.');
    } else if (skipped) {
      stats.reviews.skipped++;
    } else {
      stats.reviews.failed++;
    }
  }
  console.log(
    `\n✓ Reviews: ${stats.reviews.created} created, ${stats.reviews.skipped} skipped, ${stats.reviews.failed} failed`
  );

  // Step 7: Patch products with review_count + average_rating
  console.log(`\n=== Patching products with review aggregates ===`);
  for (const [slug, ratings] of Object.entries(reviewsPerProduct)) {
    const productUuid = productIdBySlug[slug];
    if (!productUuid) continue;

    const count = ratings.length;
    const avg = (ratings.reduce((a, b) => a + b, 0) / count).toFixed(2);

    const ok = await apiPatch(
      `/products/${productUuid}`,
      { review_count: count, average_rating: avg },
      `patch:${slug}`
    );

    if (ok) {
      stats.patches.updated++;
      process.stdout.write('.');
    } else {
      stats.patches.failed++;
    }
  }
  console.log(`\n✓ Patches: ${stats.patches.updated} updated, ${stats.patches.failed} failed`);

  // Step 8: Final summary
  console.log('\n=== FINAL SUMMARY ===');
  console.log(JSON.stringify(stats, null, 2));
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
