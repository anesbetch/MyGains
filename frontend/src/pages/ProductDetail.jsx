import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getProduct, addToCart } from '../services/api';

function ProductDetail({ refreshCartCount }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProduct(id)
      .then(data => { setProduct(data); setLoading(false); })
      .catch(() => { setError('Unable to load product.'); setLoading(false); });
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) { navigate('/login', { state: { from: `/product/${id}` } }); return; }
    try {
      setError(''); setSuccess('');
      await addToCart(id, Number(quantity), token);
      await refreshCartCount(token);
      setSuccess('Added to cart successfully!');
    } catch (err) {
      setError(err.message || 'Unable to add to cart.');
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px 20px', color: '#5a7a6e' }}>
      <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
      <p>Loading product...</p>
    </div>
  );

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <p className="error-text">Product not found.</p>
      <Link to="/shop"><button style={{ marginTop: 16 }}>Back to Shop</button></Link>
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px 80px' }}>

      {/* Breadcrumb */}
      <div style={{ fontSize: '0.85rem', color: '#5a7a6e', marginBottom: '24px' }}>
        <Link to="/" style={{ color: '#5a7a6e', textDecoration: 'none' }}>Home</Link>
        {' / '}
        <Link to="/shop" style={{ color: '#5a7a6e', textDecoration: 'none' }}>Shop</Link>
        {' / '}
        <span style={{ color: '#0d1f1a', fontWeight: 600 }}>{product.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>

        {/* Image */}
        <div style={{
          background: '#eef2ef',
          borderRadius: '20px',
          height: '420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '80px',
          overflow: 'hidden',
          border: '1px solid #e0e7e4',
        }}>
          {product.image_url
            ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
            : '💪'}
        </div>

        {/* Details */}
        <div>
          <span style={{
            background: '#eef7f2', color: '#40916c',
            padding: '4px 12px', borderRadius: '999px',
            fontSize: '0.8rem', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            {product.category_name}
          </span>

          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '12px 0 8px', letterSpacing: '-0.5px' }}>
            {product.name}
          </h1>

          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1a3c34', marginBottom: '20px' }}>
            ${product.price}
          </div>

          {error && <p className="error-text">{error}</p>}
          {success && (
            <div style={{
              background: '#eef7f2', border: '1px solid #52b788',
              borderRadius: '10px', padding: '12px 16px',
              color: '#1b8e3e', fontWeight: 600, marginBottom: '16px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              ✅ {success}
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0',
              border: '1.5px solid #e0e7e4', borderRadius: '10px', overflow: 'hidden',
            }}>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                style={{ background: 'white', color: '#1a3c34', padding: '12px 16px', borderRadius: 0, fontWeight: 700, fontSize: '1.1rem' }}
              >−</button>
              <span style={{ padding: '12px 20px', fontWeight: 700, fontSize: '1rem', background: 'white' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                style={{ background: 'white', color: '#1a3c34', padding: '12px 16px', borderRadius: 0, fontWeight: 700, fontSize: '1.1rem' }}
              >+</button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock < 1}
              style={{ flex: 1, padding: '14px', fontWeight: 700, fontSize: '1rem', background: '#1a3c34' }}
            >
              {product.stock < 1 ? 'Out of Stock' : '🛒 Add to Cart'}
            </button>
          </div>

          <button
            onClick={() => navigate('/cart')}
            style={{ width: '100%', background: 'transparent', color: '#1a3c34', border: '1.5px solid #1a3c34', marginBottom: '32px' }}
          >
            View Cart
          </button>

          {/* Info blocks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Description', value: product.description },
              { label: 'Benefits', value: product.benefits },
              product.ingredients && { label: 'Ingredients', value: product.ingredients },
              product.sizing && { label: 'Sizing', value: product.sizing },
            ].filter(Boolean).map(item => (
              <div key={item.label} style={{
                background: '#f4f6f4', borderRadius: '12px',
                padding: '16px 20px', border: '1px solid #e0e7e4',
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5a7a6e', marginBottom: '6px' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.92rem', lineHeight: 1.6, color: '#0d1f1a' }}>{item.value}</div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{
                background: product.stock > 0 ? '#eef7f2' : '#fff0f0',
                color: product.stock > 0 ? '#1b8e3e' : '#c62828',
                padding: '6px 14px', borderRadius: '999px',
                fontSize: '0.82rem', fontWeight: 600,
              }}>
                {product.stock > 0 ? `✓ ${product.stock} in stock` : '✗ Out of stock'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default ProductDetail;