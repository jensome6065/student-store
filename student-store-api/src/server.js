const express = require("express")
const cors = require("cors")
const productsRouter = require("./routes/products")
const ordersRouter = require("./routes/orders")

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Student Store API is running." })
})

app.use("/products", productsRouter)
app.use("/orders", ordersRouter)

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})

