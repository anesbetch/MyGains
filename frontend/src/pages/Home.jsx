import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getProducts } from '../services/api';

const CATEGORIES = [
  { label: 'Protein', icon: '🥛', path: '/shop?category=protein' },
  { label: 'Supplements', icon: '💊', path: '/shop?category=supplements' },
  { label: 'Creatine', icon: '⚡', path: '/shop?category=creatine' },
  { label: 'Clothing', icon: '👕', path: '/shop?category=clothing' },
  { label: 'Accessories', icon: '🎽', path: '/shop?category=accessories' },
  { label: 'Pre-Workout', icon: '🔥', path: '/shop?category=pre-workout' },
];

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts()
      .then(data => setProducts((data.results || data).slice(0, 6)))
      .catch(() => setProducts([]));
  }, []);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-badge">🏋️ AI-Powered Fitness Store</div>
        <h1>
          Train Harder.<br />
          <span>Shop Smarter.</span>
        </h1>
        <p>
          Get personalised product recommendations based on your goal, diet, and budget.
          Powered by an AI assistant that actually knows fitness.
        </p>
        <div className="hero-buttons">
          <Link to="/shop" className="btn-primary">Shop Now</Link>
          <Link to="/guidance" className="btn-secondary">Get Guidance →</Link>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="categories-section">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {CATEGORIES.map(cat => (
            <Link key={cat.label} to={cat.path} className="category-card">
              <span className="cat-icon">{cat.icon}</span>
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <div style={{ padding: '0 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="promo-banner">
          <div>
            <h3>🤖 Meet Your AI Fitness Assistant</h3>
            <p>Tell us your goal, diet, and budget — get personalised product picks instantly.</p>
          </div>
          <Link to="/guidance">Try the Guidance Quiz</Link>
        </div>
      </div>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="products-section">
        <div className="section-header">
          <h2>Featured Products</h2>
          <Link to="/shop">View all →</Link>
        </div>
        <div className="products-grid">
          {products.map(product => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="product-card">
                <div className="product-image">
                  {product.image_url
                    ? <img src={product.image_url} alt={product.name} />
                    : '💪'}
                </div>
                <div className="product-info">
                  <div className="product-category">{product.category_name}</div>
                  <div className="product-name">{product.name}</div>
                  <div className="product-price">${product.price}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── WHY FITSTORE ── */}
      <section style={{
        background: 'white',
        padding: '60px 40px',
        textAlign: 'center',
        borderTop: '1px solid #e0e7e4'
      }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 40 }}>Why MyGains?</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 32,
          maxWidth: 960,
          margin: '0 auto'
        }}>
          {[
            { icon: '🤖', title: 'AI Assistant', desc: 'Get smart product recommendations based on your fitness profile.' },
            { icon: '🎯', title: 'Guided Quiz', desc: 'Answer 4 questions and we match you with the right products.' },
            { icon: '🚀', title: 'Fast Checkout', desc: 'Simple, secure checkout simulation with order tracking.' },
            { icon: '💪', title: 'Expert Products', desc: 'Curated fitness products for every goal and budget.' },
          ].map(f => (
            <div key={f.title}>
              <div style={{ fontSize: '2.5rem', marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: '1rem' }}>{f.title}</h3>
              <p style={{ color: '#5a7a6e', fontSize: '0.88rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;