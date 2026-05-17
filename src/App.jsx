import { useMemo, useState } from 'react'
import products from './data/products'
import ProductCard from './components/ProductCard'
import CartSidebar from './components/CartSidebar'
import WelcomePage from './components/WelcomePage'
import Hero from './components/Hero'
import './App.css'

const categories = ['All', 'Fresh Produce', 'Family Meals', 'Pantry', 'Snacks', 'Dairy']

function App() {
  const [hasEntered, setHasEntered] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [cartItems, setCartItems] = useState([])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
        || product.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchTerm])

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  function handleAdd(product) {
    setCartItems((items) => {
      const existing = items.find((item) => item.id === product.id)
      if (existing) {
        return items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...items, { ...product, quantity: 1 }]
    })
  }

  function handleRemove(product) {
    setCartItems((items) =>
      items
        .map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  function handleClear() {
    setCartItems([])
  }

  function handleEnterSite() {
    setHasEntered(true)
  }

  if (!hasEntered) {
    return <WelcomePage onEnter={handleEnterSite} />
  }

  return (
    <div className="family-fair-app">
      <Hero onSelectCategory={setSelectedCategory} />

      <main className="shop-layout">
        <section className="shop-panel">
          <div className="search-card">
            <label htmlFor="search">Search groceries</label>
            <input
              id="search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products, meals, or snacks"
            />
          </div>

          <div className="category-list" aria-label="Product categories">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={category === selectedCategory ? 'category-button active' : 'category-button'}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="products-panel">
          <div className="products-header">
            <div>
              <span className="products-label">{selectedCategory === 'All' ? 'All products' : selectedCategory}</span>
              <p>{filteredProducts.length} items available</p>
            </div>
          </div>

          <div className="product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={handleAdd} />
              ))
            ) : (
              <div className="empty-state">No products match your search. Try a different keyword.</div>
            )}
          </div>
        </section>

        <CartSidebar cartItems={cartItems} total={total} onRemove={handleRemove} onClear={handleClear} />
      </main>

      <footer className="footer-banner">
        <div>
          <h2>Family Fair is built for modern grocery shopping.</h2>
          <p>From breakfast staples to family meal kits, every item is selected for quality and convenience.</p>
        </div>
      </footer>

      <div className="cart-summary">{cartCount} item{cartCount === 1 ? '' : 's'} in cart</div>
    </div>
  )
}

export default App
