import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getProduct, addToCart, getReviews, addReview, getMyReview, toggleWishlist, checkWishlist } from '../services/api';

function StarSelector({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px', fontSize: '1.6rem', cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          style={{ color: n <= (hovered || value) ? '#f4a926' : '#d1d5db', transition: 'color 0.1s' }}
        >★</span>
      ))}
    </div>
  );
}

function StarDisplay({ value, size = '1rem' }) {
  return (
    <span style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ color: n <= Math.round(value) ? '#f4a926' : '#d1d5db' }}>★</span>
      ))}
    </span>
  );
}

function ProductDetail({ refreshCartCount }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Wishlist
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    getProduct(id)
      .then(data => { setProduct(data); setLoading(false); })
      .catch(() => { setError('Unable to load product.'); setLoading(false); });

    getReviews(id)
      .then(data => setReviews(data.reviews || data))
      .catch(() => {});

    if (token) {
      checkWishlist(id, token)
        .then(data => setWishlisted(data.wishlisted))
        .catch(() => {});
      getMyReview(id, token)
        .then(data => {
          if (data && data.id) {
            setMyReview(data);
            setReviewRating(data.rating);
            setReviewComment(data.comment || '');
          }
        })
        .catch(() => {});
    }
  }, [id, token]);

  const handleAddToCart = async () => {
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

  const handleToggleWishlist = async () => {
    if (!token) { navigate('/login', { state: { from: `/product/${id}` } }); return; }
    setWishlistLoading(true);
    try {
      const data = await toggleWishlist(id, token);
      setWishlisted(data.wishlisted);
    } catch {
      // ignore
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) { navigate('/login', { state: { from: `/product/${id}` } }); return; }
    if (reviewRating === 0) { setReviewError('Please select a star rating.'); return; }
    setReviewError(''); setReviewSuccess(''); setReviewLoading(true);
    try {
      const saved = await addReview(id, reviewRating, reviewComment, token);
      setMyReview(saved);
      setReviewSuccess(myReview ? 'Review updated!' : 'Review submitted!');
      // Refresh reviews list
      const updated = await getReviews(id);
      setReviews(updated.reviews || updated);
      // Also refresh product for updated avg_rating
      const updatedProduct = await getProduct(id);
      setProduct(updatedProduct);
    } catch (err) {
      setReviewError(err.message || 'Unable to submit review.');
    } finally {
      setReviewLoading(false);
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
          background: '#eef2ef', borderRadius: '20px', height: '420px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '80px', overflow: 'hidden', border: '1px solid #e0e7e4', position: 'relative',
        }}>
          {product.image_url
            ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
            : '💪'}

          {/* Wishlist heart on image */}
          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            style={{
              position: 'absolute', top: '14px', right: '14px',
              background: 'white', border: '1.5px solid #e0e7e4',
              borderRadius: '50%', width: '44px', height: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '1.3rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              transition: 'transform 0.15s',
            }}
          >
            {wishlisted ? '❤️' : '🤍'}
          </button>
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

          {/* Rating summary */}
          {product.review_count > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <StarDisplay value={product.avg_rating} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{product.avg_rating}</span>
              <span style={{ color: '#5a7a6e', fontSize: '0.88rem' }}>({product.review_count} review{product.review_count !== 1 ? 's' : ''})</span>
            </div>
          )}

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
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e0e7e4', borderRadius: '10px', overflow: 'hidden' }}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ background: 'white', color: '#1a3c34', padding: '12px 16px', borderRadius: 0, fontWeight: 700, fontSize: '1.1rem' }}>−</button>
              <span style={{ padding: '12px 20px', fontWeight: 700, fontSize: '1rem', background: 'white' }}>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))} style={{ background: 'white', color: '#1a3c34', padding: '12px 16px', borderRadius: 0, fontWeight: 700, fontSize: '1.1rem' }}>+</button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock < 1}
              style={{ flex: 1, padding: '14px', fontWeight: 700, fontSize: '1rem', background: '#1a3c34' }}
            >
              {product.stock < 1 ? 'Out of Stock' : '🛒 Add to Cart'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
            <button onClick={() => navigate('/cart')} style={{ flex: 1, background: 'transparent', color: '#1a3c34', border: '1.5px solid #1a3c34' }}>
              View Cart
            </button>
            <button
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              style={{
                flex: 1,
                background: wishlisted ? '#fff0f5' : 'transparent',
                color: wishlisted ? '#c62828' : '#1a3c34',
                border: `1.5px solid ${wishlisted ? '#c62828' : '#1a3c34'}`,
              }}
            >
              {wishlisted ? '❤️ Wishlisted' : '🤍 Wishlist'}
            </button>
          </div>

          {/* Info blocks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Description', value: product.description },
              { label: 'Benefits', value: product.benefits },
              product.ingredients && { label: 'Ingredients', value: product.ingredients },
              product.sizing && { label: 'Sizing', value: product.sizing },
            ].filter(Boolean).map(item => (
              <div key={item.label} style={{ background: '#f4f6f4', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e0e7e4' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5a7a6e', marginBottom: '6px' }}>{item.label}</div>
                <div style={{ fontSize: '0.92rem', lineHeight: 1.6, color: '#0d1f1a' }}>{item.value}</div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '8px' }}>
              {product.stock === 0 ? (
                <span style={{ background: '#fff0f0', color: '#c62828', padding: '6px 14px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 600 }}>
                  ✗ Out of stock
                </span>
              ) : product.stock <= 10 ? (
                <span style={{ background: '#fff8e1', color: '#e65100', padding: '6px 14px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 600 }}>
                  ⚠️ Low stock — only {product.stock} left!
                </span>
              ) : (
                <span style={{ background: '#eef7f2', color: '#1b8e3e', padding: '6px 14px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 600 }}>
                  ✓ {product.stock} in stock
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── REVIEWS SECTION ── */}
      <div style={{ marginTop: '64px', borderTop: '2px solid #e0e7e4', paddingTop: '48px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '32px' }}>
          Customer Reviews
          {product.review_count > 0 && (
            <span style={{ marginLeft: '12px', fontSize: '1rem', fontWeight: 600, color: '#5a7a6e' }}>
              <StarDisplay value={product.avg_rating} /> {product.avg_rating} ({product.review_count})
            </span>
          )}
        </h2>

        {/* Write / Edit review */}
        <div style={{ background: '#f4f6f4', borderRadius: '16px', padding: '28px', border: '1px solid #e0e7e4', marginBottom: '36px' }}>
          <h3 style={{ fontWeight: 800, marginBottom: '16px', fontSize: '1.05rem' }}>
            {myReview ? '✏️ Edit your review' : '✍️ Write a review'}
          </h3>

          {!token && (
            <p style={{ color: '#5a7a6e', fontSize: '0.92rem' }}>
              <Link to="/login" style={{ color: '#40916c', fontWeight: 700 }}>Log in</Link> to leave a review.
            </p>
          )}

          {token && (
            <form onSubmit={handleSubmitReview}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block', marginBottom: '6px' }}>Your rating</label>
                <StarSelector value={reviewRating} onChange={setReviewRating} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block', marginBottom: '6px' }}>Comment (optional)</label>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={3}
                  style={{
                    width: '100%', borderRadius: '10px', border: '1.5px solid #e0e7e4',
                    padding: '12px 16px', fontSize: '0.92rem', resize: 'vertical',
                    fontFamily: 'inherit', background: 'white', boxSizing: 'border-box',
                  }}
                />
              </div>
              {reviewError && <p style={{ color: '#c62828', fontSize: '0.85rem', marginBottom: '10px' }}>⚠️ {reviewError}</p>}
              {reviewSuccess && <p style={{ color: '#1b8e3e', fontSize: '0.85rem', marginBottom: '10px' }}>✅ {reviewSuccess}</p>}
              <button type="submit" disabled={reviewLoading} style={{ padding: '11px 28px', fontWeight: 700, fontSize: '0.92rem' }}>
                {reviewLoading ? 'Saving...' : myReview ? 'Update Review' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#5a7a6e' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💬</div>
            <p style={{ fontWeight: 600 }}>No reviews yet. Be the first!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map(review => (
              <div key={review.id} style={{
                background: 'white', border: '1px solid #e0e7e4', borderRadius: '14px', padding: '20px 24px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{review.user_name}</div>
                    <StarDisplay value={review.rating} />
                  </div>
                  <div style={{ color: '#9aafaa', fontSize: '0.8rem' }}>
                    {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
                {review.comment && (
                  <p style={{ color: '#0d1f1a', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default ProductDetail;
