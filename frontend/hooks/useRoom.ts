import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getRoomData,
  getMyRoomData,
  getCodeStorage,
  getCodeStorageById,
  createCodeStorage,
  updateCodeStorage,
  deleteCodeStorage,
  getDevNotes,
  getDevNoteById,
  createDevNote,
  updateDevNote,
  deleteDevNote,
  getIdeas,
  getIdeaById,
  createIdea,
  updateIdea,
  deleteIdea,
  getSavedItems,
  saveItem,
  unsaveItem,
  updateStatus,
  CodeStorage,
  DevNote,
  Idea,
  SavedItem,
} from '@/lib/api/room'

// Room Data
export function useRoomData(userId: string, isOwnProfile: boolean = false) {
  return useQuery({
    queryKey: ['room', userId],
    queryFn: () => (isOwnProfile ? getMyRoomData() : getRoomData(userId)),
    enabled: !!userId,
  })
}

// Code Storage
export function useCodeStorage(userId?: string) {
  return useQuery({
    queryKey: ['code-storage', userId],
    queryFn: () => getCodeStorage(userId),
    enabled: userId !== undefined,
  })
}

export function useCodeStorageById(id: string) {
  return useQuery({
    queryKey: ['code-storage', id],
    queryFn: () => getCodeStorageById(id),
    enabled: !!id,
  })
}

export function useCreateCodeStorage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCodeStorage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['code-storage'] })
      queryClient.invalidateQueries({ queryKey: ['room'] })
    },
  })
}

export function useUpdateCodeStorage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, code }: { id: string; code: Partial<CodeStorage> }) =>
      updateCodeStorage(id, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['code-storage'] })
      queryClient.invalidateQueries({ queryKey: ['room'] })
    },
  })
}

export function useDeleteCodeStorage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCodeStorage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['code-storage'] })
      queryClient.invalidateQueries({ queryKey: ['room'] })
    },
  })
}

// Dev Notes
export function useDevNotes() {
  return useQuery({
    queryKey: ['dev-notes'],
    queryFn: getDevNotes,
  })
}

export function useDevNoteById(id: string) {
  return useQuery({
    queryKey: ['dev-note', id],
    queryFn: () => getDevNoteById(id),
    enabled: !!id,
  })
}

export function useCreateDevNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createDevNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dev-notes'] })
      queryClient.invalidateQueries({ queryKey: ['room'] })
    },
  })
}

export function useUpdateDevNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: Partial<DevNote> }) =>
      updateDevNote(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dev-notes'] })
      queryClient.invalidateQueries({ queryKey: ['room'] })
    },
  })
}

export function useDeleteDevNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDevNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dev-notes'] })
      queryClient.invalidateQueries({ queryKey: ['room'] })
    },
  })
}

// Ideas
export function useIdeas(userId: string) {
  return useQuery({
    queryKey: ['ideas', userId],
    queryFn: () => getIdeas(userId),
    enabled: !!userId,
  })
}

export function useIdeaById(id: string) {
  return useQuery({
    queryKey: ['idea', id],
    queryFn: () => getIdeaById(id),
    enabled: !!id,
  })
}

export function useCreateIdea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] })
      queryClient.invalidateQueries({ queryKey: ['room'] })
    },
  })
}

export function useUpdateIdea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, idea }: { id: string; idea: Partial<Idea> }) =>
      updateIdea(id, idea),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] })
      queryClient.invalidateQueries({ queryKey: ['room'] })
    },
  })
}

export function useDeleteIdea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] })
      queryClient.invalidateQueries({ queryKey: ['room'] })
    },
  })
}

// Saved Items
export function useSavedItems() {
  return useQuery({
    queryKey: ['saved-items'],
    queryFn: getSavedItems,
  })
}

export function useSaveItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-items'] })
      queryClient.invalidateQueries({ queryKey: ['room'] })
    },
  })
}

export function useUnsaveItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemType, itemId }: { itemType: string; itemId: string }) =>
      unsaveItem(itemType, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-items'] })
      queryClient.invalidateQueries({ queryKey: ['room'] })
    },
  })
}

// Status
export function useUpdateStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['room'] })
    },
  })
}

