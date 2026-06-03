import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { createPortal } from 'react-dom';
import logo from '../../assets/highlit-logo.png';
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
    roles: ['all'],
  },
  {
    name: 'المستخدمين',
    path: '/dashboard/users',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    roles: ['admin'],
  },
  {
    name: 'الشركات',
    path: '/dashboard/companies',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    roles: ['admin'],
  },
  {
    name: 'مراجعة المشاريع',
    path: '/dashboard/projects/review',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    roles: ['admin'],
  },
  {
    name: 'إدارة المحتوى',
    path: '/dashboard/moderation',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    roles: ['admin'],
  },
  {
    name: 'طلبات الاشتراك',
    path: '/dashboard/subscriptions',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    roles: ['admin'],
  },
  {
    name: 'سجل النشاط',
    path: '/dashboard/activity',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    roles: ['admin'],
  },
  {
    name: 'مشاريعي',
    path: '/dashboard/projects',
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    roles: ['student'],
  },
  {
    name: 'المحفوظات',
    path: '/dashboard/saved',
    icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z',
    roles: ['student'],
  },
  {
    name: 'الوظائف',
    path: '/dashboard/jobs',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    roles: ['admin', 'company'],
  },
  {
    name: 'المتقدمين',
    path: '/dashboard/applicants',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    roles: ['company'],
  },
  {
    name: 'الإعدادات',
    path: '/dashboard/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    roles: ['all'],
  },
];

const SidebarContent = ({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) => (
  <>
    {/* Brand */}
    <div className="flex shrink-0 flex-col items-center gap-2.5 border-b border-border px-4 py-6">
      <img src={logo} alt="HighLit" className="h-20 w-auto select-none object-contain" draggable={false} />
      <span className="font-arabic text-[11px] tracking-[0.2em] text-text-secondary">لوحة التحكم</span>
    </div>

    {/* Navigation */}
    <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-6">
      {items.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          end={item.path === '/dashboard'}
          onClick={onNavigate}
          className={({ isActive }) => `
            flex items-center gap-3 rounded-md border px-3 py-2.5 font-arabic text-sm font-medium transition-all duration-300
            ${
              isActive
                ? 'border-accent/20 bg-accent/10 text-accent shadow-sm'
                : 'border-transparent text-text-secondary hover:bg-gray-dark hover:text-text'
            }
          `}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
          </svg>
          {item.name}
        </NavLink>
      ))}
    </nav>

    {/* Footer system status */}
    <div className="border-t border-border p-4">
      <div className="rounded-lg border border-border bg-gray-dark p-4">
        <p className="mb-2 font-arabic text-xs tracking-wide text-text-secondary">حالة النظام</p>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent shadow-glow"></span>
          <span className="font-arabic text-sm font-medium text-text">يعمل بكفاءة</span>
        </div>
      </div>
    </div>
  </>
);

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open = false, onClose }) => {
  const { user } = useAuth();
  const items = navItems.filter(
    (item) => item.roles.includes('all') || (user?.role && item.roles.includes(user.role)),
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Desktop rail */}
      <aside
        dir="rtl"
        className="sticky top-0 hidden h-screen w-64 flex-col border-l border-border bg-gray animate-fade-in md:flex"
      >
        <SidebarContent items={items} />
      </aside>

      {/* Mobile slide-over */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-bg/80 backdrop-blur-md" onClick={onClose} />
            <aside
              dir="rtl"
              className="absolute inset-y-0 right-0 flex w-72 max-w-[85%] flex-col border-l border-border bg-gray shadow-large animate-fade-in"
            >
              <SidebarContent items={items} onNavigate={onClose} />
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
};
