import ProductCard from "../ProductCard/ProductCard"
import "./ProductGrid.css"

function ProductGrid({ addToCart, removeFromCart, getQuantityOfItemInCart, products = [], isFetching }) {

  return (
    <div id="Buy" className="ProductGrid">
      <div className="content">
        <div className="grid">

          {isFetching ? (
            <div className="card">
              <p>Loading products...</p>
            </div>
          ) : !products?.length ? (
            <div className="card">
              <p>No products found</p>
            </div>
          ) : products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={getQuantityOfItemInCart(product)}
              addToCart={() => addToCart(product)}
              removeFromCart={() => removeFromCart(product)}
            />
          ))}

        </div>
      </div>
    </div>
  )

}

export default ProductGrid;