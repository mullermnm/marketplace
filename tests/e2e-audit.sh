#!/bin/bash
# Comprehensive E2E audit against running server. Produces transcript + PASS/FAIL.
# Use: bash tests/e2e-audit.sh PORT
set +e
PORT="${1:-3030}"
BASE="http://localhost:$PORT"
PASS=0
FAIL=0
declare -a RESULTS

t() {
  local name="$1"; local expected="$2"; local got="$3"
  if [ "$expected" = "$got" ]; then
    PASS=$((PASS+1)); RESULTS+=("PASS: $name (got $got)");
  else
    FAIL=$((FAIL+1)); RESULTS+=("FAIL: $name (expected $expected, got $got)");
  fi
}

t_match() {
  local name="$1"; local needle="$2"; local hay="$3"
  if echo "$hay" | grep -q "$needle"; then
    PASS=$((PASS+1)); RESULTS+=("PASS: $name");
  else
    FAIL=$((FAIL+1)); RESULTS+=("FAIL: $name (no match for '$needle')");
  fi
}

C_ADM=/tmp/admcook.txt
C_SEL=/tmp/selcook.txt
C_CUS=/tmp/cuscook.txt
C_NEW=/tmp/newcook.txt
rm -f "$C_ADM" "$C_SEL" "$C_CUS" "$C_NEW"

