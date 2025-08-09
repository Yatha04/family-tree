'use client'

import { useEffect, useState } from 'react'
import { createMember, updateMember } from '@/lib/supabase'
import PhotoUpload from '@/components/PhotoUpload'
import type { Database } from '@/types/supabase'

type MemberRow = Database['public']['Tables']['Members']['Row']

interface MemberFormProps {
  treeId: string
  editingMember?: MemberRow
  onSuccess: () => void
  onCancel: () => void
}

export default function MemberForm({ treeId, editingMember, onSuccess, onCancel }: MemberFormProps) {
  type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'
  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [summary, setSummary] = useState('')
  const [location, setLocation] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [photoPath, setPhotoPath] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editingMember) {
      setName(editingMember.name ?? '')
      setBirthdate(editingMember.birthdate ? editingMember.birthdate.substring(0, 10) : '')
      setSummary(editingMember.summary ?? '')
      setLocation(editingMember.location ?? '')
      // gender may not be present in generated types yet
      setGender((((editingMember as any).gender as Gender | undefined) ?? '') as Gender | '')
      setPhotoPath(editingMember.photo_path ?? null)
    }
  }, [editingMember])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)

    try {
      if (editingMember) {
        const genderForSave: Gender | undefined = gender === '' ? undefined : gender
        const { error } = await updateMember(editingMember.id, {
          name: name.trim(),
          birthdate: birthdate || undefined,
          summary: summary.trim() || undefined,
          location: location.trim() || undefined,
          gender: genderForSave,
          photo_path: photoPath ?? undefined,
        })
        if (error) {
          setError('Failed to update member')
          return
        }
        onSuccess()
      } else {
        const genderForSave: Gender | undefined = gender === '' ? undefined : gender
        const memberData = {
          tree_id: treeId,
          name: name.trim(),
          birthdate: birthdate || undefined,
          summary: summary.trim() || undefined,
          location: location.trim() || undefined,
          gender: genderForSave,
          photo_path: photoPath
        }

        const { error } = await createMember(memberData)
        
        if (error) {
          setError('Failed to create member')
          return
        }
        onSuccess()
      }
    } catch (err) {
      setError(editingMember ? 'Failed to update member' : 'Failed to create member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingMember ? 'Edit Family Member' : 'Add Family Member'}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900 placeholder-gray-600"
            placeholder="Enter full name"
            required
          />
        </div>

        <div>
          <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">
            Birth Date
          </label>
          <input
            type="date"
            id="birthdate"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900 bg-white"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
            Summary
          </label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900 placeholder-gray-600"
            placeholder="Brief description or notes about this person"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900 placeholder-gray-600"
            placeholder="City, Country"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo
          </label>
          <PhotoUpload
            onPhotoUploaded={setPhotoPath}
            currentPhotoPath={photoPath}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? (editingMember ? 'Saving...' : 'Adding...') : (editingMember ? 'Save Changes' : 'Add Member')}
          </button>
        </div>
      </form>
    </div>
  )
}
