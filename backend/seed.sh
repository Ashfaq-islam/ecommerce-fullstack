#!/bin/bash
# Bulk seed script for DCMS ecommerce backend
# Run: bash seed.sh

API="http://localhost:8080/api/v1"
COOKIE="cookies.txt"

# Login
echo "=== Logging in ==="
curl -s -c $COOKIE -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ashfaqislam223539@gmail.com","password":"Admin@2026!"}' > /dev/null
echo "Login done"

# ==========================================
# CATEGORIES
# ==========================================
echo ""
echo "=== Creating categories ==="

create_category() {
  local name="$1"
  local slug="$2"
  local order="$3"
  curl -s -b $COOKIE -X POST $API/categories \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$name\",\"slug\":\"$slug\",\"sort_order\":$order}"
  echo ""
}

create_category "Men" "men" 1
create_category "Women" "women" 2
create_category "Accessories" "accessories" 3
create_category "Shoes" "shoes" 4

# ==========================================
# BRANDS
# ==========================================
echo ""
echo "=== Creating brands ==="

create_brand() {
  local name="$1"
  local slug="$2"
  curl -s -b $COOKIE -X POST $API/brands \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$name\",\"slug\":\"$slug\"}"
  echo ""
}

create_brand "Mighto" "mighto"
create_brand "CARGO" "cargo"
create_brand "Plaantik" "plaantik"
create_brand "Nike" "nike"

# ==========================================
# GET IDs (for product relations)
# ==========================================
echo ""
echo "=== Getting category IDs ==="
CATEGORIES=$(curl -s -b $COOKIE $API/categories)
CATEGORY_MEN=$(echo "$CATEGORIES" | python3 -c "import json,sys; d=json.load(sys.stdin)['data']; print([c['id'] for c in d if c['slug']=='men'][0])")
CATEGORY_WOMEN=$(echo "$CATEGORIES" | python3 -c "import json,sys; d=json.load(sys.stdin)['data']; print([c['id'] for c in d if c['slug']=='women'][0])")
CATEGORY_ACCESSORIES=$(echo "$CATEGORIES" | python3 -c "import json,sys; d=json.load(sys.stdin)['data']; print([c['id'] for c in d if c['slug']=='accessories'][0])")
CATEGORY_SHOES=$(echo "$CATEGORIES" | python3 -c "import json,sys; d=json.load(sys.stdin)['data']; print([c['id'] for c in d if c['slug']=='shoes'][0])")

echo ""
echo "=== Getting brand IDs ==="
BRANDS=$(curl -s -b $COOKIE $API/brands)
BRAND_MIGHTO=$(echo "$BRANDS" | python3 -c "import json,sys; d=json.load(sys.stdin)['data']; print([b['id'] for b in d if b['slug']=='mighto'][0])")
BRAND_CARGO=$(echo "$BRANDS" | python3 -c "import json,sys; d=json.load(sys.stdin)['data']; print([b['id'] for b in d if b['slug']=='cargo'][0])")
BRAND_PLAANTIK=$(echo "$BRANDS" | python3 -c "import json,sys; d=json.load(sys.stdin)['data']; print([b['id'] for b in d if b['slug']=='plaantik'][0])")
BRAND_NIKE=$(echo "$BRANDS" | python3 -c "import json,sys; d=json.load(sys.stdin)['data']; print([b['id'] for b in d if b['slug']=='nike'][0])")

echo "Men: $CATEGORY_MEN"
echo "Women: $CATEGORY_WOMEN"
echo "Mighto: $BRAND_MIGHTO"
echo "CARGO: $BRAND_CARGO"

# ==========================================
# PRODUCTS — 22 items from mock data
# ==========================================
echo ""
echo "=== Creating 22 products ==="

create_product() {
  local title="$1"
  local slug="$2"
  local price="$3"
  local brand_id="$4"
  local category_id="$5"
  
  curl -s -b $COOKIE -X POST $API/products \
    -H "Content-Type: application/json" \
    -d "{
      \"title\":\"$title\",
      \"slug\":\"$slug\",
      \"price\":\"$price\",
      \"brand\":\"$brand_id\",
      \"category\":\"$category_id\",
      \"status\":\"active\",
      \"stock_status\":\"in_stock\",
      \"featured\":false
    }"
  echo ""
}

