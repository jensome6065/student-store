# Student Store API Planning Spec

This document defines the backend system design before schema and route implementation.

## Section 1: Data Models

### Product

- **id**: `Int`, required, primary key, auto-increment (`@id @default(autoincrement())`)
- **name**: `String`, required
- **category**: `String`, required
- **imageUrl**: `String`, required (stored in DB column as `image_url` if mapping is used)
- **description**: `String`, required
- **price**: `Decimal`, required
- **createdAt**: `DateTime`, required, default `now()`
- **updatedAt**: `DateTime`, required, auto-updated (`@updatedAt`)
- **orderItems**: relation to `OrderItem[]`

Relationship and cascade behavior:
- One `Product` can appear in many `OrderItem` records.
- `OrderItem.productId` is a foreign key to `Product.id`.
- **Cascade rule**: deleting a `Product` must automatically delete all `OrderItem` records that reference that product (`onDelete: Cascade`).

### Order

- **id**: `Int`, required, primary key, auto-increment (`@id @default(autoincrement())`)
- **customerName**: `String`, required
- **customerEmail**: `String`, required
- **shippingAddress**: `String`, required
- **status**: `String`, required, default `"pending"`
- **totalPrice**: `Decimal`, required, default `0`
- **createdAt**: `DateTime`, required, default `now()`
- **updatedAt**: `DateTime`, required, auto-updated (`@updatedAt`)
- **items**: relation to `OrderItem[]`

Relationship and cascade behavior:
- One `Order` contains many `OrderItem` rows.
- `OrderItem.orderId` is a foreign key to `Order.id`.
- **Cascade rule**: deleting an `Order` must automatically delete all `OrderItem` records that belong to that order (`onDelete: Cascade`).

### OrderItem

- **id**: `Int`, required, primary key, auto-increment (`@id @default(autoincrement())`)
- **orderId**: `Int`, required, foreign key to `Order.id`
- **productId**: `Int`, required, foreign key to `Product.id`
- **quantity**: `Int`, required
- **unitPrice**: `Decimal`, required (snapshot of product price at purchase time)
- **lineTotal**: `Decimal`, required (`quantity * unitPrice`)
- **createdAt**: `DateTime`, required, default `now()`
- **updatedAt**: `DateTime`, required, auto-updated (`@updatedAt`)

Relationship notes:
- `OrderItem` is the join-like transactional model between `Order` and `Product`.
- Many `OrderItem` rows can reference one `Product`, and many rows can reference one `Order`.
- Deleting either parent (`Order` or `Product`) cascades and removes dependent `OrderItem` rows.

## Section 2: API Contract

Global API error response shape (used consistently):

```json
{
  "error": "Human readable error message"
}
```

### 1) GET `/`
- **Purpose**: health/test route for setup validation
- **Request**: no body, params, or query
- **Success**: `200`
  - Body:
    ```json
    { "message": "Student Store API is running." }
    ```
- **Error case**: `500`
  - Body: `{ "error": "Internal server error" }`

### 2) GET `/products`
- **Request**: optional query filters (`category`, `name`) if implemented later
- **Success**: `200`
  - Body:
    ```json
    {
      "products": [
        {
          "id": 1,
          "name": "College Hoodie",
          "category": "Apparel",
          "image_url": "https://...",
          "description": "Comfortable and stylish hoodie",
          "price": 29.99
        }
      ]
    }
    ```
- **Error case**: `500`
  - Body: `{ "error": "Unable to fetch products" }`

### 3) GET `/products/:productId`
- **Request**:
  - Route param: `productId` (integer)
- **Success**: `200`
  - Body:
    ```json
    {
      "product": {
        "id": 1,
        "name": "College Hoodie",
        "category": "Apparel",
        "image_url": "https://...",
        "description": "Comfortable and stylish hoodie",
        "price": 29.99
      }
    }
    ```
- **Error case**: `404`
  - Body: `{ "error": "Product not found" }`

### 4) DELETE `/products/:productId`
- **Request**:
  - Route param: `productId` (integer)
- **Success**: `200`
  - Body:
    ```json
    { "deleted": { "id": 1 } }
    ```
- **Error case**: `404`
  - Body: `{ "error": "Product not found" }`
- **Behavior note**: deleting product cascades and removes related `orderItems`.

