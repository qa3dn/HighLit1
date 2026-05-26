import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getPublicProfile,
  updateProfile,
  type ProfileUpdate,
} from '@/lib/api/profile'

export function usePublicProfile(userId: number | string | undefined) {
  return useQuery({
    queryKey: ['public-profile', String(userId)],
    queryFn: () => getPublicProfile(userId!),
    enabled: userId !== undefined && userId !== '' && userId !== 'undefined',
    staleTime: 60_000,
  })
}

export function useUpdateProfile(userId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: ProfileUpdate) => updateProfile(userId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] })
      queryClient.invalidateQueries({ queryKey: ['public-profile', String(userId)] })
      queryClient.invalidateQueries({ queryKey: ['user', String(userId)] })
    },
  })
}
