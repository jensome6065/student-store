const express = require("express")
const {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productsController")

const router = express.Router()

router.get("/", listProducts)
router.get("/:productId", getProductById)
router.post("/", createProduct)
router.put("/:productId", updateProduct)
router.delete("/:productId", deleteProduct)

module.exports = router
