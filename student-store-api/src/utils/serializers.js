const toApiProduct = (product) => {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    image_url: product.imageUrl,
    description: product.description,
    price: Number(product.price),
  }
}

const toApiOrder = (order) => {
  const payload = {
    id: order.id,
    customer_name: order.customerName,
    customer_email: order.customerEmail,
    shipping_address: order.shippingAddress,
    status: order.status,
    total_price: Number(order.totalPrice),
    created_at: order.createdAt,
  }

  if (order.items) {
    payload.items = order.items.map((item) => ({
      id: item.id,
      order_id: item.orderId,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: Number(item.unitPrice),
      line_total: Number(item.lineTotal),
    }))
  }

  return payload
}

module.exports = {
  toApiProduct,
  toApiOrder,
}
