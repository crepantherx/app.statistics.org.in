import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-black border-b border-gray-800" style={{ height: '48px', minHeight: '48px' }}>
      <div className="flex justify-between items-center h-full px-4">
        <div 
          className="text-white hover:opacity-80 transition-opacity cursor-pointer" 
          style={{ fontFamily: 'Tourney', fontSize: '1.2rem' }}
        >
          Deep Statistics
        </div>
        <div className="flex items-center h-full">
          {loading ? (
            <div className="text-white text-sm">Loading...</div>
          ) : (
            <div className="relative h-full flex items-center">
              <button 
                className="flex flex-col items-center justify-center h-full px-2 cursor-pointer bg-transparent border-0 outline-none focus:outline-none"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <svg className="w-[14px] h-[14px] text-white mb-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/>
                </svg>
                <span className="text-white text-[11px]">
                  {user ? user.username : 'Profile'}
                </span>
              </button>
              
              {dropdownOpen && user && (
                <div className="absolute right-0 top-full mt-1 py-1 w-32 bg-black border border-gray-800 rounded shadow-xl">
                  <button
                    onClick={logout}
                    className="block w-full text-left px-3 py-1 text-sm text-white hover:bg-gray-900 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}

              {dropdownOpen && !user && (
                <div className="absolute right-0 top-full mt-1 py-1 w-32 bg-black border border-gray-800 rounded shadow-xl">
                  <a
                    href="http://localhost:8000/login/"
                    className="block w-full text-left px-3 py-1 text-sm text-white hover:bg-gray-900 transition-colors"
                  >
                    Login
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;