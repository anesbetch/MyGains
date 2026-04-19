import { Link } from 'react-router-dom';

function About() {
  const features = [
    { icon: '🤖', title: 'AI Chat Assistant', desc: 'Our intelligent assistant recommends products based on your goal, diet, and budget in real time.' },
    { icon: '🎯', title: 'Personalised Guidance', desc: 'Answer 4 quick questions and get a curated list of products matched to your fitness profile.' },
    { icon: '🛒', title: 'Smart Shopping', desc: 'Browse supplements, clothing, and accessories with filters for category and search.' },
    { icon: '🔒', title: 'Secure Checkout', desc: 'Your payment info is stored as a masked token — never as a raw card number.' },
  ];

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f2520 0%, #1a3c34 100%)', color: 'white', padding: '80px 40px', textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: 16, letterSpacing: '-1px' }}>About FitStore</h1>
        <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
          An AI-powered fitness ecommerce platform built to make smart shopping simple for everyone.
        </p>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>

        {/* Mission */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '40px', marginBottom: '24px', border: '1px solid #e0e7e4', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '16px' }}>🎯 Our Mission</h2>
          <p style={{ color: '#5a7a6e', lineHeight: 1.8, fontSize: '0.97rem' }}>
            FitStore is dedicated to making fitness shopping simple, smart, and personalised.
            Whether you're a complete beginner or a seasoned athlete, everyone deserves guidance
            when choosing fitness products. That's why we built an AI assistant and a guided quiz —
            so you always find the right product for your specific goal, diet, and budget.
          </p>
        </div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {features.map(f => (
            <div key={f.title} style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #e0e7e4', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{f.icon}</div>
              <h3 style={{ fontWeight: 800, marginBottom: '8px', fontSize: '1rem' }}>{f.title}</h3>
              <p style={{ color: '#5a7a6e', fontSize: '0.88rem', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '40px', marginBottom: '24px', border: '1px solid #e0e7e4', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '20px' }}>🏪 Product Categories</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['💊 Supplements', '🥛 Protein', '⚡ Creatine', '👕 Clothing', '🎽 Accessories', '🔥 Pre-Workout'].map(cat => (
              <span key={cat} style={{ background: '#f4f6f4', color: '#1a3c34', padding: '8px 16px', borderRadius: '999px', fontWeight: 600, fontSize: '0.88rem', border: '1px solid #e0e7e4' }}>
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(90deg, #40916c, #52b788)', borderRadius: '16px', padding: '40px', textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontWeight: 900, fontSize: '1.6rem', marginBottom: '12px' }}>Ready to start your journey?</h2>
          <p style={{ opacity: 0.9, marginBottom: '24px' }}>Take the quiz and find products made for you.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/guidance">
              <button style={{ background: 'white', color: '#1a3c34', fontWeight: 700, padding: '13px 28px' }}>Take the Quiz</button>
            </Link>
            <Link to="/shop">
              <button style={{ background: 'transparent', border: '2px solid white', color: 'white', fontWeight: 700, padding: '13px 28px' }}>Browse Shop</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;