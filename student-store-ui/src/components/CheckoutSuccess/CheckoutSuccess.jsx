import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../utils/format";
import "./CheckoutSuccess.css";

const CheckoutSuccess = ({ order, setOrder, closeSidebar }) => {
  const navigate = useNavigate();

  const handleOnClose = (event) => {
    event.stopPropagation();
    setOrder(null);
    closeSidebar();
  };

  const handleOnShopMore = (event) => {
    event.stopPropagation();
    setOrder(null);
    closeSidebar();
    navigate("/");
  };

  const handleOnViewOrder = (event) => {
    event.stopPropagation();
    setOrder(null);
    closeSidebar();
    navigate(`/orders/${order.id}`);
  };

  if (!order) {
    return null;
  }

  return (
    <div className="CheckoutSuccess">
      <button className="close-sidebar-button" type="button" onClick={handleOnClose} aria-label="Close sidebar">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6L18 18M18 6L6 18" />
        </svg>
      </button>
      <h3>
        Order Confirmed{" "}
        <span className={`icon button`}>
          <i className="material-icons md-48">fact_check</i>
        </span>
      </h3>
      <div className="card">
        <h4 className="card-title">Order #{order.id}</h4>

        <p className="confirmation-message">
          Thank you, {order.customer_name}! Your order has been placed successfully.
        </p>

        <div className="order-quick-info">
          <div className="info-item">
            <span className="info-label">Total</span>
            <span className="info-value">{formatPrice(order.total_price)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Items</span>
            <span className="info-value">{order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Status</span>
            <span className="info-value status-badge">{order.status}</span>
          </div>
        </div>

        <p className="delivery-info">
          A confirmation email will be sent to {order.customer_email}.
        </p>

        <div className="card-foot">
          <button className="button" onClick={handleOnViewOrder}>
            View Order
          </button>
          <button className="button is-success" onClick={handleOnShopMore}>
            Shop More
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