# ============================================================
echo "## REQ 1 — Auth"
# 1.1 register flow with bad password
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/auth/register -H 'Content-Type: application/json' -d '{"email":"weak@ex.com","password":"weak","name":"W"}')
t "1.6 password rules reject weak" "400" "$R"
# 1.2 register with valid password
R=$(curl -s -o /dev/null -w "%{http_code}" -c $C_NEW -X POST $BASE/api/auth/register -H 'Content-Type: application/json' -d '{"email":"audit_user@ex.com","password":"GoodPass1!","name":"Audit"}')
t "1.2 register valid" "200" "$R"
# 1.3 login as seed admin
R=$(curl -s -o /dev/null -w "%{http_code}" -c $C_ADM -X POST $BASE/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@local.dev","password":"Admin123!"}')
t "1.2 login admin" "200" "$R"
# login as seller, customer
curl -s -o /dev/null -c $C_SEL -X POST $BASE/api/auth/login -H 'Content-Type: application/json' -d '{"email":"seller@local.dev","password":"Seller123!"}' >/dev/null
curl -s -o /dev/null -c $C_CUS -X POST $BASE/api/auth/login -H 'Content-Type: application/json' -d '{"email":"customer@local.dev","password":"Customer123!"}' >/dev/null
# wrong password
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@local.dev","password":"wrong"}')
t "1.* wrong pw rejected" "400" "$R"

# 1.5 RBAC: customer hits admin page → 307
R=$(curl -s -o /dev/null -w "%{http_code}" -b $C_CUS $BASE/admin/dashboard)
t "1.5 RBAC redirect" "307" "$R"

# ============================================================
echo "## REQ 2 — Seller onboarding"
# Create new user, apply, admin approve
curl -s -c /tmp/newseller.txt -X POST $BASE/api/auth/register -H 'Content-Type: application/json' -d '{"email":"newseller@ex.com","password":"GoodPass1!","name":"NS"}' >/dev/null
R=$(curl -s -o /dev/null -w "%{http_code}" -b /tmp/newseller.txt -X POST $BASE/api/seller/apply -H 'Content-Type: application/json' -d '{"businessName":"NewBiz","description":"We sell digital things and stuff","contactEmail":"newseller@ex.com"}')
t "2.1/2.2 seller apply pending" "200" "$R"
# admin pending list contains them
H=$(curl -s -b $C_ADM $BASE/admin/sellers/pending)
t_match "2.3 pending list shows applicant" "NewBiz" "$H"

# unapproved seller can't create products
R=$(curl -s -o /dev/null -w "%{http_code}" -b /tmp/newseller.txt -X POST $BASE/api/seller/products -H 'Content-Type: application/json' -d '{"title":"X","description":"yada yada nope","priceCents":100,"categoryIds":["cat_x"],"productType":"pdf","isSoftware":false}')
t "2.6 unapproved seller blocked" "403" "$R"

# Get user id from pending HTML; approve them
PEND_ID=$(echo "$H" | grep -oE 'name="userId" value="[^"]+"' | head -1 | sed 's/.*value="//;s/"//')
echo "  pending seller id: $PEND_ID"
R=$(curl -s -o /dev/null -w "%{http_code}" -b $C_ADM -X POST $BASE/api/admin/sellers/approve -d "userId=$PEND_ID")
t "2.4 admin approve" "307" "$R"

# Verify approved seller can now create products (they need fresh cookie since role changed)
curl -s -c /tmp/newseller.txt -X POST $BASE/api/auth/login -H 'Content-Type: application/json' -d '{"email":"newseller@ex.com","password":"GoodPass1!"}' >/dev/null

# ============================================================
echo "## REQ 3 — Subscription tiers"
# auto-assigned free trial (req 2.7) — fetch subscription view
H=$(curl -s -b /tmp/newseller.txt $BASE/seller/subscription)
t_match "2.7 free_trial assigned on approval" "free_trial" "$H"
# tier configurations: hit subscription page for seed seller
H=$(curl -s -b $C_SEL $BASE/seller/subscription)
t_match "3.* tier names visible" "Free Trial" "$H"
t_match "3.* basic tier visible" "Basic" "$H"
t_match "3.* pro tier visible" "Pro" "$H"
t_match "3.* enterprise tier visible" "Enterprise" "$H"

# ============================================================
echo "## REQ 4 — Paddle subscription webhook"
R=$(curl -s -X POST $BASE/api/seller/subscription/checkout -b $C_SEL -d "tierId=basic" -o /tmp/loc.txt -w "%{http_code} %{redirect_url}\n")
echo "  checkout redirect: $R"
# Simulate Paddle success for subscription
R=$(curl -s -o /dev/null -w "%{http_code}" -L -X POST $BASE/api/webhooks/paddle/simulate -d "type=subscription&checkoutId=chk1&tierId=basic&email=seller@local.dev&meta={}")
t "4.3 sub activation via webhook" "200" "$R"
H=$(curl -s -b $C_SEL $BASE/seller/subscription)
t_match "4.3 basic now active" "Tier: <b>basic" "$H"

# Simulate cancellation
curl -s -o /dev/null -X POST $BASE/api/webhooks/paddle -H 'Content-Type: application/json' -d '{"event_type":"subscription.cancelled","data":{"customer":{"email":"seller@local.dev"}}}'
H=$(curl -s -b $C_SEL $BASE/seller/subscription)
t_match "4.4 downgrade on cancel" "Tier: <b>free_trial" "$H"

# Simulate 3 payment failures → suspended
for i in 1 2 3; do
  curl -s -o /dev/null -X POST $BASE/api/webhooks/paddle -H 'Content-Type: application/json' -d '{"event_type":"subscription.payment_failed","data":{"customer":{"email":"seller@local.dev"}}}'
done
H=$(curl -s -b $C_SEL $BASE/seller/subscription)
t_match "4.7 suspended after 3 failures" "suspended" "$H"
# restore for further tests
curl -s -o /dev/null -X POST $BASE/api/webhooks/paddle/simulate -d "type=subscription&checkoutId=chk2&tierId=pro&email=seller@local.dev&meta={}"

# ============================================================
echo "## REQ 5 + 7 — Products"
# Get a category id
H=$(curl -s -b $C_SEL $BASE/seller/products/new)
CAT_ID=$(echo "$H" | grep -oE 'value="cat_[A-Za-z0-9]+"' | head -1 | sed 's/value="//;s/"//')
echo "  cat id: $CAT_ID"

R=$(curl -s -X POST $BASE/api/seller/products -b $C_SEL -H 'Content-Type: application/json' -d "{\"title\":\"Audit Product\",\"description\":\"Description for audit product testing all things\",\"priceCents\":2999,\"categoryIds\":[\"$CAT_ID\"],\"productType\":\"software\",\"isSoftware\":true}")
PID=$(echo "$R" | grep -oE 'prd_[A-Za-z0-9]+' | head -1)
echo "  product id: $PID"
t_match "5.1 product created pending_review" "pending_review" "$R"
# Catalog should not show pending
H=$(curl -s "$BASE/products?q=Audit")
if echo "$H" | grep -q "Audit Product"; then FAIL=$((FAIL+1)); RESULTS+=("FAIL: 5.5 pending product visible in catalog"); else PASS=$((PASS+1)); RESULTS+=("PASS: 5.5 pending hidden from catalog"); fi

# ============================================================
echo "## REQ 6 — Approval"
# Admin approve
curl -s -o /dev/null -X POST -b $C_ADM $BASE/api/admin/products/approve -d "productId=$PID"
H=$(curl -s "$BASE/products?q=Audit")
t_match "6.2 approved product visible" "Audit Product" "$H"

# ============================================================
echo "## REQ 7 — Catalog & search"
H=$(curl -s "$BASE/products")
t_match "7.1 catalog renders" "products?" "$H"
H=$(curl -s "$BASE/products?minPrice=20&maxPrice=50")
t_match "7.4 price filter renders" "Audit Product" "$H"
H=$(curl -s "$BASE/products?type=software")
t_match "7.7 file type filter" "Audit Product" "$H"

# ============================================================
echo "## REQ 8 — Cart"
# Cart inverse: add then remove
curl -s -b $C_CUS -c $C_CUS -X POST $BASE/api/cart/add -H 'Content-Type: application/json' -d "{\"type\":\"product\",\"id\":\"$PID\"}" >/dev/null
H=$(curl -s -b $C_CUS $BASE/cart)
t_match "8.1 add to cart" "Audit Product" "$H"
curl -s -b $C_CUS -c $C_CUS -X POST $BASE/api/cart/remove -H 'Content-Type: application/json' -d "{\"type\":\"product\",\"id\":\"$PID\"}" >/dev/null
H=$(curl -s -b $C_CUS $BASE/cart)
if echo "$H" | grep -q "Audit Product"; then FAIL=$((FAIL+1)); RESULTS+=("FAIL: 8.8 inverse cart still has item"); else PASS=$((PASS+1)); RESULTS+=("PASS: 8.8 cart inverse works"); fi

# Guest checkout blocked
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/checkout)
t "8.7 guest checkout blocked" "401" "$R"

