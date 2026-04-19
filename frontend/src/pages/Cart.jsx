import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeCartItem } from '../services/api';

function Cart({ setCartCount }) {
  const [cart, setCart] = useState({ items: [] });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  const loadCart = async () => {
    if (!token) return;
    try {
      const data = await getCart(token);
      setCart(data);
      setCartCount(data.count || 0);
    } catch (err) {
      setError(err.message || 'Unable to load cart.');
    }
  };

  useEffect(() => {
    if (!token) { navigate('/login', { state: { from: '/cart' } }); return; }
    loadCart();
  }, []);

  const changeQuantity = async (id, quantity) => {
    if (quantity < 1) return;
    try { await updateCartItem(id, quantity, token); await loadCart(); }
    catch (err) { setError(err.message || 'Unable to update cart.'); }
  };

  const removeItem = async (id) => {
    try { await removeCartItem(id, token); await loadCart(); }
    catch (err) { setError(err.message || 'Unable to remove item.'); }
  };

  if (!token) return null;

  if (!cart.items?.length) return (
    <div style={{ textAlign: 'center', padding: '100px 24px' }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛒</div>
      <h2 style={{ fontWeight: 800, marginBottom: '12px' }}>Your cart is empty</h2>
      <p style={{ color: '#5a7a6e', marginBottom: '28px' }}>Looks like you haven't added anything yet.</p>
      <Link to="/shop"><button>Browse Products</button></Link>
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>Shopping Cart</h1>
      <p style={{ color: '#5a7a6e', marginBottom: '32px' }}>{cart.count} item{cart.count !== 1 ? 's' : ''} in your cart</p>

      {error && <p className="error-text">{error}</p>}

      <div className="cart-container" style={{ alignItems: 'start' }}>
        <div>
          {cart.items?.map(item => (
            <div key={item.id} style={{
              background: 'white', borderRadius: '14px',
              padding: '20px 24px', marginBottom: '14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              border: '1px solid #e0e7e4',
              display: 'grid', gridTemplateColumns: '1fr auto auto',
              gap: '20px', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5a7a6e', marginBottom: '4px' }}>
                  {item.product.category_name}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{item.product.name}</div>
                <div style={{ color: '#5a7a6e', fontSize: '0.88rem' }}>${item.product.price} each</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1.5px solid #e0e7e4', borderRadius: '10px', overflow: 'hidden' }}>
                <button onClick={() => changeQuantity(item.id, item.quantity - 1)}
                  style={{ background: 'white', color: '#1a3c34', padding: '8px 14px', borderRadius: 0, fontWeight: 700 }}>−</button>
                <span style={{ padding: '8px 16px', fontWeight: 700, background: 'white', fontSize: '0.95rem' }}>{item.quantity}</span>
                <button onClick={() => changeQuantity(item.id, item.quantity + 1)}
                  style={{ background: 'white', color: '#1a3c34', padding: '8px 14px', borderRadius: 0, fontWeight: 700 }}>+</button>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1a3c34', marginBottom: '8px' }}>${item.subtotal}</div>
                <button onClick={() => removeItem(item.id)}
                  style={{ background: 'transparent', color: '#c62828', border: '1px solid #c62828', padding: '5px 12px', fontSize: '0.78rem' }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3 style={{ fontWeight: 800, marginBottom: '20px', fontSize: '1.1rem' }}>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.92rem', color: '#5a7a6e' }}>
            <span>Subtotal ({cart.count} items)</span>
            <span>${cart.total}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.92rem', color: '#5a7a6e' }}>
            <span>Shipping</span>
            <span style={{ color: '#1b8e3e', fontWeight: 600 }}>Free</span>
          </div>
          <div style={{ borderTop: '1px solid #e0e7e4', paddingTop: '16px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem' }}>
            <span>Total</span>
            <span>${cart.total}</span>
          </div>
          <Link to="/checkout">
            <button style={{ width: '100%', marginTop: '20px', padding: '16px', fontSize: '1rem' }}>
              Proceed to Checkout →
            </button>
          </Link>
          <Link to="/shop">
            <button style={{ width: '100%', marginTop: '10px', background: 'transparent', color: '#1a3c34', border: '1.5px solid #1a3c34' }}>
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Cart;