import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/format";
import "./CheckoutSuccess.css";

const CheckoutSuccess = ({ order, setOrder }) => {
  const handleOnClose = () => {
    setOrder(null);
  };

  if (!order) {
    return null;
  }

  return (
    <div className="CheckoutSuccess">
      <h3>
        Order Confirmed{" "}
        <span className={`icon button`}>
          <i className="material-icons md-48">fact_check</i>
        </span>
      </h3>
      <div className="card">
        <header className="card-head">
          <h4 className="card-title">Order #{order.id}</h4>
        </header>
        <section className="card-body">
          <div className="order-summary">
            <p className="confirmation-message">
              Thank you, {order.customer_name}! Your order has been placed successfully.
            </p>
            <div className="order-details">
              <p><strong>Email:</strong> {order.customer_email}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total:</strong> {formatPrice(order.total_price)}</p>
              <p><strong>Items:</strong> {order.items?.length || 0} item(s)</p>
            </div>
            <p className="delivery-info">
              A confirmation email will be sent to you. Once confirmed, your order will be delivered to your dorm room.
            </p>
          </div>
        </section>
        <footer className="card-foot">
          <Link to={`/orders/${order.id}`}>
            <button className="button">View Order</button>
          </Link>
          <button className="button is-success" onClick={handleOnClose}>
            Shop More
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
