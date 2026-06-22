const prisma = require("../db/db")

class Order {
  static async fetchAll() {
    return prisma.order.findMany({
      orderBy: { id: "asc" },
    })
  }

  static async fetchById(orderId) {
    return prisma.order.findUnique({
      where: { id: orderId },
    })
  }

  static async create(data) {
    return prisma.order.create({ data })
  }

  static async update(orderId, data) {
    return prisma.order.update({
      where: { id: orderId },
      data,
    })
  }

  static async delete(orderId) {
    return prisma.order.delete({
      where: { id: orderId },
    })
  }
}

module.exports = Order
