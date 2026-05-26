import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('refresh_token')
}

function redirectToLogin() {
  const path = window.location.pathname
  if (!path.includes('/login') && !path.includes('/register')) {
    window.location.href = '/login'
  }
}

// A single in-flight refresh shared by all concurrent 401s, so a burst of
// failed requests triggers exactly one refresh call.
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refresh = localStorage.getItem('refresh_token')
  if (!refresh) return null
  try {
    // Bare axios (not `api`) to avoid recursing through this interceptor.
    const { data } = await axios.post(
      `${API_URL}/auth/refresh`,
      { refresh },
      { timeout: 10000 },
    )
    localStorage.setItem('token', data.access)
    return data.access as string
  } catch {
    return null
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const url: string = original?.url || ''
    const isAuthCall =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh')

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }
      const newToken = await refreshPromise
      if (newToken) {
        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      }
      clearSession()
      redirectToLogin()
    }

    return Promise.reject(error)
  },
)
