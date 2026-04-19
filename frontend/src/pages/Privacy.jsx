import { Link } from 'react-router-dom';

function Privacy() {
  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f2520 0%, #1a3c34 100%)', color: 'white', padding: '80px 40px', textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: 12, letterSpacing: '-1px' }}>Privacy Policy</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>Last updated: April 2025</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>

        {/* Intro */}
        <div style={{ background: '#eef7f2', borderRadius: '16px', padding: '24px 28px', marginBottom: '24px', border: '1px solid #52b788' }}>
          <p style={{ color: '#1a3c34', fontWeight: 600, lineHeight: 1.7, fontSize: '0.95rem' }}>
            🔒 At FitStore, your privacy matters. This policy explains what data we collect, how we use it, and how we protect it. We only collect what is necessary to provide our service.
          </p>
        </div>

        {[
          {
            icon: '📥',
            title: 'What We Collect',
            items: [
              'Account information — your name, email address, and username when you register',
              'Shipping details — address, city, postal code, and country used to process orders',
              'Payment tokens — masked card references only (e.g. tok_****1234), never raw card numbers',
              'Guidance data — your quiz answers (goal, experience, diet, budget) to generate recommendations',
              'Chat history — messages sent to the AI assistant to improve response quality',
              'Order history — details of purchases made on the platform',
            ],
          },
          {
            icon: '⚙️',
            title: 'How We Use Your Data',
            items: [
              'To authenticate you and manage your account securely',
              'To process and track your orders',
              'To personalise product recommendations through the guidance quiz and AI assistant',
              'To improve platform performance and user experience',
              'To communicate order confirmations and account updates',
            ],
          },
          {
            icon: '🔐',
            title: 'How We Protect Your Data',
            items: [
              'Passwords are hashed using Django\'s built-in authentication system — never stored in plain text',
              'Payment card numbers are never stored — only masked tokens are kept (e.g. tok_****1234)',
              'JWT tokens are used for secure session management with a 1-hour access token lifetime',
              'All API endpoints are protected and require proper authentication where needed',
              'The platform uses CORS controls to restrict which origins can access the API',
            ],
          },
          {
            icon: '🤝',
            title: 'Data Sharing',
            items: [
              'We do not sell your personal data to any third parties',
              'Data is not shared with advertisers or marketing companies',
              'In a production environment, payment processing would be handled by a certified provider such as Stripe',
              'Anonymised and aggregated data may be used for academic research and platform improvement',
            ],
          },
          {
            icon: '⏳',
            title: 'Data Retention',
            items: [
              'Account data is retained for as long as your account remains active',
              'Order history is kept to allow you to view past purchases in your profile',
              'Chat messages are stored to improve the AI assistant\'s response quality',
              'You may request deletion of your data by contacting the platform administrator',
            ],
          },
          {
            icon: '✅',
            title: 'Your Rights',
            items: [
              'You have the right to access all personal data we hold about you',
              'You can update your profile information at any time from the Profile page',
              'You may request full deletion of your account and associated data',
              'You have the right to object to processing of your data in certain circumstances',
            ],
          },
        ].map(section => (
          <div key={section.title} style={{ background: 'white', borderRadius: '16px', padding: '28px 32px', marginBottom: '16px', border: '1px solid #e0e7e4', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>{section.icon}</span> {section.title}
            </h2>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              {section.items.map((item, i) => (
                <li key={i} style={{ color: '#5a7a6e', lineHeight: 1.8, fontSize: '0.93rem', marginBottom: '6px' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Cookies note */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px 32px', marginBottom: '16px', border: '1px solid #e0e7e4', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '12px' }}>🍪 Cookies</h2>
          <p style={{ color: '#5a7a6e', lineHeight: 1.8, fontSize: '0.93rem' }}>
            FitStore uses browser localStorage to store your authentication tokens (access and refresh tokens) so you stay logged in between sessions. No third-party tracking cookies are used on this platform.
          </p>
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(90deg, #40916c, #52b788)', borderRadius: '16px', padding: '28px 32px', marginTop: '32px', color: 'white', textAlign: 'center' }}>
          <p style={{ fontWeight: 700, marginBottom: '8px' }}>Questions about your privacy?</p>
          <p style={{ opacity: 0.85, fontSize: '0.9rem', marginBottom: '16px' }}>Read our Terms & Conditions or visit your profile to manage your data.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/terms">
              <button style={{ background: 'white', color: '#1a3c34', fontWeight: 700, padding: '10px 24px' }}>Terms & Conditions</button>
            </Link>
            <Link to="/profile">
              <button style={{ background: 'transparent', border: '2px solid white', color: 'white', fontWeight: 700, padding: '10px 24px' }}>My Profile</button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Privacy;