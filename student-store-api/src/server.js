const express = require("express")
const Product = require("./models/product")

const app = express()
const PORT = process.env.PORT || 3001

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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})

