import { Link } from 'react-router-dom';

function Terms() {
  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f2520 0%, #1a3c34 100%)', color: 'white', padding: '80px 40px', textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: 12, letterSpacing: '-1px' }}>Terms & Conditions</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>Last updated: April 2025</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>

        {[
          {
            icon: '📋',
            title: 'Acceptance of Terms',
            content: 'By accessing and using FitStore, you accept and agree to be bound by these Terms and Conditions. This platform is an academic demonstration project and should not be treated as a fully commercial service.',
          },
          {
            icon: '🛒',
            title: 'Orders & Availability',
            content: 'All orders are subject to product availability. We reserve the right to cancel or refuse any order if a product is out of stock, incorrectly priced, or unavailable due to technical errors. You will be notified promptly if this occurs.',
          },
          {
            icon: '💳',
            title: 'Payment Simulation',
            content: 'FitStore simulates payment processing for demonstration purposes only. No real financial transactions are made. Card details are masked immediately and stored only as tokenised references (e.g. tok_****1234). In a production environment, a verified payment provider such as Stripe would be integrated.',
          },
          {
            icon: '🤖',
            title: 'AI Assistant & Guidance',
            content: 'Our AI assistant and guidance quiz provide product recommendations based on user input. These recommendations are purely informational and should not replace professional medical, nutritional, or fitness advice. Always consult a qualified professional before making significant changes to your diet or training.',
          },
          {
            icon: '👤',
            title: 'User Accounts',
            content: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorised use of your account. We reserve the right to terminate accounts that violate these terms.',
          },
          {
            icon: '🔒',
            title: 'Intellectual Property',
            content: 'All content on FitStore including text, design, graphics, and code is the property of the FitStore project team. Unauthorised reproduction or distribution is prohibited.',
          },
          {
            icon: '⚠️',
            title: 'Limitation of Liability',
            content: 'FitStore is provided as-is for academic demonstration purposes. We make no warranties, express or implied, regarding the accuracy of product information, availability, or fitness for a particular purpose. We are not liable for any indirect or consequential damages arising from use of this platform.',
          },
          {
            icon: '📝',
            title: 'Changes to Terms',
            content: 'We reserve the right to update these Terms & Conditions at any time. Continued use of FitStore after changes constitutes your acceptance of the new terms.',
          },
        ].map(section => (
          <div key={section.title} style={{ background: 'white', borderRadius: '16px', padding: '28px 32px', marginBottom: '16px', border: '1px solid #e0e7e4', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>{section.icon}</span> {section.title}
            </h2>
            <p style={{ color: '#5a7a6e', lineHeight: 1.8, fontSize: '0.93rem' }}>{section.content}</p>
          </div>
        ))}

        {/* Footer note */}
        <div style={{ background: 'linear-gradient(90deg, #40916c, #52b788)', borderRadius: '16px', padding: '28px 32px', marginTop: '32px', color: 'white', textAlign: 'center' }}>
          <p style={{ fontWeight: 700, marginBottom: '8px' }}>Have questions about our terms?</p>
          <p style={{ opacity: 0.85, fontSize: '0.9rem', marginBottom: '16px' }}>Check our Privacy Policy or browse our shop.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/privacy">
              <button style={{ background: 'white', color: '#1a3c34', fontWeight: 700, padding: '10px 24px' }}>Privacy Policy</button>
            </Link>
            <Link to="/shop">
              <button style={{ background: 'transparent', border: '2px solid white', color: 'white', fontWeight: 700, padding: '10px 24px' }}>Browse Shop</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Terms;