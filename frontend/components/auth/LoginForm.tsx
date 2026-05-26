'use client'

import { useState } from 'react'
import { Github } from 'lucide-react'
import { Window } from '../terminal/Window'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { playClickSound, playTypingSound } from '@/lib/audio'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    playClickSound()
    setError('')
    
    // Validation
    if (!email || !password) {
      setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور')
      return
    }

    setIsLoading(true)

    try {
      const { data } = await api.post('/auth/login', {
        email,
        password,
      })

      // Save tokens (access for requests, refresh for silent renewal)
      localStorage.setItem('token', data.access_token)
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token)
      }

      // Invalidate queries to refresh user data
      await queryClient.invalidateQueries({ queryKey: ['current-user'] })
      
      // Wait a bit for the query to refetch
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Redirect to rants page
      router.push('/rants')
    } catch (err: any) {
      console.error('Login error:', err)
      
      // Network error or 404
      if (!err.response) {
        if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
          setError('لا يمكن الاتصال بالخادم. تأكد من أن الخادم يعمل على http://localhost:8000')
        } else {
          setError('خطأ في الاتصال: ' + (err.message || 'حدث خطأ غير معروف'))
        }
        setIsLoading(false)
        return
      }

      const errorMessage = err.response?.data?.message || err.message || ''
      
      if (err.response?.status === 404) {
        setError('الخادم غير متاح. تأكد من أن الـ API يعمل على http://localhost:8000')
      } else if (errorMessage.includes('Invalid credentials') || err.response?.status === 401) {
        setError('خطأ: بيانات الدخول غير صحيحة. حاول مرة أخرى.')
      } else if (err.response?.status === 400) {
        setError('الرجاء التحقق من البيانات المدخلة')
      } else if (err.response?.status === 500) {
        setError('خطأ في الخادم. يرجى المحاولة لاحقاً.')
      } else {
        setError(`حدث خطأ أثناء تسجيل الدخول (${err.response?.status || 'غير معروف'}). حاول مرة أخرى.`)
      }
      setIsLoading(false)
    }
  }

  const handleGitHubLogin = () => {
    playClickSound()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
    window.location.href = `${apiUrl}/auth/github`
  }

  return (
    <Window title="Login_Session" path="~/auth/login" className="w-full max-w-md">
      <div className="font-sans text-sm space-y-6" dir="rtl">
        {/* ASCII Welcome */}
        <div className="text-text text-center mb-6">
          <pre className="text-xs font-mono" dir="ltr">
{`╔════════════════╗
║                ║
║    ACCESS      ║
║                ║
╚════════════════╝`}
          </pre>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Field */}
          <div>
            <div className="text-text mb-2 font-mono" dir="ltr">Email:</div>
            <div className="bg-gray-light border border-gray-dark p-2">
              <div className="flex items-center gap-2">
                <span className="text-accent font-mono">&gt;</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    playTypingSound()
                    setEmail(e.target.value)
                  }}
                  placeholder="Enter_your_email@domain.com..."
                  className="flex-1 bg-transparent border-none outline-none text-text font-mono text-sm placeholder:text-text-secondary"
                  dir="ltr"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="text-text mb-2 font-mono" dir="ltr">Password:</div>
            <div className="bg-gray-light border border-gray-dark p-2">
              <div className="flex items-center gap-2">
                <span className="text-accent font-mono">&gt;</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    playTypingSound()
                    setPassword(e.target.value)
                  }}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent border-none outline-none text-text font-mono text-sm placeholder:text-text-secondary"
                  dir="ltr"
                  required
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-400 font-mono text-xs border border-red-400 p-2 bg-red-400/10 animate-shake">
              {error}
            </div>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full bg-accent text-bg hover:bg-accent/90 font-mono"
            disabled={isLoading}
          >
            {isLoading ? '[ PROCESSING... ]' : '[ EXECUTE_LOGIN ]'}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-2 my-6">
          <div className="flex-1 border-t border-gray-dark"></div>
          <span className="text-text-secondary text-xs font-mono">أو</span>
          <div className="flex-1 border-t border-gray-dark"></div>
        </div>

        {/* GitHub Login */}
        <Button
          onClick={handleGitHubLogin}
          variant="secondary"
          size="lg"
          className="w-full flex items-center justify-center gap-2 border border-gray-dark hover:border-accent font-mono"
        >
          <Github className="w-4 h-4" />
          <span>Auth_with_GitHub</span>
        </Button>

        {/* Register Link */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              playClickSound()
              router.push('/register')
            }}
            className="text-text-secondary hover:text-accent text-sm font-mono transition-colors"
          >
            ليس لديك حساب؟ سجل الآن
          </button>
        </div>
      </div>
    </Window>
  )
}

