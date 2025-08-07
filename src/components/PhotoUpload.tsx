'use client'

import { useState, useRef } from 'react'
import { uploadMemberPhoto, getPhotoUrl } from '@/lib/supabase'

interface PhotoUploadProps {
  onPhotoUploaded: (photoPath: string | null) => void
  currentPhotoPath?: string | null
}

export default function PhotoUpload({ onPhotoUploaded, currentPhotoPath }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Generate a unique member ID for the photo path
      const memberId = crypto.randomUUID()
      const { data, error } = await uploadMemberPhoto(file, memberId)
      
      if (error) {
        setError('Failed to upload photo')
        return
      }

      if (data) {
        const photoUrl = getPhotoUrl(data.path)
        onPhotoUploaded(photoUrl)
      }
    } catch (err) {
      setError('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePhoto = () => {
    onPhotoUploaded(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Choose Photo'}
        </button>

        {currentPhotoPath && (
          <button
            type="button"
            onClick={handleRemovePhoto}
            className="px-4 py-2 text-red-600 border border-red-300 rounded-md text-sm font-medium hover:bg-red-50"
          >
            Remove
          </button>
        )}
      </div>

      {currentPhotoPath && (
        <div className="flex items-center space-x-3">
          <img
            src={currentPhotoPath}
            alt="Member photo"
            className="w-16 h-16 rounded-full object-cover border"
          />
          <span className="text-sm text-gray-500">Photo uploaded successfully</span>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <p className="text-xs text-gray-500">
        Supported formats: JPG, PNG, GIF. Max size: 5MB.
      </p>
    </div>
  )
}
