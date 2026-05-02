import React from 'react';

export const Navbar: React.FC = () => {
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
          <svg className="w-4 h-4 text-text-secondary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search..." 
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
        <div className="flex items-center gap-3 pl-4 border-l border-border cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent font-bold text-sm group-hover:shadow-glow transition-all duration-300">
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-text group-hover:text-accent transition-colors duration-300">Admin User</p>
            <p className="text-xs text-text-secondary">admin@system.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};
