import { Link, useNavigate } from "react-router-dom"
import { useMemo } from "react"
import "./SubNavbar.css"

function SubNavbar({ activeCategory, setActiveCategory, searchInputValue, handleOnSearchInputChange, products = [] }) {

  const navigate = useNavigate();

  // Generate categories dynamically from products with counts
  const categories = useMemo(() => {
    const categoryMap = {};
    products.forEach(product => {
      if (product.category) {
        categoryMap[product.category] = (categoryMap[product.category] || 0) + 1;
      }
    });

    const sortedCategories = Object.keys(categoryMap).sort();
    return [
      { name: "All Categories", count: products.length },
      ...sortedCategories.map(cat => ({ name: cat, count: categoryMap[cat] }))
    ];
  }, [products]);

  const handleCategoryClick = (categoryName) => {
    setActiveCategory(categoryName);
    navigate("/");
  };

  return (
    <nav className="SubNavbar">

      <div className="content">

        <div className="row">
          <div className="search-bar">
            <input
              type="text"
              name="search"
              placeholder="Search"
              value={searchInputValue}
              onChange={handleOnSearchInputChange}
            />
            <i className="material-icons">search</i>
          </div>
          <Link to="/orders" className="orders-link">
            <i className="material-icons">receipt</i>
            Orders
          </Link>
        </div>

        <div className="row">
          <ul className={`category-menu`}>
            {categories.map((cat) => (
              <li className={activeCategory === cat.name ? "is-active" : ""} key={cat.name}>
                <button onClick={() => handleCategoryClick(cat.name)}>
                  {cat.name}
                  <span className="category-count">({cat.count})</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </nav>
  )
}

export default SubNavbar;