# Discount code creation by seller
R=$(curl -s -X POST $BASE/api/seller/discounts -b $C_SEL -H 'Content-Type: application/json' -d '{"code":"AUDIT10","discountType":"percentage","discountValue":10,"applicableProductIds":[],"startDate":"2020-01-01","endDate":"2099-01-01","maxUses":null}')
t_match "13 discount created" "AUDIT10" "$R"

# Re-add to cart and apply code
curl -s -b $C_CUS -c $C_CUS -X POST $BASE/api/cart/add -H 'Content-Type: application/json' -d "{\"type\":\"product\",\"id\":\"$PID\"}" >/dev/null
R=$(curl -s -b $C_CUS -c $C_CUS -X POST $BASE/api/cart/code -H 'Content-Type: application/json' -d '{"code":"AUDIT10"}')
t_match "8.4 discount accepted" "true" "$R"

# ============================================================
echo "## REQ 9 + 11 — Checkout + license"
R=$(curl -s -b $C_CUS -X POST $BASE/api/checkout)
echo "  checkout: $R"
t_match "9.* checkout url returned" "/checkout/fake" "$R"
# Simulate purchase
curl -s -b $C_CUS -L -X POST $BASE/api/webhooks/paddle/simulate -d "type=products&checkoutId=chkX" -o /tmp/postpay.html >/dev/null
ORDER=$(grep -oE 'ord_[A-Za-z0-9]+' /tmp/postpay.html | head -1)
echo "  order id: $ORDER"
H=$(curl -s -b $C_CUS $BASE/orders/$ORDER)
t_match "9.1 order created" "Order $(echo $ORDER | cut -c-12)" "$H"
t_match "11.1 license key generated for software" "[A-Z0-9]{5}-[A-Z0-9]{5}" "$H"

# extract license key and validate via API
LIC=$(echo "$H" | grep -oE '[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}' | head -1)
echo "  license: $LIC"
R=$(curl -s -X POST $BASE/api/license/validate -H 'Content-Type: application/json' -d "{\"key\":\"$LIC\"}")
t_match "11.5 license validates" "\"valid\":true" "$R"

# Order invariant from page: subtotal should be > 0; discount applied
t_match "8.4 discount visible in order" "Discount" "$H"

# ============================================================
echo "## REQ 10 — Download"
TOK=$(echo "$H" | grep -oE '/api/download/[A-Za-z0-9_-]+' | head -1 | sed 's|/api/download/||')
echo "  download token: $TOK"
R=$(curl -s -o /tmp/dl.bin -w "%{http_code} %{content_type}\n" "$BASE/api/download/$TOK")
t_match "10.1/10.2 download serves" "200" "$R"
# Bad token rejected
R=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/download/garbagetoken")
t "10.5 bad token rejected" "404" "$R"

# ============================================================
echo "## REQ 12 — Reviews"
# Customer can review (they purchased)
R=$(curl -s -X POST $BASE/api/reviews -b $C_CUS -H 'Content-Type: application/json' -d "{\"productId\":\"$PID\",\"rating\":5,\"comment\":\"Excellent!\"}")
t_match "12.1 review submitted" "ok" "$R"
# Try to review without purchase
R=$(curl -s -X POST $BASE/api/reviews -b /tmp/newseller.txt -H 'Content-Type: application/json' -d "{\"productId\":\"$PID\",\"rating\":5,\"comment\":\"haha\"}")
t_match "12.2 prevent non-buyer review" "Must have purchased" "$R"

# Average rating shown on product
H=$(curl -s "$BASE/products/$PID")
t_match "12.4 rating shown" "Excellent" "$H"

