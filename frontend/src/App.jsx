import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Guidance from './pages/Guidance';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { getCart, getCurrentUser } from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser(token);
      refreshCartCount(token);
    }
  }, []);

  const fetchUser = async (token = localStorage.getItem('access_token')) => {
    try {
      const data = await getCurrentUser(token);
      setUser(data);
    } catch (error) {
      logout();
    }
  };

  const refreshCartCount = async (token = localStorage.getItem('access_token')) => {
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const cart = await getCart(token);
      setCartCount(cart.count || 0);
    } catch (error) {
      setCartCount(0);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setCartCount(0);
  };

  return (
    <Router>
      <div className="app">
        <Navbar user={user} cartCount={cartCount} onLogout={logout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail refreshCartCount={refreshCartCount} />} />
            <Route path="/guidance" element={<Guidance />} />
            <Route path="/cart" element={<Cart setCartCount={setCartCount} />} />
            <Route path="/checkout" element={<Checkout refreshCartCount={refreshCartCount} fetchUser={fetchUser} />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/login" element={<Login setUser={setUser} refreshCartCount={refreshCartCount} />} />
            <Route path="/signup" element={<Signup setUser={setUser} refreshCartCount={refreshCartCount} />} />
            <Route path="/profile" element={<Profile user={user} setUser={setUser} fetchUser={fetchUser} />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </main>
        <Footer />
        <ChatWidget />
      </div>
    </Router>
  );
}

export default App;
