import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../../../context/AuthContext';
import { useLogin } from '../useAuth';
import type { BackendUser } from '../authService';

const API_ROLE_MAP: Record<BackendUser['role'], UserRole> = {
  ADMIN: 'admin',
  USER: 'student',
  COMPANY: 'company',
};

const DEMO_PASSWORD = 'demo12345';

const DEMO_ACCOUNTS: {
  role: BackendUser['role'];
  email: string;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    role: 'ADMIN',
    email: 'admin@highlit.dev',
    label: 'مدير',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z" />
    ),
  },
  {
    role: 'COMPANY',
    email: 'company@highlit.dev',
    label: 'شركة',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9h.01M9 13h.01M9 17h.01" />
    ),
  },
  {
    role: 'USER',
    email: 'student@highlit.dev',
    label: 'طالب',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l9-5-9-5-9 5 9 5zm0 0v7m-5-9.2V17a5 3 0 0010 0v-3.2" />
    ),
  },
];

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendingSource, setPendingSource] = useState<BackendUser['role'] | 'form' | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const isPending = loginMutation.isPending;

  const performLogin = async (
    credentials: { email: string; password: string },
    source: BackendUser['role'] | 'form',
  ) => {
    setError(null);
    setPendingSource(source);
    try {
      const data = await loginMutation.mutateAsync(credentials);
      const backendUser = data.user;
      login(
        {
          id: String(backendUser.id),
          name: backendUser.username,
          email: backendUser.email,
          role: API_ROLE_MAP[backendUser.role] || 'student',
        },
        data.access_token,
      );
      navigate('/dashboard');
    } catch {
      setError('فشل تسجيل الدخول. تحقّق من البريد وكلمة المرور.');
      setPendingSource(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('الرجاء إدخال البريد وكلمة المرور.');
      return;
    }
    performLogin({ email, password }, 'form');
  };

  return (
    <div
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-10 font-sans text-text"
    >
      {/* Ambient background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(0,255,65,0.12), transparent 55%), radial-gradient(rgba(0,255,65,0.06) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 26px 26px',
        }}
      />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        {/* Brand */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 font-mono text-lg text-accent shadow-glow">
            &gt;_
          </span>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight">HighLit</h1>
            <p className="text-xs text-text-secondary">لوحة التحكم</p>
          </div>
        </div>

        {/* Terminal card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-gray-light/80 shadow-large backdrop-blur">
          <div className="flex items-center justify-between border-b border-border bg-gray px-4 py-2.5 font-mono text-xs text-text-secondary">
            <span>~/admin/login</span>
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-gray-dark" />
              <span className="h-2.5 w-2.5 rounded-full bg-gray-dark" />
              <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="mb-1 text-lg font-semibold">تسجيل الدخول</h2>
            <p className="mb-6 text-sm text-text-secondary">ادخل بحسابك للوصول إلى لوحة التحكم.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-text-secondary">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  dir="ltr"
                  autoComplete="email"
                  className="w-full rounded-lg border border-border bg-gray px-4 py-2.5 text-sm text-text outline-none transition-all placeholder:text-text-secondary focus:border-accent focus:shadow-glow"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-text-secondary">
                  كلمة المرور
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-border bg-gray px-4 py-2.5 text-sm text-text outline-none transition-all placeholder:text-text-secondary focus:border-accent focus:shadow-glow"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-bg shadow-glow transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pendingSource === 'form' && isPending ? '...جارٍ الدخول' : 'دخول'}
              </button>
            </form>

            {/* Trial / demo login */}
            <div className="mt-7">
              <div className="mb-3 flex items-center gap-3 text-xs text-text-secondary">
                <span className="h-px flex-1 bg-border" />
                دخول تجريبي
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.role}
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      performLogin({ email: account.email, password: DEMO_PASSWORD }, account.role)
                    }
                    className="flex flex-col items-center gap-2 rounded-lg border border-border bg-gray px-2 py-3 text-xs font-medium text-text-secondary transition-all hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {account.icon}
                    </svg>
                    {pendingSource === account.role && isPending ? '...' : account.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-center text-[11px] text-text-secondary">
                حسابات تجريبية للعرض — تُنشأ عبر <span className="font-mono">manage.py seed_demo</span>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-text-secondary">
          © {new Date().getFullYear()} HighLit · لوحة التحكم الإدارية
        </p>
      </div>
    </div>
  );
};
