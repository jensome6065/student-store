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

module.exports = {
  parseId,
  validateProductBody,
  validateOrderCreateBody,
}
