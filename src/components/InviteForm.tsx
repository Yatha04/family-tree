'use client'

import { useState } from 'react'
import { createInvite } from '@/lib/supabase'

interface InviteFormProps {
  treeId: string
}

export default function InviteForm({ treeId }: InviteFormProps) {
  const [role, setRole] = useState<'editor' | 'viewer'>('editor')
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCreateInvite = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await createInvite(treeId, role)
      
      if (error) {
        setError('Failed to create invite')
        return
      }

      if (data) {
        const inviteUrl = `${window.location.origin}/invite/${data.token}`
        setInviteLink(inviteUrl)
      }
    } catch (err) {
      setError('Failed to create invite')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!inviteLink) return
    
    try {
      await navigator.clipboard.writeText(inviteLink)
      // You could add a toast notification here
    } catch (err) {
      setError('Failed to copy link')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Invite Link</h3>
        <p className="text-gray-600 mb-4">
          Generate a link to invite family members to view or edit your family tree.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Permission Level
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="editor">Editor - Can add/edit members and relationships</option>
            <option value="viewer">Viewer - Can only view the tree</option>
          </select>
        </div>

        <button
          onClick={handleCreateInvite}
          disabled={loading}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Generate Invite Link'}
        </button>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {inviteLink && (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-sm text-green-800 mb-2">Invite link created successfully!</p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Share this link with family members to invite them</p>
              <p>• The link will expire in 7 days</p>
              <p>• Recipients will need to sign in with Google to access the tree</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
