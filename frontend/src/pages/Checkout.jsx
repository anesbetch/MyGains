import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../services/api';

const SectionCard = ({ title, icon, children }) => (
    <div style={{ background: 'white', borderRadius: '16px', padding: '28px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', border: '1px solid #e0e7e4' }}>
      <h3 style={{ fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.3rem' }}>{icon}</span> {title}
      </h3>
      {children}
    </div>
);

function Checkout({ refreshCartCount, fetchUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    shipping_address: '', shipping_city: '', shipping_postal_code: '',
    shipping_country: '', card_number: '', card_expiry: '', card_cvv: '', discount_code: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const validate = () => {
    const cleanCard = formData.card_number.replace(/\s+/g, '');
    if (!/^\d{16}$/.test(cleanCard)) return 'Card number must be 16 digits.';
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.card_expiry)) return 'Expiry must be in MM/YY format.';
    if (!/^\d{3,4}$/.test(formData.card_cvv)) return 'CVV must be 3 or 4 digits.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) { navigate('/login', { state: { from: '/checkout' } }); return; }
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    try {
      setSubmitting(true); setError('');
      const cleanCard = formData.card_number.replace(/\s+/g, '');
      const result = await createOrder({
        shipping_address: formData.shipping_address,
        shipping_city: formData.shipping_city,
        shipping_postal_code: formData.shipping_postal_code,
        shipping_country: formData.shipping_country,
        payment_token: `tok_****${cleanCard.slice(-4)}`,
        discount_code: formData.discount_code,
      }, token);
      await refreshCartCount(token);
      await fetchUser(token);
      navigate(`/order-confirmation/${result.order.id}`, { state: { order: result.order, meta: result } });
    } catch (err) {
      setError(err.message || 'Unable to complete checkout.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = { marginBottom: '0' };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>Checkout</h1>
      <p style={{ color: '#5a7a6e', marginBottom: '32px' }}>Complete your order below</p>

      {error && (
        <div style={{ background: '#fff0f0', border: '1px solid #c62828', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', color: '#c62828', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <SectionCard title="Shipping Address" icon="📦">
          <div style={{ display: 'grid', gap: '12px' }}>
            <input style={inputStyle} placeholder="Street Address" value={formData.shipping_address} onChange={e => set('shipping_address', e.target.value)} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input style={inputStyle} placeholder="City" value={formData.shipping_city} onChange={e => set('shipping_city', e.target.value)} required />
              <input style={inputStyle} placeholder="Postal Code" value={formData.shipping_postal_code} onChange={e => set('shipping_postal_code', e.target.value)} required />
            </div>
            <input style={inputStyle} placeholder="Country" value={formData.shipping_country} onChange={e => set('shipping_country', e.target.value)} required />
          </div>
        </SectionCard>

        <SectionCard title="Payment Information" icon="💳">
          <div style={{ background: '#f4f6f4', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.82rem', color: '#5a7a6e', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔒 This is a simulation — no real payment is processed
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            <input style={inputStyle} placeholder="Card Number (16 digits)" value={formData.card_number} onChange={e => set('card_number', e.target.value)} autoComplete="off" required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input style={inputStyle} placeholder="MM/YY" value={formData.card_expiry} onChange={e => set('card_expiry', e.target.value)} autoComplete="off" required />
              <input style={inputStyle} type="password" placeholder="CVV" value={formData.card_cvv} onChange={e => set('card_cvv', e.target.value)} autoComplete="new-password" required />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Discount Code" icon="🎁">
          <input style={inputStyle} placeholder="Enter discount code (optional)" value={formData.discount_code} onChange={e => set('discount_code', e.target.value.toUpperCase())} />
          <p style={{ fontSize: '0.82rem', color: '#5a7a6e', marginTop: '10px' }}>
            Try: <strong>FIT10</strong>, <strong>WELCOME5</strong>, or <strong>MUSCLE15</strong> for demo discounts
          </p>
        </SectionCard>

        <button
          type="submit"
          disabled={submitting}
          style={{ width: '100%', padding: '18px', fontSize: '1.05rem', fontWeight: 800, background: submitting ? '#5a7a6e' : '#1a3c34' }}
        >
          {submitting ? '⏳ Processing...' : '✅ Complete Purchase'}
        </button>
      </form>
    </div>
  );
}

export default Checkout;