import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { activateAccount } from '../services/api';

function Activate() {
  const { token } = useParams();
  const [state, setState] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    activateAccount(token)
      .then(data => { setState('success'); setMessage(data.message); })
      .catch(err => { setState('error'); setMessage(err.message || 'Activation failed.'); });
  }, [token]);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '48px 40px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center', maxWidth: '460px', width: '100%'
      }}>
        {state === 'loading' && (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>⏳</div>
            <h2 style={{ fontWeight: 800, color: '#1a3c34' }}>Activating your account…</h2>
          </>
        )}

        {state === 'success' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
            <h2 style={{ fontWeight: 800, color: '#1a3c34', marginBottom: '10px' }}>Account Activated!</h2>
            <p style={{ color: '#5a7a6e', marginBottom: '28px' }}>{message}</p>
            <Link to="/login">
              <button style={{ padding: '14px 32px', fontWeight: 700 }}>Go to Login →</button>
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❌</div>
            <h2 style={{ fontWeight: 800, color: '#c62828', marginBottom: '10px' }}>Activation Failed</h2>
            <p style={{ color: '#5a7a6e', marginBottom: '28px' }}>{message}</p>
            <Link to="/signup">
              <button style={{ padding: '14px 32px', fontWeight: 700 }}>Sign Up Again →</button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Activate;
