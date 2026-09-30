// seed-variants-reviews.mjs
import { readFileSync } from 'fs';

const API = 'http://localhost:8080/api/v1';
const AUTH_URL = 'http://localhost:8080/auth/login';
const ADMIN_EMAIL = 'ashfaqislam223539@gmail.com';
const ADMIN_PASSWORD = 'Admin@2026!';

const raw = JSON.parse(readFileSync('./seed-data/raw-mock.json', 'utf-8'));
// ADAPTER — age-er confirm kora export name diye fix koro
const mockProducts = raw.Products.MOCK_PRODUCTS ?? Object.values(raw.Products)[0];
const mockReviews = raw.Reviews.REVIEWS ?? raw.Reviews.MOCK_REVIEWS ?? Object.values(raw.Reviews)[0];

let token;
const stats = { created: 0, skipped: 0, failed: 0 };

async function login() {
  const res = await fetch(AUTH_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const body = await res.json();
  token = body.token;
  console.log('Logged in.');
}

async function apiGetAllPages(collection) {
  // page through in case there's a default page-size cap
  let all = [], page = 1;
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
  if (res.ok) { stats.created++; return body.data; }
  if (res.status === 409) { stats.skipped++; return null; }
  stats.failed++;
  console.error(`FAIL (${res.status}) ${label}:`, JSON.stringify(body));
  return null;
}

async function main() {
  await login();

  const products = await apiGetAllPages('products');
  console.log(`Fetched ${products.length} products from API.`);
  const productIdBySlug = Object.fromEntries(products.map((p) => [p.slug, p.id]));

  // --- Variants ---
  for (const p of mockProducts) {
    const productId = productIdBySlug[p.slug];
    if (!productId) { console.warn(`No DCMS product for slug ${p.slug}, skipping variants`); continue; }
    for (const v of p.variants ?? []) {
      const sku = v.sku ?? `${p.slug}-${v.size ?? ''}-${v.color ?? ''}`.toLowerCase().replace(/\s+/g, '-');
      await apiPost('/variants', {
        product: productId,
        size: v.size,
        color: v.color,
        sku,
        ...(v.price != null ? { price: String(v.price) } : {}),
        stock: v.stock ?? 0,
      }, `variant:${sku}`);
    }
  }
  console.log('Variants done:', stats);

  // --- Reviews ---
  const rStats = { created: 0, skipped: 0, failed: 0 };
  for (const r of mockReviews) {
    const slug = r.productId ?? r.productSlug; // ADAPTER — confirm real field name
    const productId = productIdBySlug[slug];
    if (!productId) { rStats.failed++; continue; }
    const res = await fetch(`${API}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        product: productId,
        user_name: r.userName ?? 'Anonymous',
        rating: r.rating,
        title: r.title,
        body: r.body,
        status: r.status ?? 'approved',
        verified_purchase: !!r.verifiedPurchase,
        helpful_up: r.helpfulUp ?? 0,
        helpful_down: r.helpfulDown ?? 0,
      }),
    });
    if (res.ok) rStats.created++;
    else if (res.status === 409) rStats.skipped++;
    else { rStats.failed++; console.error(`Review fail (${res.status}):`, await res.text()); }
  }
  console.log('Reviews done:', rStats);
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
