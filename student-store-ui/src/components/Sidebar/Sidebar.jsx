import React from "react"
import { useLocation } from "react-router-dom"
import ShoppingCart from "../ShoppingCart/ShoppingCart"
import "./Sidebar.css"


function Sidebar({ cart, isOpen, products, userInfo, setUserInfo, toggleSidebar, closeSidebar, handleOnCheckout,isCheckingOut, order, setOrder,error,}) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const hoverTimeoutRef = React.useRef(null);
  const sidebarRef = React.useRef(null);
  const location = useLocation();
  const isSidebarVisible = isOpen || isHovered || hasInteracted;

  const closeSidebarView = ({ clearOrder = false } = {}) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
    setHasInteracted(false);
    closeSidebar();
    if (clearOrder) {
      setOrder(null);
    }
  };

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

  const handleToggleSidebar = (event) => {
    event.stopPropagation();

    if (isSidebarVisible) {
      closeSidebarView({ clearOrder: Boolean(order) });
      return;
    }

    toggleSidebar();
  };

  const handleCloseFromChild = () => {
    closeSidebarView();
  };

  const handleCloseButtonClick = (event) => {
    event.stopPropagation();
    closeSidebarView({ clearOrder: true });
  };

  React.useEffect(() => {
    // Reset interaction state when order is completed
    if (order) {
      setHasInteracted(false);
    }
  }, [order]);

  React.useEffect(() => {
    closeSidebarView({ clearOrder: Boolean(order) });
  }, [location.pathname]);

  React.useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!isSidebarVisible) return;
      if (!sidebarRef.current || sidebarRef.current.contains(event.target)) return;
      closeSidebarView({ clearOrder: Boolean(order) });
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isSidebarVisible, order]);

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
      ref={sidebarRef}
      className={`Sidebar ${isOpen || isHovered || hasInteracted ? "open" : "closed"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleSidebarClick}
    >

      <div className="wrapper">
        {isSidebarVisible ? (
          <button className="sidebar-close-button" type="button" onClick={handleCloseButtonClick} aria-label="Close sidebar">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6L18 18M18 6L6 18" />
            </svg>
          </button>
        ) : null}

        <div className={`toggle-button ${isOpen ? "open" : "closed"}`} onClick={handleToggleSidebar}>
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
          closeSidebar={handleCloseFromChild}
        />
        
      </div>
    </section>
  )
}

export default Sidebar;