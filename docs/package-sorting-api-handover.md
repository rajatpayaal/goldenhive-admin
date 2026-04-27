# Package Sorting API Handover

## Scope
This note covers APIs related to package sorting and how UI should consume them.

## 1) List Category Packages
- Method: `GET`
- URL: `/api/package-sorting/category/:categoryId`
- Query:
  - `limit` (optional, default `200`, max `500`)
- Auth: `Bearer` token required (admin flow)
- Behavior:
  - Returns category packages sorted by:
    1. `sortOrder` ascending
    2. `createdAt` ascending

Example:
```bash
curl "http://localhost:8000/api/package-sorting/category/680f1234abcd5678ef901111?limit=200" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

UI expectation:
- Use this endpoint as source of truth for rendering list/order.

## 2) Update Package Sort Order
- Method: `PATCH`
- URL: `/api/package-sorting/:id/order`
- Auth: `Bearer` token required (admin flow)
- Body:
```json
{ "newOrder": 3 }
```

Behavior:
- Finds target package by `:id`
- Clamps requested order to valid range `1..lastOrder`
- If requested order equals current order: unchanged response
- If another package exists at requested order: swap/update is handled server-side

Example:
```bash
curl -X PATCH "http://localhost:8000/api/package-sorting/680f1234abcd5678ef901234/order" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"newOrder":3}'
```

UI expectation:
- On success: re-fetch category list (`GET /category/:categoryId`) and redraw.
- Avoid trusting local optimistic order as final truth.

## 3) Mini Suggestions
- Method: `GET`
- URL: `/api/package-sorting/mini-suggestions`
- Query:
  - `categoryId` (required)
  - `limit` (optional, default `6`, max `20`)
- Behavior:
  - Returns only active packages in sorted order.

## 4) Package Create/Update Side Effects

### `POST /api/packages`
- If `sortOrder` is missing or `<= 0`, backend auto-assigns next category sort order.
- Backfill logic may normalize older invalid/missing `sortOrder` records.

### `PUT /api/packages/:id`
- If category changes, backend may assign new sort order for target category.
- If existing sort order is invalid, backend may auto-correct to next valid order.

### `GET /api/packages`
- Backend can run backfill before listing to stabilize ordering data.

UI implication:
- Always read fresh list data from API after create/update flows when order matters.

## 5) Error Handling (UI Mapping)
- `400` + `SORT_ORDER_REQUIRED`: invalid/missing `newOrder`
- `404` + `PACKAGE_NOT_FOUND`: invalid package id
- `401` / `403`: auth token missing/invalid or role not allowed
- `429`: too many requests (typically non-admin users)

Recommended UI behavior:
- Show API `message` if present.
- Otherwise show status-aware fallback text.

## 6) Rate Limiter Notes
- Scope: `/api/*`
- Admin users: bypass
- Non-admin authenticated users: `100 requests / 15 min` using IP+role key
- Limit exceeded: `429 Too many requests`

## 7) UI Flow Summary
1. Load: `GET /api/package-sorting/category/:categoryId?limit=200`
2. Reorder: `PATCH /api/package-sorting/:id/order` with `{ newOrder }`
3. On success: immediately re-fetch Step 1
4. On failure: map status/code and show actionable error
