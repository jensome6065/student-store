import ProductGrid from "../ProductGrid/ProductGrid"
import "./Home.css"

function Home({isFetching, products, addToCart, removeFromCart, searchInputValue, getQuantityOfItemInCart, activeCategory, }) {

  // Filters products by the active category if it is not 'All Categories'.
  const productsByCategory =
    Boolean(activeCategory) && activeCategory !== "All Categories"
      ? products.filter((p) => p.category === activeCategory)
      : products

  // Filters products by the active category if it is not 'All Categories',
  // then further filters the result by the search input value if it is not empty.
  // Search checks both product name and description for matches.
  const productsToShow = Boolean(searchInputValue)
    ? productsByCategory.filter((p) => {
        const searchLower = searchInputValue.toLowerCase();
        return (
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        );
      })
    : productsByCategory


  return (
    <div className="Home">
      {searchInputValue && (
        <div className="search-results-info">
          Showing {productsToShow.length} result{productsToShow.length !== 1 ? 's' : ''} for "{searchInputValue}"
        </div>
      )}
      <ProductGrid
        products={productsToShow}
        isFetching={isFetching}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        getQuantityOfItemInCart={getQuantityOfItemInCart}
      />
    </div>
  )
}

export default Home;
