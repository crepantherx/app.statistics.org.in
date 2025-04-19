import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000'
  : 'https://deep.statistics.org.in';

export function AuthProvider({ children }) {
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
      if (!csrfToken) return;

      try {
        console.log('Checking authentication with CSRF token:', csrfToken);
        const response = await fetch(`${API_BASE_URL}/api/auth/check/`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          }
        });
        
        console.log('Auth response:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Auth data:', data);
          setUser(data.user);
          if (!data.user) {
            window.location.replace(`${API_BASE_URL}/login/`);
          }
        } else {
          console.log('Auth check failed');
          const text = await response.text();
          console.log('Error response:', text);
          window.location.replace(`${API_BASE_URL}/login/`);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        window.location.replace(`${API_BASE_URL}/login/`);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [csrfToken]);

  const logout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        }
      });
      if (response.ok) {
        setUser(null);
        window.location.replace(`${API_BASE_URL}/login/`);
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
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 