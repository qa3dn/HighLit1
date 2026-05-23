import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';

export const Navbar: React.FC = () => {
  const { logout } = useAuth();
  const { userName, userEmail, userAvatar } = useUser();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <header className="h-16 bg-gray/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 transition-all">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 text-text-secondary hover:text-text transition-colors rounded-md hover:bg-gray-light">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-gray-dark border border-border rounded-lg px-3 py-1.5 focus-within:border-accent focus-within:shadow-glow transition-all duration-300">
          <svg className="w-4 h-4 text-text-secondary ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="البحث..." 
            className="bg-transparent border-none outline-none text-sm text-text placeholder:text-text-secondary w-48 focus:w-64 transition-all duration-300 font-sans"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-text-secondary hover:text-accent transition-colors duration-300 rounded-full hover:bg-gray-light">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-gray"></span>
        </button>
        
        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 pr-4 border-r border-border cursor-pointer group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-accent/10 border border-accent/30 flex items-center justify-center text-accent font-bold text-sm group-hover:shadow-glow transition-all duration-300">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userName ? userName.charAt(0).toUpperCase() : 'م'
              )}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-text group-hover:text-accent transition-colors duration-300 truncate max-w-32">
                {userName || 'مستخدم'}
              </p>
              <p className="text-xs text-text-secondary truncate max-w-36">
                {userEmail || 'user@system.com'}
              </p>
            </div>
            <svg className={`w-4 h-4 text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Transparent Overlay for Click-Outside */}
          {isOpen && (
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute left-0 mt-3 w-48 bg-[#1a1a1a] border border-[#333333] rounded-md shadow-lg z-50 animate-fade-in origin-top">
              <div className="py-1">
                <button
                  dir="rtl"
                  onClick={handleLogout}
                  className="flex items-center justify-start gap-3 w-full px-4 py-2 text-sm text-text-secondary hover:text-red-500 hover:bg-[#2a2a2a] transition-colors group"
                >
                  <svg className="w-4 h-4 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
