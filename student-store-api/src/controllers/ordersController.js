const Order = require("../models/order")
const { toApiOrder } = require("../utils/serializers")
const { parseId, validateOrderCreateBody } = require("../utils/validators")

const listOrders = async (req, res) => {
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
}

const getOrderById = async (req, res) => {
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
}

const createOrder = async (req, res) => {
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
}

const updateOrder = async (req, res) => {
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
}

const deleteOrder = async (req, res) => {
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
}

module.exports = {
  listOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
}
