import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../services/api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="auth-card" style={{ width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>❌</div>
          <h2 style={{ fontWeight: 900, marginBottom: '10px' }}>Invalid reset link</h2>
          <p style={{ color: '#5a7a6e', marginBottom: '24px' }}>This link is missing or invalid. Please request a new one.</p>
          <Link to="/forgot-password">
            <button style={{ width: '100%', padding: '14px' }}>Request New Link</button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="auth-card" style={{ width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '10px' }}>Password updated!</h2>
          <p style={{ color: '#5a7a6e', marginBottom: '28px' }}>Your password has been changed successfully. You can now log in.</p>
          <Link to="/login">
            <button style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>Go to Login →</button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'This reset link has expired or is invalid. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div className="auth-card" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔒</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '6px' }}>Set new password</h1>
          <p style={{ color: '#5a7a6e' }}>Choose a strong password for your account.</p>
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
          <label style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>New password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              style={{ paddingRight: '48px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'transparent', color: '#5a7a6e', padding: '4px', fontSize: '1.1rem',
                border: 'none', cursor: 'pointer',
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <label style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block', marginBottom: '4px', marginTop: '4px' }}>Confirm new password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          {confirmPassword && password !== confirmPassword && (
            <p style={{ color: '#c62828', fontSize: '0.85rem', marginTop: '-4px', marginBottom: '8px' }}>
              Passwords don't match
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '15px', marginTop: '20px', fontSize: '1rem' }}
          >
            {loading ? 'Updating...' : 'Update Password →'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
