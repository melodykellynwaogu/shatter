import '../styles/hero.css'

function Hero({ onSelectCategory }) {
  return (
    <header className="hero">
      <div className="hero__copy">
        <p className="eyebrow">Family Fair</p>
        <div className="hero__copyHeading">
          <span className="hero__label">Supermarket</span>
          <h1>Enjoy great food with modern supermarket style.</h1>
        </div>
        <p>
          Discover fresh produce, family meals, and quality pantry essentials in a clean, bold
          supermarket homepage designed for fast shopping.
        </p>
        <div className="hero__actions">
          <button type="button" onClick={() => onSelectCategory('Fresh Produce')}>
            Shop Now
          </button>
          <button type="button" className="hero__secondary" onClick={() => onSelectCategory('Family Meals')}>
            Explore Meals
          </button>
          <button type="button" onClick={() => { window.location.href = '/' }}>
            Back Home
          </button>
        </div>
      </div>
      <aside className="hero__visual">
        <div className="hero__visual-card">
          <div className="hero__visual-badge">Premium Meat</div>
          <h2>Enjoy great food with family favorites.</h2>
          <p>Our supermarket selection brings fresh cuts, seasonal veggies, and quality snacks into one easy cart.</p>
          <div className="hero__visual-meta">
            <span>Fresh daily</span>
            <span>Family portions</span>
          </div>
        </div>
      </aside>
    </header>
  )
}

export default Hero
