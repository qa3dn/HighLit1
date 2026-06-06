import { api } from '@/lib/api'

export interface UploadResult {
  url: string
  filename: string
  content_type: string
  size: number
  inline: boolean
}

/** Upload a single file (image or PDF). The backend validates type, size, and
 * magic bytes, and returns the stored URL. */
export async function uploadFile(file: File): Promise<UploadResult> {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await api.post<UploadResult>('/uploads/file', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
