const express = require("express")

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Student Store API is running." })
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})

