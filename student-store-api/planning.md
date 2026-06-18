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