# 22 products from mock data
create_product "Sculpt Yoga Pants in Black" "sculpt-yoga-pants-black" "75.00" "$BRAND_MIGHTO" "$CATEGORY_MEN"
create_product "Omni Shorts in Black" "omni-shorts-black" "31.50" "$BRAND_MIGHTO" "$CATEGORY_MEN"
create_product "Sculpt Training Tank Top in Black" "sculpt-training-tank-black" "55.00" "$BRAND_MIGHTO" "$CATEGORY_MEN"
create_product "Endure Workout T-shirt in White" "endure-workout-tshirt-white" "35.00" "$BRAND_MIGHTO" "$CATEGORY_MEN"
create_product "Chase Running T-shirt in Mint Green" "chase-running-tshirt-mint" "35.00" "$BRAND_MIGHTO" "$CATEGORY_MEN"
create_product "Endure Workout T-shirt in Pink" "endure-workout-tshirt-pink" "55.00" "$BRAND_MIGHTO" "$CATEGORY_WOMEN"
create_product "Endure Workout T-shirt in Blue" "endure-workout-tshirt-blue" "55.00" "$BRAND_MIGHTO" "$CATEGORY_MEN"
create_product "Endure Workout T-shirt in Green" "endure-workout-tshirt-green" "35.00" "$BRAND_MIGHTO" "$CATEGORY_MEN"
create_product "Endure Workout T-shirt in Grey" "endure-workout-tshirt-grey" "35.00" "$BRAND_MIGHTO" "$CATEGORY_MEN"
create_product "Endure Workout T-shirt in Black" "endure-workout-tshirt-black" "35.00" "$BRAND_MIGHTO" "$CATEGORY_MEN"
create_product "Chase Running T-shirt in Cornflower Blue" "chase-running-tshirt-blue" "35.00" "$BRAND_MIGHTO" "$CATEGORY_MEN"
create_product "Baggy Fit Cargo Pants in Off-White" "baggy-cargo-pants-offwhite" "35.00" "$BRAND_CARGO" "$CATEGORY_MEN"
create_product "Cargo Jogger Pants in Black" "cargo-jogger-black" "42.00" "$BRAND_CARGO" "$CATEGORY_MEN"
create_product "Cargo Cargo Shorts in Khaki" "cargo-shorts-khaki" "38.00" "$BRAND_CARGO" "$CATEGORY_MEN"
create_product "Cargo Hoodie in Grey" "cargo-hoodie-grey" "65.00" "$BRAND_CARGO" "$CATEGORY_MEN"
create_product "AFC001 Football Skull T-Shirt" "afc001-football-skull" "49.99" "$BRAND_PLAANTIK" "$CATEGORY_MEN"
create_product "Plaantik Graphic Tee Black" "plaantik-graphic-tee-black" "45.00" "$BRAND_PLAANTIK" "$CATEGORY_MEN"
create_product "Nike Air Zoom Running" "nike-air-zoom-running" "120.00" "$BRAND_NIKE" "$CATEGORY_SHOES"
create_product "Nike Dri-FIT Training Tee" "nike-dri-fit-training" "45.00" "$BRAND_NIKE" "$CATEGORY_MEN"
create_product "Nike Sport Backpack" "nike-sport-backpack" "55.00" "$BRAND_NIKE" "$CATEGORY_ACCESSORIES"
create_product "Women's Running Leggings" "womens-running-leggings" "65.00" "$BRAND_NIKE" "$CATEGORY_WOMEN"
create_product "Women's Sports Bra" "womens-sports-bra" "40.00" "$BRAND_NIKE" "$CATEGORY_WOMEN"

echo ""
echo "=== SEED COMPLETE ==="
echo "Categories: 4"
echo "Brands: 4"
echo "Products: 22"
echo ""
echo "Verify:"
echo "curl -s http://localhost:8080/api/v1/products | python3 -c 'import json,sys; d=json.load(sys.stdin); print(\"Total:\", d[\"meta\"][\"total\"])'"
