import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';

function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getProducts().then(data => setProducts(data.results || data)).catch(() => setProducts([]));
    getCategories().then(data => setCategories(data.results || data)).catch(() => setCategories([]));
  }, []);

  const filtered = products.filter(p => {
    const matchCategory = !selectedCategory || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div style={{ paddingBottom: '60px' }}>

      {/* ── PAGE HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2520 0%, #1a3c34 100%)',
        color: 'white',
        padding: '60px 40px',
        textAlign: 'center',
        marginBottom: '40px',
      }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: 12, letterSpacing: '-1px' }}>
          All Products
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem' }}>
          {products.length} products available — find the right fit for your goals
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

        {/* ── SEARCH + FILTERS ── */}
        <div style={{
          background: 'white',
          borderRadius: '14px',
          padding: '20px 24px',
          marginBottom: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          border: '1px solid #e0e7e4',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <input
            type="text"
            placeholder="🔍  Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              margin: 0,
              background: '#f4f6f4',
              border: '1.5px solid #e0e7e4',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                background: !selectedCategory ? '#1a3c34' : 'transparent',
                color: !selectedCategory ? 'white' : '#1a3c34',
                border: '1.5px solid #1a3c34',
                padding: '8px 18px',
                fontSize: '0.88rem',
                fontWeight: 600,
              }}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  background: selectedCategory === cat.id ? '#1a3c34' : 'transparent',
                  color: selectedCategory === cat.id ? 'white' : '#1a3c34',
                  border: '1.5px solid #1a3c34',
                  padding: '8px 18px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── RESULTS COUNT ── */}
        <p style={{ color: '#5a7a6e', fontSize: '0.9rem', marginBottom: '20px', fontWeight: 500 }}>
          Showing {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* ── PRODUCT GRID ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#5a7a6e' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No products found</h3>
            <p>Try a different search term or category.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map(product => (
              <Link key={product.id} to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="product-card">
                  <div className="product-image">
                    {product.image_url ? <img src={product.image_url} alt={product.name} /> : '💪'}
                  </div>
                  <div className="product-info">
                    <div className="product-category">{product.category_name}</div>
                    <div className="product-name">{product.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <div className="product-price">${product.price}</div>
                      <span style={{
                        fontSize: '0.75rem',
                        background: '#eef7f2',
                        color: '#40916c',
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontWeight: 600,
                      }}>In Stock</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Shop;