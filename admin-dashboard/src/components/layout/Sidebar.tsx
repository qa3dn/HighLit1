import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth, type UserRole } from '../../context/AuthContext';

type RoleConfig = UserRole | 'all';

interface NavItem {
  name: string;
  path: string;
  icon: string;
  roles: RoleConfig[];
}

const navItems: NavItem[] = [
  { 
    name: 'نظرة عامة', 
    path: '/dashboard', 
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    roles: ['all']
  },
  { 
    name: 'المستخدمين', 
    path: '/dashboard/users', 
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    roles: ['admin']
  },
  {
    name: 'الشركات',
    path: '/dashboard/companies',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    roles: ['admin']
  },
  {
    name: 'مراجعة المشاريع',
    path: '/dashboard/projects/review',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    roles: ['admin']
  },
  {
    name: 'إدارة المحتوى',
    path: '/dashboard/moderation',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    roles: ['admin']
  },
  {
    name: 'طلبات الاشتراك',
    path: '/dashboard/subscriptions',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    roles: ['admin']
  },
  {
    name: 'سجل النشاط',
    path: '/dashboard/activity',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    roles: ['admin']
  },
  {
    name: 'مشاريعي',
    path: '/dashboard/projects',
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    roles: ['student']
  },
  {
    name: 'المحفوظات',
    path: '/dashboard/saved',
    icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z',
    roles: ['student']
  },
  {
    name: 'الوظائف',
    path: '/dashboard/jobs',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    roles: ['admin', 'company']
  },
  {
    name: 'المتقدمين',
    path: '/dashboard/applicants',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    roles: ['company']
  },
  { 
    name: 'الإعدادات', 
    path: '/dashboard/settings', 
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    roles: ['all']
  },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  
  const filteredNavItems = navItems.filter((item) => 
    item.roles.includes('all') || (user?.role && item.roles.includes(user.role))
  );

  return (
    <aside dir="rtl" className="w-64 h-screen bg-gray border-l border-border hidden md:flex flex-col animate-fade-in sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <h1 className="text-xl font-bold text-accent font-arabic flex items-center gap-2">
          <span className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center border border-accent/20 shadow-glow">
             <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </span>
          لوحة<span className="text-text">التحكم</span>
        </h1>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 flex flex-col gap-1.5 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-300 font-arabic text-sm font-medium border
              ${isActive 
                ? 'bg-accent/10 text-accent border-accent/20 shadow-sm' 
                : 'text-text-secondary hover:bg-gray-dark hover:text-text border-transparent'}
            `}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      {/* Footer System Status */}
      <div className="p-4 border-t border-border">
        <div className="bg-gray-dark p-4 rounded-lg border border-border">
          <p className="text-xs text-text-secondary mb-2 font-arabic tracking-wide">حالة النظام</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-glow"></span>
            <span className="text-sm font-medium text-text font-arabic">يعمل بكفاءة</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
