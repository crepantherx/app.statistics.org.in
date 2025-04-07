import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Get CSRF token first
    const getCsrfToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/check/`, {
          credentials: 'include',
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        // Extract CSRF token from cookie
        const cookies = document.cookie.split(';');
        const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrftoken='));
        if (csrfCookie) {
          const token = csrfCookie.split('=')[1];
          setCsrfToken(token);
        }
      } catch (error) {
        console.error('Failed to get CSRF token:', error);
      }
    };

    getCsrfToken();
  }, []);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        const response = await fetch(`${API_BASE_URL}/api/auth/check/`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'X-CSRFToken': csrfToken,
          }
        });
        
        console.log('Auth response:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Auth data:', data);
          setUser(data.user);
        } else {
          console.log('Auth check failed');
          const text = await response.text();
          console.log('Error response:', text);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    if (csrfToken) {
      checkAuth();
    }
  }, [csrfToken]);

  const logout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout/`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-CSRFToken': csrfToken,
        }
      });
      if (response.ok) {
        setUser(null);
        window.location.href = `${API_BASE_URL}/login/`;
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 