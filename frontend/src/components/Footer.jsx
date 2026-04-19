import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <h3>Fit<span>Store</span></h3>
          <p>
            Your AI-powered fitness ecommerce platform. Get personalised product
            recommendations, shop with confidence, and train smarter.
          </p>
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/shop">All Products</Link>
          <Link to="/shop?category=protein">Protein</Link>
          <Link to="/shop?category=supplements">Supplements</Link>
          <Link to="/shop?category=clothing">Clothing</Link>
          <Link to="/shop?category=accessories">Accessories</Link>
        </div>
        <div className="footer-col">
          <h4>Help</h4>
          <Link to="/guidance">Guidance Quiz</Link>
          <Link to="/about">About Us</Link>
          <Link to="/cart">My Cart</Link>
          <Link to="/profile">My Profile</Link>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 MyGains. AI-powered fitness ecommerce —</p>
      </div>
    </footer>
  );
}

export default Footer;