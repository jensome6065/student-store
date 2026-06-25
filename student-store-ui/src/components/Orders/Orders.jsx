import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { formatPrice, formatDate } from "../../utils/format";
import "./Orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [emailFilter, setEmailFilter] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const url = emailFilter
          ? `http://localhost:3001/orders?email=${encodeURIComponent(emailFilter)}`
          : "http://localhost:3001/orders";
        const response = await axios.get(url);
        setOrders(response.data.orders);
      } catch (err) {
        setError(err.message || "Failed to fetch orders");
      } finally {
        setIsFetching(false);
      }
    };

    fetchOrders();
  }, [emailFilter]);

  const handleFilterChange = (event) => {
    setEmailFilter(event.target.value);
  };

  return (
    <div className="Orders">
      <div className="orders-header">
        <h1>Past Orders</h1>
        <div className="filter-section">
          <input
            type="text"
            placeholder="Filter by email"
            value={emailFilter}
            onChange={handleFilterChange}
            className="email-filter"
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isFetching ? (
        <div className="loading">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="no-orders">
          {emailFilter ? `No orders found for email: ${emailFilter}` : "No orders yet"}
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link to={`/orders/${order.id}`} key={order.id} className="order-card">
              <div className="order-header-row">
                <div className="order-id">Order #{order.id}</div>
                <div className="order-status">{order.status}</div>
              </div>
              <div className="order-details">
                <div className="order-info">
                  <p className="customer-name">{order.customer_name}</p>
                  <p className="customer-email">{order.customer_email}</p>
                </div>
                <div className="order-meta">
                  <p className="order-date">{formatDate(order.created_at)}</p>
                  <p className="order-total">{formatPrice(order.total_price)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
