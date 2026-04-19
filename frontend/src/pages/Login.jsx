import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../services/api';

function Login({ setUser, refreshCartCount }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const redirectTo = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      localStorage.setItem('access_token', result.access);
      localStorage.setItem('refresh_token', result.refresh);
      setUser(result.user);
      await refreshCartCount(result.access);
      navigate(redirectTo);
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div className="auth-card" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>👋</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '6px' }}>Welcome back</h1>
          <p style={{ color: '#5a7a6e' }}>Sign in to your MyGains account</p>
        </div>

        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #c62828', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#c62828', fontWeight: 600, fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>Email</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="off" />

          <label style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Your password"
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
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                color: '#5a7a6e',
                padding: '4px',
                fontSize: '1.1rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', marginTop: '20px', fontSize: '1rem' }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px', color: '#5a7a6e', fontSize: '0.9rem' }}>
          <Link to="/forgot-password" style={{ color: '#40916c', fontWeight: 600 }}>Forgot your password?</Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: '12px', color: '#5a7a6e', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link to="/signup" state={{ from: redirectTo }} style={{ color: '#40916c', fontWeight: 700 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;