import '../styles/cart-sidebar.css'

function CartSidebar({ cartItems, total, onRemove, onClear }) {
  return (
    <aside className="cart-sidebar">
      <div className="cart-sidebar__header">
        <h2>Shopping Cart</h2>
        <button type="button" className="cart-sidebar__clear" onClick={onClear}>
          Clear
        </button>
      </div>
      <div className="cart-sidebar__items">
        {cartItems.length === 0 ? (
          <div className="cart-sidebar__empty">Your cart is empty.</div>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div>
                <div className="cart-item__name">{item.name}</div>
                <div className="cart-item__quantity">{item.quantity} × ${item.price.toFixed(2)}</div>
              </div>
              <button type="button" className="cart-item__remove" onClick={() => onRemove(item)}>
                ×
              </button>
            </div>
          ))
        )}
      </div>
      <div className="cart-sidebar__summary">
        <div className="cart-sidebar__total-label">Total</div>
        <div className="cart-sidebar__total-value">${total.toFixed(2)}</div>
      </div>
      <button type="button" className="cart-sidebar__checkout" disabled={cartItems.length === 0}>
        Checkout
      </button>
    </aside>
  )
}

export default CartSidebar
