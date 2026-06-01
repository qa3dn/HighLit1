import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg flex font-sans text-text selection:bg-accent selection:text-bg">
      {/* Main Content Wrapper (Left Side Now) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <Navbar />
        
        {/* Main Content Area where child routes are rendered */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 animate-fade-in-up bg-grid">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Sidebar - Fixed on desktop (Right Side Now) */}
      <Sidebar />
    </div>
  );
};