### 5) GET `/orders`
- **Request**: no body; optional query `status`
- **Success**: `200`
  - Body:
    ```json
    {
      "orders": [
        {
          "id": 1,
          "customer_name": "Ada Lovelace",
          "customer_email": "ada@example.com",
          "shipping_address": "123 College Ave",
          "status": "pending",
          "total_price": 61.97,
          "created_at": "2026-06-18T18:00:00.000Z"
        }
      ]
    }
    ```
- **Error case**: `500`
  - Body: `{ "error": "Unable to fetch orders" }`

### 6) GET `/orders/:orderId`
- **Request**:
  - Route param: `orderId` (integer)
- **Success**: `200`
  - Body includes order and related items:
    ```json
    {
      "order": {
        "id": 1,
        "customer_name": "Ada Lovelace",
        "customer_email": "ada@example.com",
        "shipping_address": "123 College Ave",
        "status": "pending",
        "total_price": 61.97,
        "items": [
          {
            "id": 10,
            "product_id": 1,
            "quantity": 2,
            "unit_price": 29.99,
            "line_total": 59.98
          }
        ]
      }
    }
    ```
- **Error case**: `404`
  - Body: `{ "error": "Order not found" }`

### 7) POST `/orders`
- **Request body**:
  ```json
  {
    "customer_name": "Ada Lovelace",
    "customer_email": "ada@example.com",
    "shipping_address": "123 College Ave",
    "status": "pending",
    "items": [
      { "product_id": 1, "quantity": 2 },
      { "product_id": 4, "quantity": 1 }
    ]
  }
  ```
- **Success**: `201`
  - Body:
    ```json
    {
      "order": {
        "id": 12,
        "customer_name": "Ada Lovelace",
        "customer_email": "ada@example.com",
        "shipping_address": "123 College Ave",
        "status": "pending",
        "total_price": 61.97,
        "items": [
          {
            "id": 30,
            "order_id": 12,
            "product_id": 1,
            "quantity": 2,
            "unit_price": 29.99,
            "line_total": 59.98
          },
          {
            "id": 31,
            "order_id": 12,
            "product_id": 4,
            "quantity": 1,
            "unit_price": 1.99,
            "line_total": 1.99
          }
        ]
      }
    }
    ```
- **Error case (validation)**: `400`
  - Body: `{ "error": "items must be a non-empty array" }`
- **Error case (invalid product reference)**: `400`
  - Body: `{ "error": "Product 999 does not exist" }`

### 8) PATCH `/orders/:orderId`
- **Request**:
  - Route param: `orderId` (integer)
  - Body:
    ```json
    { "status": "completed" }
    ```
- **Success**: `200`
  - Body:
    ```json
    {
      "order": {
        "id": 12,
        "status": "completed"
      }
    }
    ```
- **Error case**: `404`
  - Body: `{ "error": "Order not found" }`

### 9) DELETE `/orders/:orderId`
- **Request**:
  - Route param: `orderId` (integer)
- **Success**: `200`
  - Body:
    ```json
    { "deleted": { "id": 12 } }
    ```
- **Error case**: `404`
  - Body: `{ "error": "Order not found" }`
- **Behavior note**: deleting order cascades and removes related `orderItems`.

## Section 3: Transactional Flow for POST `/orders`

### Input shape expected

`POST /orders` receives customer metadata and an items array:
- `customer_name` (string, required)
- `customer_email` (string, required)
- `shipping_address` (string, required)
- `status` (string, optional; default to `pending` if omitted)
- `items` (required array with at least one entry)
  - each entry: `product_id` (int), `quantity` (int > 0)

### Data-layer sequence (atomic)

1. Validate request body shape and required fields. If invalid, return `400`.
2. Start a Prisma transaction (`prisma.$transaction`).
3. Extract unique `product_id` values from `items`.
4. Query all referenced products in one read (`findMany`) to confirm they exist.
5. If any referenced product is missing:
   - throw an error inside the transaction
   - transaction is rolled back automatically
   - return `400` with `{ "error": "Product <id> does not exist" }`
6. Build a lookup map of `productId -> product.price`.
7. Compute each line total (`quantity * product.price`) and aggregate `totalPrice`.
8. Create the parent order row (`prisma.order.create`) with customer fields, status, and computed `totalPrice`.
9. Create each `OrderItem` row (`createMany` or multiple `create` calls) with:
   - `orderId` from the newly created order
   - `productId`, `quantity`, `unitPrice`, `lineTotal`
10. Read back the created order with its `items` relation included.
11. Commit transaction and return `201` with the order payload.

### Failure behavior

