const Product = require("../models/product")
const { toApiProduct } = require("../utils/serializers")
const { parseId, validateProductBody } = require("../utils/validators")

const listProducts = async (req, res) => {
  try {
    const products = await Product.fetchAll()
    return res.status(200).json({ products: products.map(toApiProduct) })
  } catch (error) {
    return res.status(500).json({ error: "Unable to fetch products" })
  }
}

const getProductById = async (req, res) => {
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
}

const createProduct = async (req, res) => {
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
}

const updateProduct = async (req, res) => {
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
}

const deleteProduct = async (req, res) => {
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
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
}
