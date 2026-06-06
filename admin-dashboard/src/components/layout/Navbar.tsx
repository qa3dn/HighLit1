import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, LogOut, Settings, Menu, X } from 'lucide-react';
import { useAuth, type UserRole } from '../../context/AuthContext';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'مسؤول',
  manager: 'مدير',
  company: 'شركة',
  student: 'طالب',
  user: 'مستخدم',
};

const ROLE_STYLES: Record<UserRole, string> = {
  admin: 'bg-accent/10 text-accent border-accent/20',
  manager: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  company: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  student: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  user: 'bg-gray-dark text-text-secondary border-border',
};

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.userAgent);

export const Navbar: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const role: UserRole = user?.role ?? 'user';
  const displayName = user?.name || 'مستخدم';
  const initial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  // ⌘K / Ctrl+K focuses search (matches the visible hint); Esc closes the menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <header
      dir="rtl"
      className="h-16 bg-gray/80 backdrop-blur-md border-b border-border flex items-center justify-between gap-4 px-4 lg:px-6 sticky top-0 z-40"
    >
      {/* Search cluster (mobile toggle + search field) */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          aria-label="فتح القائمة"
          onClick={onMenuClick}
          className="md:hidden p-2 text-text-secondary hover:text-text hover:bg-gray-light rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center gap-2 w-full max-w-md h-10 px-3 bg-gray-dark/70 border border-border rounded-xl focus-within:border-accent/50 focus-within:shadow-glow transition-all duration-300">
          <Search className="w-4 h-4 text-text-secondary shrink-0" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="البحث"
            placeholder="ابحث في لوحة التحكم..."
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-text placeholder:text-text-secondary font-sans"
          />
          {query ? (
            <button
              type="button"
              aria-label="مسح البحث"
              onClick={() => {
                setQuery('');
                searchRef.current?.focus();
              }}
              className="p-0.5 text-text-secondary hover:text-text rounded-md transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-text-secondary bg-gray border border-border rounded-md shrink-0">
              {isMac ? '⌘' : 'Ctrl'} K
            </kbd>
          )}
        </div>
      </div>

      {/* Account cluster (notifications + account menu) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          aria-label="الإشعارات"
          className="relative p-2 text-text-secondary hover:text-accent hover:bg-gray-light rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 left-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-gray" />
        </button>

        <div className="w-px h-8 bg-border" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-label="قائمة الحساب"
            className="flex items-center gap-2.5 p-1 pl-2 rounded-xl hover:bg-gray-light transition-colors group focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            <span className="relative shrink-0">
              <span className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent font-bold text-sm group-hover:shadow-glow transition-all">
                {initial}
              </span>
              <span className="absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 bg-accent rounded-full ring-2 ring-gray" />
            </span>
            <span className="hidden sm:flex flex-col items-start leading-tight max-w-[140px]">
              <span className="w-full truncate text-sm font-semibold text-text">{displayName}</span>
              <span className="text-[11px] text-text-secondary">{ROLE_LABELS[role]}</span>
            </span>
            <ChevronDown
              className={`hidden sm:block w-4 h-4 text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <div
                role="menu"
                className="absolute left-0 mt-3 w-64 rounded-xl border border-border bg-gray-light shadow-large overflow-hidden z-50 animate-fade-in card-neon"
              >
                <div className="flex items-center gap-3 p-4 border-b border-border bg-gray/40">
                  <span className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent font-bold shrink-0">
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text">{displayName}</p>
                    <p className="truncate text-xs text-text-secondary">{user?.email || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                  <span className="text-xs text-text-secondary">الدور</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${ROLE_STYLES[role]}`}>
                    {ROLE_LABELS[role]}
                  </span>
                </div>

                <div className="p-1.5">
                  <Link
                    to="/dashboard/settings"
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-text-secondary hover:text-text hover:bg-gray-dark rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>الإعدادات</span>
                  </Link>
                </div>

                <div className="p-1.5 border-t border-border">
                  <button
                    type="button"
                    onClick={handleLogout}
                    role="menuitem"
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
