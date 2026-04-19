import { useState, useEffect } from 'react';
import { getOrders, updateProfile } from '../services/api';
import { Link } from 'react-router-dom';

function Profile({ user, setUser, fetchUser }) {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({ phone: '', address: '', city: '', postal_code: '', country: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) getOrders(token).then(data => setOrders(data || [])).catch(() => setOrders([]));
  }, []);

  useEffect(() => {
    if (user) setForm({ phone: user.phone || '', address: user.address || '', city: user.city || '', postal_code: user.postal_code || '', country: user.country || '' });
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    try {
      setError(''); setMessage('');
      const updated = await updateProfile(form, token);
      setUser(updated);
      await fetchUser(token);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Unable to update profile.');
    }
  };

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '100px 24px' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔒</div>
      <h2 style={{ fontWeight: 800, marginBottom: 12 }}>Please log in</h2>
      <Link to="/login"><button>Go to Login</button></Link>
    </div>
  );

  const tabStyle = (tab) => ({
    padding: '10px 24px', fontWeight: 700, fontSize: '0.9rem',
    background: activeTab === tab ? '#1a3c34' : 'transparent',
    color: activeTab === tab ? 'white' : '#5a7a6e',
    border: activeTab === tab ? 'none' : '1.5px solid #e0e7e4',
    borderRadius: '8px', cursor: 'pointer',
  });

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f2520, #1a3c34)', borderRadius: '20px', padding: '32px', color: 'white', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 900 }}>
          {user.first_name?.[0] || user.username?.[0] || '?'}
        </div>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: 4 }}>{user.first_name} {user.last_name}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{user.email}</p>
          {user.saved_payment_token && <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', marginTop: 4 }}>💳 {user.saved_payment_token}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
        <button style={tabStyle('profile')} onClick={() => setActiveTab('profile')}>👤 My Profile</button>
        <button style={tabStyle('orders')} onClick={() => setActiveTab('orders')}>📦 Orders ({orders.length})</button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', border: '1px solid #e0e7e4' }}>
          <h2 style={{ fontWeight: 800, marginBottom: '24px' }}>Personal Details</h2>
          {message && <div style={{ background: '#eef7f2', border: '1px solid #52b788', borderRadius: '10px', padding: '12px 16px', color: '#1b8e3e', fontWeight: 600, marginBottom: '20px' }}>✅ {message}</div>}
          {error && <p className="error-text">{error}</p>}
          <form onSubmit={saveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Phone</label>
                <input style={{ marginBottom: 0 }} placeholder="+1 234 567 8900" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>City</label>
                <input style={{ marginBottom: 0 }} placeholder="Your city" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              </div>
            </div>
            <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', margin: '12px 0 4px' }}>Address</label>
            <input placeholder="Street address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Postal Code</label>
                <input style={{ marginBottom: 0 }} placeholder="12345" value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} />
              </div>
              <div>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Country</label>
                <input style={{ marginBottom: 0 }} placeholder="Country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
              </div>
            </div>
            <button type="submit" style={{ marginTop: '24px', padding: '14px 32px' }}>Save Changes</button>
          </form>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', border: '1px solid #e0e7e4' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>📦</div>
              <h3 style={{ fontWeight: 800, marginBottom: 8 }}>No orders yet</h3>
              <p style={{ color: '#5a7a6e', marginBottom: 20 }}>Start shopping to see your orders here.</p>
              <Link to="/shop"><button>Browse Products</button></Link>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '16px', border: '1px solid #e0e7e4', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>Order #{order.id}</div>
                    <div style={{ color: '#5a7a6e', fontSize: '0.85rem' }}>{new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ background: '#eef7f2', color: '#1b8e3e', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {order.status}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>${order.total_price}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#5a7a6e', marginBottom: '12px' }}>
                  📍 {order.shipping_address}, {order.shipping_city}, {order.shipping_country}
                </div>
                <div style={{ borderTop: '1px solid #e0e7e4', paddingTop: '12px' }}>
                  {order.items?.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '4px 0' }}>
                      <span>{item.product?.name || 'Product'} × {item.quantity}</span>
                      <span style={{ fontWeight: 700 }}>${item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;