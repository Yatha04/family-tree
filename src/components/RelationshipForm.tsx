'use client'

import { useState, useEffect } from 'react'
import { createRelationship, updateRelationship } from '@/lib/supabase'

interface Member {
  id: string
  name: string
  birthdate: string | null
  photo_path: string | null
  summary: string | null
  created_at: string
}

interface Relationship {
  id: string
  a_id: string
  b_id: string
  type: string
}

interface RelationshipFormProps {
  treeId: string
  members: Member[]
  editingRelationship?: Relationship | null
  onSuccess: () => void
  onCancel: () => void
}

export default function RelationshipForm({ treeId, members, editingRelationship, onSuccess, onCancel }: RelationshipFormProps) {
  const [memberAId, setMemberAId] = useState('')
  const [memberBId, setMemberBId] = useState('')
  const [relationshipType, setRelationshipType] = useState<'parent' | 'spouse' | 'sibling'>('parent')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form with editing data if provided
  useEffect(() => {
    if (editingRelationship) {
      setMemberAId(editingRelationship.a_id)
      setMemberBId(editingRelationship.b_id)
      setRelationshipType(editingRelationship.type as 'parent' | 'spouse' | 'sibling')
    }
  }, [editingRelationship])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberAId || !memberBId || memberAId === memberBId) {
      setError('Please select two different members')
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (editingRelationship) {
        // Update existing relationship
        const { error } = await updateRelationship(editingRelationship.id, {
          a_id: memberAId,
          b_id: memberBId,
          type: relationshipType
        })
        
        if (error) {
          setError('Failed to update relationship')
          return
        }
      } else {
        // Create new relationship
        const relationshipData = {
          tree_id: treeId,
          a_id: memberAId,
          b_id: memberBId,
          type: relationshipType
        }

        const { error } = await createRelationship(relationshipData)
        
        if (error) {
          setError('Failed to create relationship')
          return
        }
      }

      onSuccess()
    } catch (err) {
      setError(editingRelationship ? 'Failed to update relationship' : 'Failed to create relationship')
    } finally {
      setLoading(false)
    }
  }

  const getRelationshipDescription = () => {
    if (!memberAId || !memberBId) return ''
    
    const memberA = members.find(m => m.id === memberAId)
    const memberB = members.find(m => m.id === memberBId)
    
    if (!memberA || !memberB) return ''
    
    if (relationshipType === 'parent') {
      return `${memberA.name} is parent of ${memberB.name}`
    } else if (relationshipType === 'spouse') {
      return `${memberA.name} is spouse of ${memberB.name}`
    } else if (relationshipType === 'sibling') {
      return `${memberA.name} is sibling of ${memberB.name}`
    }
    return ''
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {editingRelationship ? 'Edit Family Relationship' : 'Add Family Relationship'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="memberA" className="block text-sm font-medium text-gray-700 mb-1">
            First Person *
          </label>
          <select
            id="memberA"
            value={memberAId}
            onChange={(e) => setMemberAId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Select a person</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="relationshipType" className="block text-sm font-medium text-gray-700 mb-1">
            Relationship Type *
          </label>
          <select
            id="relationshipType"
            value={relationshipType}
            onChange={(e) => setRelationshipType(e.target.value as 'parent' | 'spouse' | 'sibling')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="parent">Parent</option>
            <option value="spouse">Spouse</option>
            <option value="sibling">Sibling</option>
          </select>
        </div>

        <div>
          <label htmlFor="memberB" className="block text-sm font-medium text-gray-700 mb-1">
            Second Person *
          </label>
          <select
            id="memberB"
            value={memberBId}
            onChange={(e) => setMemberBId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Select a person</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        {memberAId && memberBId && memberAId !== memberBId && (
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              {getRelationshipDescription()}
            </p>
          </div>
        )}

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
            disabled={loading || !memberAId || !memberBId || memberAId === memberBId}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? (editingRelationship ? 'Updating...' : 'Adding...') : (editingRelationship ? 'Update Relationship' : 'Add Relationship')}
          </button>
        </div>
      </form>
    </div>
  )
}