# ============================================================
echo "## REQ 14 — Bundles"
# Create another product to bundle with
R=$(curl -s -X POST $BASE/api/seller/products -b $C_SEL -H 'Content-Type: application/json' -d "{\"title\":\"Audit P2\",\"description\":\"second product for bundle test\",\"priceCents\":1500,\"categoryIds\":[\"$CAT_ID\"],\"productType\":\"pdf\",\"isSoftware\":false}")
PID2=$(echo "$R" | grep -oE 'prd_[A-Za-z0-9]+' | head -1)
curl -s -o /dev/null -X POST -b $C_ADM $BASE/api/admin/products/approve -d "productId=$PID2"

R=$(curl -s -X POST $BASE/api/seller/bundles -b $C_SEL -H 'Content-Type: application/json' -d "{\"title\":\"Audit Bundle\",\"description\":\"two products together\",\"productIds\":[\"$PID\",\"$PID2\"],\"bundlePriceCents\":3499}")
t_match "14.1 bundle created" "Audit Bundle" "$R"
# Reject bundle priced higher than sum
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/seller/bundles -b $C_SEL -H 'Content-Type: application/json' -d "{\"title\":\"Bad\",\"description\":\"too expensive bundle\",\"productIds\":[\"$PID\",\"$PID2\"],\"bundlePriceCents\":99999}")
t "14.7 bundle invariant enforced" "400" "$R"

# ============================================================
echo "## REQ 15+16 — Affiliate"
curl -s -b $C_CUS -L -X POST $BASE/api/affiliate/register -o /tmp/aff.html >/dev/null
H=$(curl -s -b $C_CUS $BASE/affiliate/dashboard)
AFF=$(echo "$H" | grep -oE 'font-mono">[A-Z0-9]{10}' | head -1 | sed 's/font-mono">//')
echo "  affiliate id: $AFF"
t_match "15.2 affiliate id generated" "[A-Z0-9]" "$AFF"

# Click tracking
R=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/affiliate/track?aff=$AFF&p=$PID")
t "16.1 click tracking redirects" "307" "$R"

# ============================================================
echo "## REQ 21 — Admin seller management"
# set custom commission rate
curl -s -o /dev/null -X POST -b $C_ADM $BASE/api/admin/sellers/commission -d "userId=$PEND_ID&rate=2.5"
H=$(curl -s -b $C_ADM $BASE/admin/sellers)
t_match "21.6 admin sellers page" "NewBiz" "$H"

# ============================================================
echo "## REQ 22 — Refunds"
# Refund the order
R=$(curl -s -o /dev/null -w "%{http_code}" -L -X POST $BASE/api/admin/refund -b $C_ADM -d "orderId=$ORDER&productId=$PID&reason=audit")
t "22.2 refund endpoint" "200" "$R"
H=$(curl -s -b $C_CUS $BASE/orders/$ORDER)
t_match "22.6 refunded item shown" "Refunded" "$H"
# Download blocked after refund
R=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/download/$TOK")
t "22.6 download revoked" "410" "$R"

# ============================================================
echo "## REQ 26 — Categories"
R=$(curl -s -o /dev/null -w "%{http_code}" -L -X POST -b $C_ADM $BASE/api/admin/categories -d "name=AuditCat&parentId=")
t "26.1 category creation" "200" "$R"

# ============================================================
echo "## REQ 24 — Security"
# Rate limit triggers eventually
TRIPS=0
for i in $(seq 1 35); do
  R=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/auth/register -H 'Content-Type: application/json' -d '{"email":"flood@ex.com","password":"GoodPass1!","name":"F"}')
  if [ "$R" = "429" ]; then TRIPS=$((TRIPS+1)); fi
done
if [ $TRIPS -gt 0 ]; then PASS=$((PASS+1)); RESULTS+=("PASS: 24.3 rate limit triggers ($TRIPS / 35)"); else FAIL=$((FAIL+1)); RESULTS+=("FAIL: 24.3 rate limit never tripped"); fi

# Security headers
H=$(curl -s -I $BASE/)
t_match "24.* X-Frame-Options" "X-Frame-Options" "$H"
t_match "24.* X-Content-Type-Options" "X-Content-Type-Options" "$H"

# Session cookie httpOnly
H=$(curl -s -I -X POST $BASE/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@local.dev","password":"Admin123!"}')
t_match "24.* session cookie HttpOnly" "HttpOnly" "$H"

# ============================================================
echo "## REQ 27/28 — Responsive/Performance"
H=$(curl -s $BASE/)
t_match "27.4 dark/light theme provider" "ThemeProvider\\|class=\"dark\"\\|next-themes\\|class\"" "$H"

# ============================================================
echo "## REQ 30 — Config parser/serializer"
# property tested in unit; here we verify defaults round-trip via dedicated test
echo "  (config round-trip covered by tests/properties.test.ts)"

# ============================================================
echo
echo "========== RESULTS =========="
for r in "${RESULTS[@]}"; do echo "$r"; done
echo "========================================"
echo "PASS: $PASS"
echo "FAIL: $FAIL"
