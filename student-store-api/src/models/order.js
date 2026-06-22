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

  static async fetchByIdWithItems(orderId) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })
  }

  static async create(data) {
    return prisma.order.create({ data })
  }

  static async createWithItems(data) {
    return prisma.$transaction(async (tx) => {
      const productIds = [...new Set(data.items.map((item) => item.product_id))]
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      })

      if (products.length !== productIds.length) {
        const foundIds = new Set(products.map((product) => product.id))
        const missingId = productIds.find((id) => !foundIds.has(id))
        throw new Error(`Product ${missingId} does not exist`)
      }

      const priceByProductId = new Map(products.map((product) => [product.id, Number(product.price)]))
      const orderItems = data.items.map((item) => {
        const unitPrice = priceByProductId.get(item.product_id)
        const lineTotal = unitPrice * item.quantity
        return {
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice,
          lineTotal,
        }
      })

      const totalPrice = orderItems.reduce((sum, item) => sum + item.lineTotal, 0)

      const order = await tx.order.create({
        data: {
          customerName: data.customer_name,
          customerEmail: data.customer_email,
          shippingAddress: data.shipping_address,
          status: data.status ?? "pending",
          totalPrice,
        },
      })

      await tx.orderItem.createMany({
        data: orderItems.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
      })

      return tx.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      })
    })
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
