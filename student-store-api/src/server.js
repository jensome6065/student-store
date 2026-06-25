const express = require("express")
const cors = require("cors")
const Product = require("./models/product")
const Order = require("./models/order")

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Student Store API is running." })
})

const toApiProduct = (product) => {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    image_url: product.imageUrl,
    description: product.description,
    price: Number(product.price),
  }
}

const toApiOrder = (order) => {
  const payload = {
    id: order.id,
    customer_name: order.customerName,
    customer_email: order.customerEmail,
    shipping_address: order.shippingAddress,
    status: order.status,
    total_price: Number(order.totalPrice),
    created_at: order.createdAt,
  }

  if (order.items) {
    payload.items = order.items.map((item) => ({
      id: item.id,
      order_id: item.orderId,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: Number(item.unitPrice),
      line_total: Number(item.lineTotal),
    }))
  }

  return payload
}

const parseId = (value) => {
  const id = Number.parseInt(value, 10)
  if (Number.isNaN(id)) return null
  return id
}

const validateProductBody = (body) => {
  const { name, category, image_url, description, price } = body
  if (!name || !category || !image_url || !description || price === undefined) {
    return "name, category, image_url, description, and price are required"
  }

  const parsedPrice = Number(price)
  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    return "price must be a non-negative number"
  }

  return null
}

const validateOrderCreateBody = (body) => {
  const { customer_name, customer_email, shipping_address, status, items } = body
  if (!customer_name || !customer_email || !shipping_address) {
    return "customer_name, customer_email, and shipping_address are required"
  }

  if (status !== undefined && typeof status !== "string") {
    return "status must be a string"
  }

  if (!Array.isArray(items) || items.length === 0) {
    return "items must be a non-empty array"
  }

  for (const item of items) {
    if (!Number.isInteger(item.product_id) || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      return "each item must include integer product_id and quantity > 0"
    }
  }

  return null
}

app.get("/products", async (req, res) => {
  try {
    const products = await Product.fetchAll()
    return res.status(200).json({ products: products.map(toApiProduct) })
  } catch (error) {
    return res.status(500).json({ error: "Unable to fetch products" })
  }
})

app.get("/products/:productId", async (req, res) => {
  const productId = parseId(req.params.productId)
  if (!productId) {
    return res.status(400).json({ error: "Invalid product id" })
  }

  try {
    const product = await Product.fetchById(productId)
    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    return res.status(200).json({ product: toApiProduct(product) })
  } catch (error) {
    return res.status(500).json({ error: "Unable to fetch product" })
  }
})

app.post("/products", async (req, res) => {
  const validationError = validateProductBody(req.body)
  if (validationError) {
    return res.status(400).json({ error: validationError })
  }

  try {
    const product = await Product.create({
      name: req.body.name,
      category: req.body.category,
      imageUrl: req.body.image_url,
      description: req.body.description,
      price: Number(req.body.price),
    })

    return res.status(201).json({ product: toApiProduct(product) })
  } catch (error) {
    return res.status(500).json({ error: "Unable to create product" })
  }
})

app.put("/products/:productId", async (req, res) => {
  const productId = parseId(req.params.productId)
  if (!productId) {
    return res.status(400).json({ error: "Invalid product id" })
  }

  const validationError = validateProductBody(req.body)
  if (validationError) {
    return res.status(400).json({ error: validationError })
  }

  try {
    const product = await Product.update(productId, {
      name: req.body.name,
      category: req.body.category,
      imageUrl: req.body.image_url,
      description: req.body.description,
      price: Number(req.body.price),
    })

    return res.status(200).json({ product: toApiProduct(product) })
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Product not found" })
    }
    return res.status(500).json({ error: "Unable to update product" })
  }
})

app.delete("/products/:productId", async (req, res) => {
  const productId = parseId(req.params.productId)
  if (!productId) {
    return res.status(400).json({ error: "Invalid product id" })
  }

  try {
    const deleted = await Product.delete(productId)
    return res.status(200).json({ deleted: { id: deleted.id } })
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Product not found" })
    }
    return res.status(500).json({ error: "Unable to delete product" })
  }
})

app.get("/orders", async (req, res) => {
  try {
    const filters = {}
    if (req.query.email) {
      filters.customerEmail = req.query.email
    }

    const orders = await Order.fetchAll(filters)
    return res.status(200).json({ orders: orders.map(toApiOrder) })
  } catch (error) {
    return res.status(500).json({ error: "Unable to fetch orders" })
  }
})

app.get("/orders/:orderId", async (req, res) => {
  const orderId = parseId(req.params.orderId)
  if (!orderId) {
    return res.status(400).json({ error: "Invalid order id" })
  }

  try {
    const order = await Order.fetchByIdWithItems(orderId)
    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }
    return res.status(200).json({ order: toApiOrder(order) })
  } catch (error) {
    return res.status(500).json({ error: "Unable to fetch order" })
  }
})

app.post("/orders", async (req, res) => {
  const validationError = validateOrderCreateBody(req.body)
  if (validationError) {
    return res.status(400).json({ error: validationError })
  }

  try {
    const order = await Order.createWithItems(req.body)
    return res.status(201).json({ order: toApiOrder(order) })
  } catch (error) {
    if (error.message && error.message.startsWith("Product ")) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: "Unable to create order" })
  }
})

app.patch("/orders/:orderId", async (req, res) => {
  const orderId = parseId(req.params.orderId)
  if (!orderId) {
    return res.status(400).json({ error: "Invalid order id" })
  }

  if (!req.body.status || typeof req.body.status !== "string") {
    return res.status(400).json({ error: "status is required and must be a string" })
  }

  try {
    const order = await Order.update(orderId, { status: req.body.status })
    return res.status(200).json({ order: { id: order.id, status: order.status } })
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Order not found" })
    }
    return res.status(500).json({ error: "Unable to update order" })
  }
})

app.delete("/orders/:orderId", async (req, res) => {
  const orderId = parseId(req.params.orderId)
  if (!orderId) {
    return res.status(400).json({ error: "Invalid order id" })
  }

  try {
    const deleted = await Order.delete(orderId)
    return res.status(200).json({ deleted: { id: deleted.id } })
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Order not found" })
    }
    return res.status(500).json({ error: "Unable to delete order" })
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})

