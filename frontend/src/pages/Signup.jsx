import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signup } from '../services/api';

function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';
  const [formData, setFormData] = useState({
    email: '', username: '', password: '', confirmPassword: '', firstName: '', lastName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    try {
      await signup(formData.email, formData.username, formData.password, formData.firstName, formData.lastName);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { state: { from: redirectTo } });
      }, 3000);
    } catch (err) {
      setError(err.message || 'Unable to create account.');
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="auth-card" style={{ width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontWeight: 900, marginBottom: '8px' }}>Account Created!</h2>
          <p style={{ color: '#5a7a6e', marginBottom: '20px' }}>Redirecting you to the login page...</p>
          <Link to="/login" state={{ from: redirectTo }} style={{ color: '#40916c', fontWeight: 700 }}>
            Click here if not redirected
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div className="auth-card" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏋️</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '6px' }}>Create Account</h1>
          <p style={{ color: '#5a7a6e' }}>Join MyGains and start your fitness journey</p>
        </div>

        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #c62828', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#c62828', fontWeight: 600, fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>First Name</label>
              <input style={{ marginBottom: 0 }} type="text" placeholder="John" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required autoComplete="off" />
            </div>
            <div>
              <label style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>Last Name</label>
              <input style={{ marginBottom: 0 }} type="text" placeholder="Doe" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required autoComplete="off" />
            </div>
          </div>

          <label style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block', margin: '14px 0 4px' }}>Username</label>
          <input type="text" placeholder="johndoe" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required autoComplete="off" />

          <label style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>Email</label>
          <input type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required autoComplete="off" />

          <label style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
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

          <label style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              autoComplete="new-password"
              style={{
                paddingRight: '48px',
                borderColor: formData.confirmPassword && formData.password !== formData.confirmPassword ? '#c62828' : undefined,
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(p => !p)}
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
              {showConfirm ? '🙈' : '👁️'}
            </button>
          </div>
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p style={{ color: '#c62828', fontSize: '0.82rem', marginTop: '-8px', marginBottom: '8px', fontWeight: 600 }}>
              Passwords don't match
            </p>
          )}

          <button type="submit" style={{ width: '100%', padding: '15px', marginTop: '20px', fontSize: '1rem' }}>
            Create Account →
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#5a7a6e', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" state={{ from: redirectTo }} style={{ color: '#40916c', fontWeight: 700 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
