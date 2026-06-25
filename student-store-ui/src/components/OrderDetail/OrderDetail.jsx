import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { formatPrice, formatDate } from "../../utils/format";
import "./OrderDetail.css";

function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderAndProducts = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const [orderResponse, productsResponse] = await Promise.all([
          axios.get(`http://localhost:3001/orders/${orderId}`),
          axios.get("http://localhost:3001/products")
        ]);
        setOrder(orderResponse.data.order);
        setProducts(productsResponse.data.products);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Order not found");
        } else {
          setError(err.message || "Failed to fetch order");
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchOrderAndProducts();
  }, [orderId]);

  if (isFetching) {
    return <div className="OrderDetail loading">Loading order details...</div>;
  }

  if (error) {
    return (
      <div className="OrderDetail">
        <div className="error-message">{error}</div>
        <Link to="/orders" className="back-link">
          &larr; Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="OrderDetail">
      <Link to="/orders" className="back-link">
        &larr; Back to Orders
      </Link>

      <div className="order-summary">
        <div className="summary-header">
          <h1>Order #{order.id}</h1>
          <div className="header-actions">
            <div className="order-status">{order.status}</div>
          </div>
        </div>

        <div className="order-info-grid">
          <div className="info-section">
            <h3>Customer Information</h3>
            <p className="info-label">Name</p>
            <p className="info-value">{order.customer_name}</p>
            <p className="info-label">Email</p>
            <p className="info-value">{order.customer_email}</p>
          </div>

          <div className="info-section">
            <h3>Order Details</h3>
            <p className="info-label">Order Date</p>
            <p className="info-value">{formatDate(order.created_at)}</p>
          </div>
        </div>
      </div>

      <div className="order-items">
        <h2>Order Items</h2>
        {order.items && order.items.length > 0 ? (
          <div className="items-list">
            {order.items.map((item) => {
              const product = products.find((p) => p.id === item.product_id);
              return (
                <div key={item.id} className="order-item">
                  {product ? (
                    <Link to={`/${product.id}`} className="item-image-link">
                      <div className="item-image">
                        <img src={product.image_url} alt={product.name} />
                      </div>
                    </Link>
                  ) : null}
                  <div className="item-info">
                    {product ? (
                      <Link to={`/${product.id}`} className="item-product-link">
                        <p className="item-product">{product.name}</p>
                      </Link>
                    ) : (
                      <p className="item-product">Product ID: {item.product_id}</p>
                    )}
                    <p className="item-quantity">Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-pricing">
                    <p className="item-unit-price">{formatPrice(item.unit_price)} each</p>
                    <p className="item-total">{formatPrice(item.line_total)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="no-items">No items in this order</p>
        )}
      </div>

      <div className="order-total-section">
        <div className="total-row">
          <span className="total-label">Total</span>
          <span className="total-amount">{formatPrice(order.total_price)}</span>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
