const prisma = require("../db/db")

class OrderItem {
  static async createMany(items) {
    return prisma.orderItem.createMany({
      data: items,
    })
  }

  static async fetchByOrderId(orderId) {
    return prisma.orderItem.findMany({
      where: { orderId },
      orderBy: { id: "asc" },
    })
  }
}

module.exports = OrderItem
