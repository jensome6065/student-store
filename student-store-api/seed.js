const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')
const path = require('path')

async function seed() {
  try {
    console.log('🌱 Seeding database...\n')

    // Clear existing data (in order due to relations)
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.product.deleteMany()

    // Load JSON data
    const productsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf8')
    )

    const ordersData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data/orders.json'), 'utf8')
    )

    // Seed products
    for (const product of productsData.products) {
      const created = await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.image_url,
          category: product.category,
        },
      })
      console.log(`✅ Created product #${created.id}: ${created.name}`)
    }

    console.log(`\n📦 Seeded ${productsData.products.length} products\n`)

    // Get the first product ID to map old order references
    const firstProduct = await prisma.product.findFirst({ orderBy: { id: 'asc' } })
    const productIdOffset = firstProduct.id - 1

    // Seed orders and items
    for (const order of ordersData.orders) {
      const createdOrder = await prisma.order.create({
        data: {
          customerName: `Customer ${order.customer_id}`,
          customerEmail: `customer${order.customer_id}@example.com`,
          shippingAddress: `${order.customer_id} Main St`,
          totalPrice: order.total_price,
          status: order.status,
          createdAt: new Date(order.created_at),
          items: {
            create: order.items.map((item) => ({
              productId: item.product_id + productIdOffset,
              quantity: item.quantity,
              unitPrice: item.price,
              lineTotal: item.quantity * item.price,
            })),
          },
        },
      })

      console.log(`✅ Created order #${createdOrder.id}`)
    }

    console.log('\n🎉 Seeding complete!')
  } catch (err) {
    console.error('❌ Error seeding:', err)
  } finally {
    await prisma.$disconnect()
  }
}

seed()
