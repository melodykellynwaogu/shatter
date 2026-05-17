import '../styles/product-card.css'

function ProductCard({ product, onAdd }) {
  return (
    <article className="product-card">
      <div className="product-card__badge">{product.category}</div>
      <div className="product-card__name">{product.name}</div>
      <p className="product-card__description">{product.description}</p>
      <div className="product-card__footer">
        <span className="product-card__price">${product.price.toFixed(2)}</span>
        <span className="product-card__unit">{product.unit}</span>
      </div>
      <button type="button" className="product-card__button" onClick={() => onAdd(product)}>
        Add to cart
      </button>
    </article>
  )
}

export default ProductCard
