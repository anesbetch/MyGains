import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getGuidance } from '../services/api';

const STEPS = [
  {
    key: 'goal',
    question: 'What is your fitness goal?',
    icon: '🎯',
    options: [
      { value: 'muscle', label: 'Build Muscle', icon: '💪', desc: 'Gain strength and size' },
      { value: 'fat_loss', label: 'Lose Fat', icon: '🔥', desc: 'Burn fat, get lean' },
      { value: 'general', label: 'General Fitness', icon: '⚡', desc: 'Stay active and healthy' },
    ],
  },
  {
    key: 'experience',
    question: 'What is your experience level?',
    icon: '📊',
    options: [
      { value: 'beginner', label: 'Beginner', icon: '🌱', desc: 'Just starting out' },
      { value: 'intermediate', label: 'Intermediate', icon: '🏋️', desc: '1–3 years training' },
      { value: 'advanced', label: 'Advanced', icon: '🏆', desc: '3+ years training' },
    ],
  },
  {
    key: 'dietary_preference',
    question: 'What is your dietary preference?',
    icon: '🥗',
    options: [
      { value: 'omnivore', label: 'Omnivore', icon: '🍗', desc: 'No restrictions' },
      { value: 'vegetarian', label: 'Vegetarian', icon: '🥚', desc: 'No meat' },
      { value: 'vegan', label: 'Vegan', icon: '🌿', desc: 'Plant-based only' },
    ],
  },
  {
    key: 'budget',
    question: 'What is your budget?',
    icon: '💰',
    options: [
      { value: 'budget', label: 'Budget', icon: '💵', desc: 'Affordable picks' },
      { value: 'mid', label: 'Mid-Range', icon: '💳', desc: 'Best value' },
      { value: 'premium', label: 'Premium', icon: '💎', desc: 'Top quality' },
    ],
  },
];

function Guidance() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ goal: '', experience: '', dietary_preference: '', budget: '' });
  const [recommendations, setRecommendations] = useState([]);
  const [explanations, setExplanations] = useState([]);
  const [summary, setSummary] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentStep = STEPS[step];

  const selectOption = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    if (step < STEPS.length - 1) {
      setTimeout(() => setStep(s => s + 1), 200);
    } else {
      submitForm(updated);
    }
  };

  const submitForm = async (data) => {
    setLoading(true);
    setError('');
    try {
      const result = await getGuidance(data.goal, data.experience, data.dietary_preference, data.budget);
      setRecommendations(result.recommendations || []);
      setExplanations(result.explanations || []);
      setSummary(result.summary || '');
      setShowResults(true);
    } catch (err) {
      setError(err.message || 'Unable to generate recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setFormData({ goal: '', experience: '', dietary_preference: '', budget: '' });
    setRecommendations([]);
    setExplanations([]);
    setSummary('');
    setShowResults(false);
    setError('');
  };

  const reasonFor = (productId) => explanations.find(e => e.product_id === productId);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '120px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🤖</div>
      <h2 style={{ fontWeight: 800, marginBottom: 12 }}>Finding your perfect products...</h2>
      <p style={{ color: '#5a7a6e' }}>Our AI is analysing your profile</p>
    </div>
  );

  if (showResults) return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #0f2520 0%, #1a3c34 100%)',
        color: 'white', padding: '60px 40px', textAlign: 'center', marginBottom: '40px',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: 12 }}>Your Personalised Picks</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '560px', margin: '0 auto 24px', lineHeight: 1.6 }}>{summary}</p>
        <button onClick={reset} style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', color: 'white', padding: '10px 24px' }}>
          ↩ Start Over
        </button>
      </div>

      {error && <p className="error-text" style={{ textAlign: 'center' }}>{error}</p>}

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {recommendations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#5a7a6e' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>😔</div>
            <h3>No exact matches found</h3>
            <p>Try adjusting your preferences or browse our full shop.</p>
            <Link to="/shop"><button style={{ marginTop: 20 }}>Browse All Products</button></Link>
          </div>
        ) : (
          <div className="products-grid">
            {recommendations.map(product => {
              const explanation = reasonFor(product.id);
              return (
                <Link key={product.id} to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="product-card" style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      background: '#1a3c34', color: 'white',
                      padding: '3px 10px', borderRadius: '999px',
                      fontSize: '0.72rem', fontWeight: 700, zIndex: 1,
                    }}>Recommended</div>
                    <div className="product-image">
                      {product.image_url ? <img src={product.image_url} alt={product.name} /> : '💪'}
                    </div>
                    <div className="product-info">
                      <div className="product-category">{product.category_name}</div>
                      <div className="product-name">{product.name}</div>
                      <div className="product-price">${product.price}</div>
                      {explanation?.why_recommended?.length > 0 && (
                        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {explanation.why_recommended.slice(0, 2).map((reason, i) => (
                            <span key={i} style={{
                              background: '#eef7f2', color: '#40916c',
                              padding: '3px 8px', borderRadius: '999px',
                              fontSize: '0.72rem', fontWeight: 600,
                            }}>✓ {reason}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: '600px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#5a7a6e' }}>
            Step {step + 1} of {STEPS.length}
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#5a7a6e' }}>
            {Math.round(((step + 1) / STEPS.length) * 100)}% complete
          </span>
        </div>
        <div style={{ background: '#e0e7e4', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
          <div style={{
            background: 'linear-gradient(90deg, #40916c, #52b788)',
            height: '100%',
            width: `${((step + 1) / STEPS.length) * 100}%`,
            borderRadius: '999px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{currentStep.icon}</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px' }}>
          {currentStep.question}
        </h2>
        <p style={{ color: '#5a7a6e', fontSize: '0.95rem' }}>Choose one option to continue</p>
      </div>

      {/* Options */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        width: '100%',
        maxWidth: '680px',
      }}>
        {currentStep.options.map(opt => (
          <button
            key={opt.value}
            onClick={() => selectOption(currentStep.key, opt.value)}
            style={{
              background: formData[currentStep.key] === opt.value ? '#1a3c34' : 'white',
              color: formData[currentStep.key] === opt.value ? 'white' : '#0d1f1a',
              border: `2px solid ${formData[currentStep.key] === opt.value ? '#1a3c34' : '#e0e7e4'}`,
              borderRadius: '16px',
              padding: '28px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            }}
            onMouseEnter={e => { if (formData[currentStep.key] !== opt.value) { e.currentTarget.style.borderColor = '#40916c'; e.currentTarget.style.transform = 'translateY(-2px)'; }}}
            onMouseLeave={e => { if (formData[currentStep.key] !== opt.value) { e.currentTarget.style.borderColor = '#e0e7e4'; e.currentTarget.style.transform = 'translateY(0)'; }}}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>{opt.icon}</div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>{opt.label}</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.7 }}>{opt.desc}</div>
          </button>
        ))}
      </div>

      {/* Back button */}
      {step > 0 && (
        <button
          onClick={() => setStep(s => s - 1)}
          style={{ marginTop: '28px', background: 'transparent', color: '#5a7a6e', border: '1.5px solid #e0e7e4', padding: '10px 24px' }}
        >
          ← Back
        </button>
      )}

      {error && <p className="error-text" style={{ marginTop: 20 }}>{error}</p>}
    </div>
  );
}

export default Guidance;