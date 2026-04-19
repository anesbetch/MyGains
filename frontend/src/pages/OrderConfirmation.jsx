import { useLocation, useParams, Link } from 'react-router-dom';

function OrderConfirmation() {
  const { orderId } = useParams();
  const { state } = useLocation();
  const order = state?.order;
  const meta = state?.meta;

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>

        <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🎉</div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '12px', letterSpacing: '-1px' }}>
          Order Confirmed!
        </h1>
        <p style={{ color: '#5a7a6e', fontSize: '1rem', marginBottom: '32px', lineHeight: 1.6 }}>
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', marginBottom: '28px', border: '1px solid #e0e7e4', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e0e7e4' }}>
            <span style={{ fontWeight: 800 }}>Order #{orderId}</span>
            <span style={{ background: '#eef7f2', color: '#1b8e3e', padding: '4px 14px', borderRadius: '999px', fontWeight: 700, fontSize: '0.82rem' }}>Confirmed ✓</span>
          </div>

          {order && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#5a7a6e' }}>Total charged</span>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>${order.total_price}</span>
            </div>
          )}

          {meta?.discount_code && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#5a7a6e' }}>Discount applied</span>
              <span style={{ fontWeight: 700, color: '#1b8e3e' }}>{meta.discount_code} ({meta.discount_applied}% off)</span>
            </div>
          )}

          <div style={{ background: '#f4f6f4', borderRadius: '10px', padding: '14px 16px', marginTop: '16px', fontSize: '0.88rem', color: '#5a7a6e', lineHeight: 1.6 }}>
            {meta?.confirmation_message || 'Your order has been stored successfully. You can view it in your profile.'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/profile">
            <button style={{ padding: '14px 28px', fontWeight: 700 }}>View My Orders</button>
          </Link>
          <Link to="/shop">
            <button style={{ padding: '14px 28px', background: 'transparent', color: '#1a3c34', border: '1.5px solid #1a3c34', fontWeight: 700 }}>
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;