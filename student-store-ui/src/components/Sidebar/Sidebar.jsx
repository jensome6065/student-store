import React from "react"
import { Link } from "react-router-dom"
import ShoppingCart from "../ShoppingCart/ShoppingCart"
import logo from "../../assets/codepath.svg"
import "./Sidebar.css"


function Sidebar({ cart, isOpen, products, userInfo, setUserInfo, toggleSidebar, handleOnCheckout,isCheckingOut, order, setOrder,error,}) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const hoverTimeoutRef = React.useRef(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    // If order is confirmed, allow closing
    if (order) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
        setHasInteracted(false);
      }, 300);
      return;
    }

    // Don't close if user has interacted with inputs or if checking out
    if (hasInteracted || isCheckingOut) {
      return;
    }

    // Add a small delay before closing to prevent glitching
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300);
  };

  const handleSidebarClick = () => {
    setHasInteracted(true);
  };

  React.useEffect(() => {
    // Reset interaction state when order is completed
    if (order) {
      setHasInteracted(false);
    }
  }, [order]);

  React.useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section
      className={`Sidebar ${isOpen || isHovered || hasInteracted ? "open" : "closed"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleSidebarClick}
    >

      <div className="wrapper">

        <div className={`toggle-button ${isOpen ? "open" : "closed"}`} onClick={toggleSidebar}>
          <i className="material-icons md-48">shopping_cart</i>
          {!isOpen && Object.keys(cart).length > 0 && (
            <span className="cart-badge">{Object.keys(cart).reduce((sum, id) => sum + cart[id], 0)}</span>
          )}
        </div>

        <ShoppingCart
          isOpen={isOpen || isHovered || hasInteracted}
          cart={cart}
          products={products}
          userInfo={userInfo}
          setUserInfo={setUserInfo}
          handleOnCheckout={handleOnCheckout}
          isCheckingOut={isCheckingOut}
          error={error}
          order={order}
          setOrder={setOrder}
        />
        
      </div>
    </section>
  )
}

export default Sidebar;