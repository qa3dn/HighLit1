import { api } from '../api'

export interface CodeStorage {
  id: string
  user_id: string
  title: string
  language: string
  code_body: string
  description?: string
  tags?: string[]
  visibility: 'PRIVATE' | 'PUBLIC' | 'SHARED'
  share_token?: string
  notes?: string
  linked_post_id?: string
  created_at: string
  updated_at: string
}

export interface DevNote {
  id: string
  user_id: string
  title: string
  content: string
  tags?: string[]
  linked_code_id?: string
  created_at: string
  updated_at: string
}

export interface Idea {
  id: string
  user_id: string
  title: string
  description?: string
  status: 'IDEA' | 'WORKING' | 'CRAZY'
  linked_code_id?: string
  created_at: string
  updated_at: string
}

export interface SavedItem {
  id: string
  user_id: string
  item_type: 'POST' | 'CODE' | 'IDEA'
  item_id: string
  notes?: string
  created_at: string
}

export interface RoomData {
  code_storage: CodeStorage[]
  dev_notes: DevNote[]
  ideas: Idea[]
  saved_items: SavedItem[]
}

// Room Data
export async function getRoomData(userId: string): Promise<RoomData> {
  const { data } = await api.get(`/room/${userId}`)
  return data
}

export async function getMyRoomData(): Promise<RoomData> {
  const { data } = await api.get('/room/me')
  return data
}

// Code Storage
export async function getCodeStorage(userId?: string): Promise<CodeStorage[]> {
  const url = userId ? `/room/code-storage?userId=${userId}` : '/room/code-storage'
  const { data } = await api.get(url)
  return data
}

export async function getCodeStorageById(id: string): Promise<CodeStorage> {
  const { data } = await api.get(`/room/code-storage/${id}`)
  return data
}

export async function createCodeStorage(
  code: Omit<CodeStorage, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'share_token'>
): Promise<CodeStorage> {
  const { data } = await api.post('/room/code-storage', code)
  return data
}

export async function updateCodeStorage(
  id: string,
  code: Partial<CodeStorage>
): Promise<CodeStorage> {
  const { data } = await api.patch(`/room/code-storage/${id}`, code)
  return data
}

export async function deleteCodeStorage(id: string): Promise<void> {
  await api.delete(`/room/code-storage/${id}`)
}

// Dev Notes
export async function getDevNotes(): Promise<DevNote[]> {
  const { data } = await api.get('/room/dev-notes')
  return data
}

export async function getDevNoteById(id: string): Promise<DevNote> {
  const { data } = await api.get(`/room/dev-notes/${id}`)
  return data
}

export async function createDevNote(
  note: Omit<DevNote, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<DevNote> {
  const { data } = await api.post('/room/dev-notes', note)
  return data
}

export async function updateDevNote(
  id: string,
  note: Partial<DevNote>
): Promise<DevNote> {
  const { data } = await api.patch(`/room/dev-notes/${id}`, note)
  return data
}

export async function deleteDevNote(id: string): Promise<void> {
  await api.delete(`/room/dev-notes/${id}`)
}

// Ideas
export async function getIdeas(userId: string): Promise<Idea[]> {
  const { data } = await api.get(`/room/ideas?userId=${userId}`)
  return data
}

export async function getIdeaById(id: string): Promise<Idea> {
  const { data } = await api.get(`/room/ideas/${id}`)
  return data
}

export async function createIdea(
  idea: Omit<Idea, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Idea> {
  const { data } = await api.post('/room/ideas', idea)
  return data
}

export async function updateIdea(
  id: string,
  idea: Partial<Idea>
): Promise<Idea> {
  const { data } = await api.patch(`/room/ideas/${id}`, idea)
  return data
}

export async function deleteIdea(id: string): Promise<void> {
  await api.delete(`/room/ideas/${id}`)
}

// Saved Items
export async function getSavedItems(): Promise<SavedItem[]> {
  const { data } = await api.get('/room/saved-items')
  return data
}

export async function saveItem(
  item: Omit<SavedItem, 'id' | 'user_id' | 'created_at'>
): Promise<SavedItem> {
  const { data } = await api.post('/room/saved-items', item)
  return data
}

export async function unsaveItem(itemType: string, itemId: string): Promise<void> {
  await api.delete(`/room/saved-items?itemType=${itemType}&itemId=${itemId}`)
}

// Status
export async function updateStatus(statusText: string): Promise<void> {
  await api.patch('/room/status', { status_text: statusText })
}

