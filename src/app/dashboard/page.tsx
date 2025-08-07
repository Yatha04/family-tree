'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser, getTrees, createTree } from '@/lib/supabase'
import Link from 'next/link'

interface Tree {
  id: string
  name: string
  created_at: string
}

export default function DashboardPage() {
  const [trees, setTrees] = useState<Tree[]>([])
  const [loading, setLoading] = useState(true)
  const [newTreeName, setNewTreeName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadTrees()
  }, [])

  const loadTrees = async () => {
    const { user } = await getCurrentUser()
    if (user) {
      const { data, error } = await getTrees(user.id)
      if (!error && data) {
        setTrees(data)
      }
    }
    setLoading(false)
  }

  const handleCreateTree = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('handleCreateTree called with name:', newTreeName)
    if (!newTreeName.trim()) return

    setCreating(true)
    const { user, error: userError } = await getCurrentUser()
    console.log('Current user:', user, 'User error:', userError)
    
    if (userError) {
      console.error('Error getting current user:', userError)
      alert('Authentication error. Please try signing in again.')
      setCreating(false)
      return
    }
    
    if (user) {
      const { data, error } = await createTree(newTreeName.trim(), user.id)
      console.log('createTree result:', { data, error })
      if (!error && data) {
        setTrees([data, ...trees])
        setNewTreeName('')
        console.log('Tree created successfully:', data)
      } else {
        console.error('Error creating tree:', error)
        alert(`Error creating tree: ${error?.message || 'Unknown error'}`)
      }
    } else {
      console.error('No user found')
      alert('Please sign in to create a tree.')
    }
    setCreating(false)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading your trees...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Family Trees</h1>
      </div>

      {/* Create new tree */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Tree</h2>
        <form onSubmit={handleCreateTree} className="flex gap-4">
          <input
            type="text"
            value={newTreeName}
            onChange={(e) => setNewTreeName(e.target.value)}
            placeholder="Enter tree name..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={creating}
          />
          <button
            type="submit"
            disabled={creating || !newTreeName.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Tree'}
          </button>
        </form>
      </div>

      {/* Trees list */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Trees</h2>
        </div>
        
        {trees.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trees yet</h3>
            <p className="text-gray-500">Create your first family tree to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {trees.map((tree) => (
              <div key={tree.id} className="px-6 py-4 hover:bg-gray-50">
                <Link href={`/dashboard/tree/${tree.id}`} className="block">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{tree.name}</h3>
                      <p className="text-sm text-gray-500">
                        Created {new Date(tree.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
