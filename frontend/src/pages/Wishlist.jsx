import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWishlist, toggleWishlist } from '../services/api';

function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (!token) { navigate('/login', { state: { from: '/wishlist' } }); return; }
    getWishlist(token)
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token, navigate]);

  const handleRemove = async (productId) => {
    try {
      await toggleWishlist(productId, token);
      setItems(prev => prev.filter(item => item.id !== productId));
    } catch {
      // ignore
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px 20px', color: '#5a7a6e' }}>
      <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
      <p>Loading wishlist...</p>
    </div>
  );

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2520 0%, #1a3c34 100%)',
        color: 'white', padding: '60px 40px', textAlign: 'center', marginBottom: '40px',
      }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: 12, letterSpacing: '-1px' }}>
          My Wishlist
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem' }}>
          {items.length} saved item{items.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#5a7a6e' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>🤍</div>
            <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: '1.4rem' }}>Your wishlist is empty</h3>
            <p style={{ marginBottom: '28px' }}>Browse the shop and save products you love.</p>
            <Link to="/shop">
              <button style={{ padding: '14px 32px', fontSize: '1rem' }}>Browse Shop →</button>
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {items.map(product => (
              <div key={product.id} className="product-card" style={{ position: 'relative' }}>
                {/* Remove button */}
                <button
                  onClick={() => handleRemove(product.id)}
                  title="Remove from wishlist"
                  style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: 'white', border: '1.5px solid #e0e7e4',
                    borderRadius: '50%', width: '34px', height: '34px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: '1rem', zIndex: 2,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  }}
                >
                  ❤️
                </button>

                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div className="product-image">
                    {product.image_url
                      ? <img src={product.image_url} alt={product.name} />
                      : '💪'}
                  </div>
                  <div className="product-info">
                    <div className="product-category">{product.category_name}</div>
                    <div className="product-name">{product.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <div className="product-price">${product.price}</div>
                      {product.stock === 0 ? (
                        <span style={{ fontSize: '0.75rem', background: '#fff0f0', color: '#c62828', padding: '3px 8px', borderRadius: '999px', fontWeight: 600 }}>
                          Out of Stock
                        </span>
                      ) : product.stock <= 10 ? (
                        <span style={{ fontSize: '0.75rem', background: '#fff8e1', color: '#e65100', padding: '3px 8px', borderRadius: '999px', fontWeight: 600 }}>
                          Low Stock
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', background: '#eef7f2', color: '#40916c', padding: '3px 8px', borderRadius: '999px', fontWeight: 600 }}>
                          In Stock
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
