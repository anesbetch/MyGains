import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="auth-card" style={{ width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📬</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '10px' }}>Check your inbox</h2>
          <p style={{ color: '#5a7a6e', marginBottom: '28px', lineHeight: 1.6 }}>
            If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
            Check your spam folder if you don't see it.
          </p>
          <Link to="/login">
            <button style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>Back to Login</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div className="auth-card" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔑</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '6px' }}>Forgot your password?</h1>
          <p style={{ color: '#5a7a6e' }}>Enter your email and we'll send you a reset link.</p>
        </div>

        {error && (
          <div style={{
            background: '#fff0f0', border: '1px solid #c62828', borderRadius: '10px',
            padding: '12px 16px', marginBottom: '20px', color: '#c62828', fontWeight: 600, fontSize: '0.9rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>Email address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '15px', marginTop: '20px', fontSize: '1rem' }}
          >
            {loading ? 'Sending...' : 'Send Reset Link →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#5a7a6e', fontSize: '0.9rem' }}>
          Remember it?{' '}
          <Link to="/login" style={{ color: '#40916c', fontWeight: 700 }}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