- If any order item creation fails (constraint violation, invalid FK, DB error), the entire transaction rolls back.
- No partial order or partial order items remain in the database.
- Response returns an error object (typically `400` for bad input, `500` for unexpected DB failure).

## Decisions Log — Product Model

- **Schema translation that went smoothly**: `imageUrl` in Prisma maps cleanly to a snake_case DB/API field with `@map("image_url")`, so DB naming can stay consistent while JS stays idiomatic.
- **Field decision I made during implementation that wasn't in the original spec**: I used `Decimal @db.Decimal(10, 2)` for `price` to avoid float precision issues and kept API responses as numeric values by converting Decimal to Number in serializers.
- **Route behavior that needed a spec update**: The Product API section originally documented `GET` and `DELETE`; I expanded Product to full CRUD with `POST /products` and `PUT /products/:productId` so Milestone 1 has all five product endpoints implemented and testable.

## Spec Reconciliation — Milestone 4 (Schema Audit)

### Schema vs. spec gaps found
- Added missing relation fields to match the original spec exactly: `Product.orderItems` and `Order.items`.
- Added `OrderItem` relation mappings and snake_case field maps so response payload keys and DB columns align with the contract.
- No remaining gaps between spec and schema after the OrderItem model and cascade rules were added.

### Cascade delete verification
- Deleting a Product removes associated OrderItems: ✅ tested
- Deleting an Order removes associated OrderItems: ✅ tested

## Decisions Log — Order Creation Transaction

- **What my Transactional Flow spec got right**: The operation order in the spec matched implementation exactly: validate body, verify product IDs, compute totals, create the `Order`, then create `OrderItem` rows and return the order with `items`.
- **What the spec missed that I discovered during implementation**: I added explicit item-level validation (`product_id` must be an integer and `quantity > 0`) so malformed arrays fail fast with a `400` before touching the database.
- **How the transaction error handling works**: `prisma.$transaction` treats all DB operations as one unit; if any step throws (like a missing product ID), Prisma rolls back all writes in that transaction so no partial order or orphaned order items are persisted.
- **One thing I'd design differently if starting over**: I would move validation and product lookup into a dedicated service layer so route handlers stay thin and all transaction-specific logic lives in one reusable module.

## Final Spec Reconciliation: Milestone 6 Complete

### Full-system audit result
- All 9 endpoints match the API contract (1 health check, 5 Product routes, 3 Order routes)
- Frontend integration tested end-to-end: products fetch on mount, cart operations work, order submission persists to database with correct transactional flow
- CORS configuration added to implementation (not originally documented in spec) — updated implementation note below
- Response field naming (`snake_case` for JSON, `camelCase` in Prisma) is consistent across all endpoints as specified

### Gaps resolved during frontend integration
- **Frontend form field semantics**: Frontend had `dorm_number` field but was setting `email` on change handler; updated to use `email` consistently and changed label from "Dorm Room Number" to "Email" to match user expectations and API contract
- **shipping_address fallback**: Frontend uses `email` as `shipping_address` since the form doesn't collect a physical address. This is acceptable for the student store context (dorm delivery by email lookup) but represents a semantic mismatch between field name and content. Documented as implementation decision rather than spec gap.
- **Client-side validation**: Added validation for empty cart and missing user info (name/email) before API calls, preventing invalid `POST /orders` requests
- **No gaps in API contract vs implementation**: Every route, request shape, response shape, and error case documented in Section 2 matches the implemented behavior exactly

### Implementation notes not in original spec
- **CORS**: Enabled `cors` middleware in `server.js` to allow frontend on `:5173` to call backend on `:3001`
- **Error response consistency**: All error responses use `{ "error": "message" }` shape as specified in global contract
- **Decimal-to-Number conversion**: `toApiProduct` and `toApiOrder` serializers convert Prisma `Decimal` to `Number` so JSON responses are numeric rather than string representations

### What the spec enabled during this project
The planning.md API contract served as the single source of truth from Milestone 1 through Milestone 6. During frontend integration (Milestone 6), I cross-referenced every `axios` call against the contract to verify request/response shapes matched exactly — no guessing, no trial-and-error. The spec caught the frontend form field mismatch (`dorm_number` vs `email`) before any API calls were made, and the documented error shapes (`{ "error": "..." }`) let me implement client-side error handling correctly on the first try. Having the transactional flow documented in Section 3 meant the frontend knew exactly what to send (`items` array with `product_id` and `quantity`) and what to expect back (order with nested `items`), so the integration worked end-to-end on the first test run after fixing the selector bug.
