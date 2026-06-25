const express = require("express")
const {
  listOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/ordersController")

const router = express.Router()

router.get("/", listOrders)
router.get("/:orderId", getOrderById)
router.post("/", createOrder)
router.put("/:orderId", updateOrder)
router.delete("/:orderId", deleteOrder)

module.exports = router
