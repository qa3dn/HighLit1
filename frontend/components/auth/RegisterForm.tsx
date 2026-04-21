'use client'

import { useState, useEffect } from 'react'
import { Github } from 'lucide-react'
import { Window } from '../terminal/Window'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { ProgressBar } from '../terminal/ProgressBar'
import { playClickSound, playTypingSound } from '@/lib/audio'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

export function RegisterForm() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const queryClient = useQueryClient()

  // Check username availability
  useEffect(() => {
    if (username.length >= 3) {
      const checkUsername = async () => {
        try {
          // Check if username is available by trying to find it
          // We'll check during registration, for now assume available
          setUsernameAvailable(true)
        } catch (error) {
          setUsernameAvailable(false)
        }
      }
      const timeoutId = setTimeout(checkUsername, 500)
      return () => clearTimeout(timeoutId)
    } else {
      setUsernameAvailable(null)
    }
  }, [username])

  // Calculate password strength
  useEffect(() => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 10
    if (/[a-z]/.test(password)) strength += 15
    if (/[A-Z]/.test(password)) strength += 15
    if (/[0-9]/.test(password)) strength += 15
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20

    setPasswordStrength(Math.min(100, strength))
  }, [password])

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 30) return 'Weak'
    if (passwordStrength < 60) return 'Medium'
    if (passwordStrength < 80) return 'Strong'
    return 'Very Strong'
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    playClickSound()
    setError('')

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError('الرجاء ملء جميع الحقول')
      return
    }

    if (username.length < 3) {
      setError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
      return
    }

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      return
    }

    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }

    setIsLoading(true)
    try {
      // First, check if API is available
      try {
        await api.get('/auth/health')
        console.log('✅ API is available')
      } catch (healthErr: any) {
        console.error('❌ API health check failed:', healthErr)
        setError('الخادم غير متاح. تأكد من أن الـ backend يعمل على http://localhost:8000')
        setIsLoading(false)
        return
      }

      console.log('Attempting registration:', { username, email })
      const { data } = await api.post('/auth/register', {
        username,
        email,
        password,
      })
      console.log('Registration successful:', data)

      // Save token
      localStorage.setItem('token', data.access_token)
      
      // Invalidate queries to refresh user data
      await queryClient.invalidateQueries({ queryKey: ['current-user'] })
      
      // Wait a bit for the query to refetch
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Redirect to rants page
      router.push('/rants')
    } catch (err: any) {
      console.error('Registration error:', err)
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
        baseURL: err.config?.baseURL,
      })
      
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
      } else if (errorMessage.includes('already exists') || err.response?.status === 409) {
        if (errorMessage.includes('Username') || errorMessage.includes('username')) {
          setError('اسم المستخدم مستخدم بالفعل')
        } else if (errorMessage.includes('Email') || errorMessage.includes('email')) {
          setError('البريد الإلكتروني مستخدم بالفعل')
        } else {
          setError('المستخدم موجود بالفعل')
        }
      } else if (err.response?.status === 400) {
        const validationErrors = err.response?.data?.message || 'الرجاء التحقق من البيانات المدخلة'
        setError(validationErrors)
      } else if (err.response?.status === 500) {
        setError('خطأ في الخادم. يرجى المحاولة لاحقاً.')
      } else {
        setError(`حدث خطأ أثناء التسجيل (${err.response?.status || 'غير معروف'}). حاول مرة أخرى.`)
      }
      setIsLoading(false)
    }
  }

  const handleGitHubRegister = () => {
    playClickSound()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
    window.location.href = `${apiUrl}/auth/github`
  }

  return (
    <Window title="new_user_wizard" path="~/root/sys/" className="w-full max-w-md">
      <div className="font-mono text-sm space-y-6" dir="rtl">
        <div className="text-text text-center mb-6">
          <pre className="text-xs font-mono" dir="ltr">
{`╔═══════════════════════╗
║                       ║
║  USER REGISTRATION    ║
║                       ║
╚═══════════════════════╝`}
          </pre>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-400 font-mono text-xs border border-red-400 p-2 bg-red-400/10">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Username Field */}
          <div>
            <div className="text-text mb-2 flex items-center gap-2 font-mono" dir="rtl">
              <span>اسم المستخدم:</span>
              {usernameAvailable !== null && username.length >= 3 && (
                <span
                  className={`text-xs ${
                    usernameAvailable ? 'text-accent' : 'text-red-400'
                  }`}
                >
                  [{usernameAvailable ? 'متاح' : 'مستخدم'}]
                </span>
              )}
            </div>
            <div className="bg-gray-light border border-gray-dark p-2">
              <div className="flex items-center gap-2" dir="ltr">
                <span className="text-accent font-mono">&gt;</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    playTypingSound()
                    setUsername(e.target.value)
                  }}
                  placeholder="Enter_username..."
                  className="flex-1 bg-transparent border-none outline-none text-text font-mono text-sm placeholder:text-text-secondary"
                  dir="ltr"
                  required
                />
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div>
            <div className="text-text mb-2 font-mono" dir="ltr">Email:</div>
            <div className="bg-gray-light border border-gray-dark p-2">
              <div className="flex items-center gap-2" dir="ltr">
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
              <div className="flex items-center gap-2" dir="ltr">
                <span className="text-accent font-mono">&gt;</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    playTypingSound()
                    setPassword(e.target.value)
                  }}
                  placeholder="Enter_password..."
                  className="flex-1 bg-transparent border-none outline-none text-text font-mono text-sm placeholder:text-text-secondary"
                  dir="ltr"
                  required
                />
              </div>
            </div>
            {password && (
              <div className="mt-2">
                <div className="text-text text-xs mb-1 font-mono" dir="ltr">
                  Security_Level: {getPasswordStrengthLabel()}
                </div>
                <ProgressBar
                  progress={passwordStrength}
                  showPercentage={true}
                  className="text-xs"
                />
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="text-text mb-2 font-mono" dir="ltr">Confirm_Password:</div>
            <div className="bg-gray-light border border-gray-dark p-2">
              <div className="flex items-center gap-2" dir="ltr">
                <span className="text-accent font-mono">&gt;</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    playTypingSound()
                    setConfirmPassword(e.target.value)
                  }}
                  placeholder="Re-enter_password..."
                  className="flex-1 bg-transparent border-none outline-none text-text font-mono text-sm placeholder:text-text-secondary"
                  dir="ltr"
                  required
                />
              </div>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <div className="text-red-400 text-xs mt-1 font-mono" dir="rtl">
                كلمات المرور غير متطابقة
              </div>
            )}
          </div>

          {/* Register Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading || password !== confirmPassword || password.length < 8 || username.length < 3}
              className="bg-accent text-bg hover:bg-accent/90 font-mono"
            >
              {isLoading ? '[ PROCESSING... ]' : 'Finalize_Installation >>'}
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-2 my-6">
          <div className="flex-1 border-t border-gray-dark"></div>
          <span className="text-text-secondary text-xs font-mono">أو</span>
          <div className="flex-1 border-t border-gray-dark"></div>
        </div>

        {/* GitHub Register */}
        <Button
          onClick={handleGitHubRegister}
          variant="secondary"
          size="lg"
          className="w-full flex items-center justify-center gap-2 border border-gray-dark hover:border-accent font-mono"
        >
          <Github className="w-4 h-4" />
          <span>Register_with_GitHub</span>
        </Button>

        {/* Login Link */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              playClickSound()
              router.push('/login')
            }}
            className="text-text-secondary hover:text-accent text-sm font-mono transition-colors"
          >
            لديك حساب بالفعل؟ سجل الدخول
          </button>
        </div>
      </div>
    </Window>
  )
}

