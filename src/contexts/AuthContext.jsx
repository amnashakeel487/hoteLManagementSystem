import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cachedHotel, setCachedHotel] = useState(() => {
    try {
      const stored = sessionStorage.getItem('owner_hotel_cache');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  // Check for stored auth token on app load
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const updateHotelCache = (hotelData) => {
    if (!hotelData) return;
    setCachedHotel(hotelData);
    try {
      sessionStorage.setItem('owner_hotel_cache', JSON.stringify(hotelData));
    } catch (e) {
      console.error('Failed to write hotel cache:', e);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('owner_hotel_cache');
    setCachedHotel(null);
    setUser(null);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const apiCall = async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
    
    const config = {
      ...options,
      headers: {
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` })
      }
    };

    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    if (response.status === 401) {
      logout();
      window.location.href = '/login';
      throw new Error('Authentication required');
    }

    // Auto-cache hotel payload if it's the owner hotel route
    if (url.includes('/api/hotels/owner/my-hotel') && response.ok) {
      const cloned = response.clone();
      cloned.json().then(data => {
        if (data.hotel) updateHotelCache(data.hotel);
      }).catch(() => {});
    }
    
    return response;
  };

  const value = {
    user,
    loading,
    cachedHotel,
    updateHotelCache,
    login,
    logout,
    getAuthHeaders,
    apiCall,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOwner: user?.role === 'hotel_owner'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}