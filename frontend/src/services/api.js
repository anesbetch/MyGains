const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : {};
  if (!response.ok) {
    throw new Error(data.error || data.detail || 'Request failed');
  }
  return data;
}

export const getProducts = () => apiRequest('/products/');
export const getProduct = (id) => apiRequest(`/products/${id}/`);
export const getCategories = () => apiRequest('/categories/');
export const getCurrentUser = (token) => apiRequest('/users/me/', { headers: { Authorization: `Bearer ${token}` } });
export const updateProfile = (payload, token) => apiRequest('/users/update_profile/', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify(payload),
});
export const addToCart = (productId, quantity, token) => apiRequest('/cart/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ product_id: productId, quantity }),
});
export const getCart = (token) => apiRequest('/cart/get_cart/', { headers: { Authorization: `Bearer ${token}` } });
export const updateCartItem = (id, quantity, token) => apiRequest(`/cart/${id}/`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ quantity }),
});
export const removeCartItem = (id, token) => apiRequest(`/cart/${id}/`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` },
});
export const getGuidance = (goal, experience, dietary_preference, budget) => apiRequest('/guidance/get_recommendations/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ goal, experience, dietary_preference, budget }),
});
export const sendChatMessage = (message) => apiRequest('/chat/send_message/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message }),
});
export const getChatSettings = () => apiRequest('/chat/chat_config/');
export const createOrder = (data, token) => apiRequest('/orders/create_order/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify(data),
});
export const getOrders = (token) => apiRequest('/orders/get_orders/', { headers: { Authorization: `Bearer ${token}` } });
export const signup = (email, username, password, firstName, lastName) => apiRequest('/users/register/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, username, password, first_name: firstName, last_name: lastName }),
});
export const login = (email, password) => apiRequest('/users/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
export const activateAccount = (token) => apiRequest('/users/activate/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token }),
});
