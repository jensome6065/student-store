const prisma = require("../db/db")

class Product {
  static async fetchAll() {
    return prisma.product.findMany({
      orderBy: { id: "asc" },
    })
  }

  static async fetchById(productId) {
    return prisma.product.findUnique({
      where: { id: productId },
    })
  }

  static async create(data) {
    return prisma.product.create({ data })
  }

  static async update(productId, data) {
    return prisma.product.update({
      where: { id: productId },
      data,
    })
  }

  static async delete(productId) {
    return prisma.product.delete({
      where: { id: productId },
    })
  }
}

module.exports = Product
