import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface CurrentUser {
  id: string
  username: string
  email: string
  rank: string
  role: 'USER' | 'ADMIN' | 'COMPANY'
  reputation_points: number
  bio?: string
  avatar_url?: string
  status_text?: string
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          return null
        }
        const response = await api.get('/auth/me')
        
        const userData = response.data

        if (!userData || !userData.id) {
          console.error('No user data or id:', { responseData: response.data })
          return null
        }
        
        return userData as CurrentUser
      } catch (error: any) {
        // If 401, user is not authenticated
        if (error?.response?.status === 401) {
          console.log('User not authenticated, removing token')
          localStorage.removeItem('token')
          return null
        }
        console.error('Error fetching current user:', error)
        console.error('Error response:', error?.response?.data)
        return null
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: typeof window !== 'undefined', // Only run on client
  })
}

