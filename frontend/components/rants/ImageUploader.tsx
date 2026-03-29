'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { playClickSound } from '@/lib/audio'

interface ImageUploaderProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      playClickSound()
      const newFiles = acceptedFiles.slice(0, maxImages - images.length)
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
      setPreviews([...previews, ...newPreviews])

      // Convert to base64 for now (in production, upload to server)
      newFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result as string
          onImagesChange([...images, base64])
        }
        reader.readAsDataURL(file)
      })
    },
    [images, previews, maxImages, onImagesChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: maxImages - images.length,
  })

  const removeImage = (index: number) => {
    playClickSound()
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setPreviews(newPreviews)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Dropzone */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all font-mono ${
            isDragActive
              ? 'border-accent bg-accent/10'
              : 'border-gray-dark hover:border-accent/50 bg-gray-light'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 mx-auto mb-2 text-text-secondary" />
          {isDragActive ? (
            <p className="text-accent">اسقط الصور هنا...</p>
          ) : (
            <div>
              <p className="text-text mb-1">اسحب الصور هنا أو اضغط للاختيار</p>
              <p className="text-xs text-text-secondary">
                PNG, JPG, GIF حتى {maxImages} صور
              </p>
            </div>
          )}
        </div>
      )}

      {/* Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group border border-gray-dark rounded-lg overflow-hidden bg-gray-light"
            >
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 left-2 p-1 bg-bg/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-text" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

