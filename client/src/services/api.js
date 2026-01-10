const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Base fetch wrapper with auth token injection
 */
async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage');
      window.location.reload();
      throw new Error('Session expired. Please login again.');
    }
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============ Auth APIs ============
export const auth = {
  register: (userData) => fetchWithAuth('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  login: (credentials) => fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  updatePassword: (data) => fetchWithAuth('/auth/update-password', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};

// ============ Habit APIs ============
export const habits = {
  getAll: () => fetchWithAuth('/habits'),

  getHistory: (days = 365) => fetchWithAuth(`/habits/history?days=${days}`),

  getLog: () => fetchWithAuth('/habits/log'),

  getRecommendations: () => fetchWithAuth('/habits/recommendations'),

  create: (habitData) => fetchWithAuth('/habits', {
    method: 'POST',
    body: JSON.stringify(habitData)
  }),

  complete: (habitId, note = '') => fetchWithAuth(`/habits/${habitId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ note })
  }),

  reset: (habitId) => fetchWithAuth(`/habits/${habitId}/reset`, {
    method: 'POST'
  }),

  delete: (habitId) => fetchWithAuth(`/habits/${habitId}`, {
    method: 'DELETE'
  })
};

// ============ Pet APIs ============
export const pet = {
  get: () => fetchWithAuth('/pet'),

  update: (petData) => fetchWithAuth('/pet/update', {
    method: 'POST',
    body: JSON.stringify(petData)
  }),

  applyDecay: () => fetchWithAuth('/pet/decay', {
    method: 'POST'
  })
};

// ============ Shop APIs ============
export const shop = {
  getItems: () => fetchWithAuth('/shop/items'),

  purchase: (itemId, quantity = 1) => fetchWithAuth('/shop/purchase', {
    method: 'POST',
    body: JSON.stringify({ itemId, quantity })
  }),

  useItem: (itemId) => fetchWithAuth('/shop/use', {
    method: 'POST',
    body: JSON.stringify({ itemId })
  }),

  setBackground: (backgroundId) => fetchWithAuth('/shop/background', {
    method: 'POST',
    body: JSON.stringify({ backgroundId })
  }),

  getInventory: () => fetchWithAuth('/shop/inventory')
};
