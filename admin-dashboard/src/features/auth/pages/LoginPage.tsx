import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth,type UserRole } from '../../../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login for regular form submit if needed
    // But since it's just mock, let's use Admin by default
    handleQuickLogin('admin');
  };

  const handleQuickLogin = (role: UserRole) => {
    let mockUser;
    switch (role) {
      case 'admin':
        mockUser = { id: '1', name: 'Admin', email: 'admin@highlit.com', role: 'admin' as UserRole };
        break;
      case 'student':
        mockUser = { id: '2', name: 'Student', email: 'student@test.com', role: 'student' as UserRole };
        break;
      case 'company':
        mockUser = { id: '3', name: 'Company', email: 'hr@company.com', role: 'company' as UserRole };
        break;
      default:
        mockUser = { id: '1', name: 'Admin', email: 'admin@highlit.com', role: 'admin' as UserRole };
    }

    const mockToken = `mock_token_${role}_${Date.now()}`;
    login(mockUser, mockToken);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white relative">
      <main className="container mx-auto px-4 py-20 relative z-10">
        <div className="flex items-center justify-center min-h-[70vh]">
          {/* Terminal Window Wrapper */}
          <div className="w-full max-w-md bg-black border border-[#2a2a2a] overflow-hidden flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.5)] animate-fade-in-up">
            
            {/* Title Bar */}
            <div className="bg-[#2a2a2a] border-b border-[#2a2a2a] p-2 flex justify-between items-center font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-white">~/auth/login</span>
                <span className="text-white">Login_Session</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-5 h-5 bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center hover:bg-[#2a2a2a] text-[8px] transition-colors">_</button>
                <button className="w-5 h-5 bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center hover:bg-[#2a2a2a] text-[8px] transition-colors">□</button>
                <button className="w-5 h-5 bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center hover:bg-[#ff4444] text-[8px] transition-colors">×</button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 min-h-[200px] relative z-10 flex-1 overflow-auto font-sans text-sm space-y-6" dir="rtl">
              <div className="text-center mb-6 text-white">
                <pre className="text-xs font-mono" dir="ltr">
{`╔════════════════╗
║                ║
║    ACCESS      ║
║                ║
╚════════════════╝`}
                </pre>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <div className="text-white mb-2 font-mono text-left" dir="ltr">Email:</div>
                  <div className="bg-[#1a1a1a] border border-[#333333] p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#00ff41] font-mono">&gt;</span>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter_your_email@domain.com..." 
                        className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder:text-[#a0a0a0]" 
                        dir="ltr" 
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-white mb-2 font-mono text-left" dir="ltr">Password:</div>
                  <div className="bg-[#1a1a1a] border border-[#333333] p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#00ff41] font-mono">&gt;</span>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder:text-[#a0a0a0]" 
                        dir="ltr" 
                      />
                    </div>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-[#00ff41] text-black hover:bg-[#00cc33] font-mono py-3 px-4 transition-colors font-semibold"
                >
                  [ EXECUTE_LOGIN ]
                </button>
              </form>

              {/* Development Quick Login */}
              <div className="mt-8 border-t border-[#333333] pt-6" dir="ltr">
                <div className="text-[#00ff41] mb-4 font-mono text-xs text-center drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]">
                  --- DEVELOPMENT QUICK LOGIN ---
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleQuickLogin('admin')} 
                    type="button"
                    className="w-full border border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black font-mono py-2 px-4 transition-colors text-xs"
                  >
                    Login as Admin
                  </button>
                  <button 
                    onClick={() => handleQuickLogin('student')} 
                    type="button"
                    className="w-full border border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black font-mono py-2 px-4 transition-colors text-xs"
                  >
                    Login as Student
                  </button>
                  <button 
                    onClick={() => handleQuickLogin('company')} 
                    type="button"
                    className="w-full border border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black font-mono py-2 px-4 transition-colors text-xs"
                  >
                    Login as Company
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
