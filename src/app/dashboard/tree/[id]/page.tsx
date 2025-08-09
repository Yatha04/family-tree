'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getTreeWithMembers, deleteRelationship, createMember, createRelationship, getPhotoUrl } from '@/lib/supabase'
import Link from 'next/link'
import FamilyTreeBuilder from '@/components/FamilyTreeBuilder'
import MemberForm from '@/components/MemberForm'
import RelationshipForm from '@/components/RelationshipForm'
import InviteForm from '@/components/InviteForm'
import type { Database } from '@/types/supabase'

type MemberRow = Database['public']['Tables']['Members']['Row']
type RelationshipRow = Database['public']['Tables']['Relationships']['Row']

interface TreeWithRelations {
  id: string
  name: string
  admin_user: string
  created_at: string
  Members: MemberRow[]
  Relationships: RelationshipRow[]
}

export default function TreeViewPage() {
  const params = useParams()
  const treeId = params.id as string
  
  const [tree, setTree] = useState<TreeWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'view' | 'members' | 'relationships' | 'invite'>('view')
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [showRelationshipForm, setShowRelationshipForm] = useState(false)
  const [editingRelationship, setEditingRelationship] = useState<RelationshipRow | null>(null)
  const [deletingRelationshipId, setDeletingRelationshipId] = useState<string | null>(null)

  useEffect(() => {
    loadTree()
  }, [treeId])

  const loadTree = async () => {
    try {
      const { data, error } = await getTreeWithMembers(treeId)
      if (error) {
        setError('Failed to load tree')
        return
      }
      // Cast returned shape to expected interface (Supabase select uses aliased relations)
      setTree(data as unknown as TreeWithRelations)
    } catch (err) {
      setError('Failed to load tree')
    } finally {
      setLoading(false)
    }
  }

  const handleMemberAdded = () => {
    loadTree()
    setShowMemberForm(false)
  }

  const handleRelationshipAdded = () => {
    loadTree()
    setShowRelationshipForm(false)
  }

  const handleRelationshipEdited = () => {
    loadTree()
    setEditingRelationship(null)
  }

  const handleDeleteRelationship = async (relationshipId: string) => {
    try {
      const { error } = await deleteRelationship(relationshipId)
      if (error) {
        setError('Failed to delete relationship')
        return
      }
      loadTree()
    } catch (err) {
      setError('Failed to delete relationship')
    } finally {
      setDeletingRelationshipId(null)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading tree...</p>
      </div>
    )
  }

  if (error || !tree) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading tree</h3>
        <p className="text-gray-500 mb-4">{error || 'Tree not found'}</p>
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500 mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{tree.name}</h1>
          <p className="text-gray-500">
            {tree.Members.length} members • Created {new Date(tree.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'view', label: 'Tree View', icon: '🌳' },
            { id: 'members', label: 'Members', icon: '👥' },
            { id: 'relationships', label: 'Relationships', icon: '🔗' },
            { id: 'invite', label: 'Invite', icon: '📧' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'view' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Family Tree Visualization</h2>
            </div>
            {tree.Members.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
                <p className="text-gray-500 mb-4">Add family members to start building your tree</p>
                <button
                  onClick={() => setActiveTab('members')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add First Member
                </button>
              </div>
            ) : (
              <FamilyTreeBuilder 
                members={tree.Members} 
                relationships={tree.Relationships}
                onAddMember={async (member) => {
                  // Persist a newly added member (from builder). Since builder does not have a real id yet,
                  // only persist the member and let the tree reload reflect latest state.
                  const memberData = {
                    tree_id: treeId,
                    name: member.name ?? 'New Member',
                    birthdate: member.birthdate ?? undefined,
                    summary: member.summary ?? undefined,
                    photo_path: member.photo_path ?? null,
                  }
                  await createMember(memberData)
                  await loadTree()
                }}
                onAddRelationship={async (relationship) => {
                  // Only persist connections between existing nodes (ids must be real member ids)
                  if (!relationship.a_id || !relationship.b_id || !relationship.type) return
                  await createRelationship({
                    tree_id: treeId,
                    a_id: relationship.a_id,
                    b_id: relationship.b_id,
                    type: relationship.type as 'parent' | 'spouse' | 'sibling',
                  })
                  await loadTree()
                }}
              />
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Family Members</h2>
              <button
                onClick={() => setShowMemberForm(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add Member
              </button>
            </div>
            
            {tree.Members.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No members added yet. Click "Add Member" to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tree.Members.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      {member.photo_path ? (
                        <img
                          src={getPhotoUrl(member.photo_path)}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{member.name}</h3>
                        {member.birthdate && (
                          <p className="text-sm text-gray-500">
                            Born {new Date(member.birthdate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    {member.summary && (
                      <p className="text-sm text-gray-600 mt-2">{member.summary}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'relationships' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Family Relationships</h2>
              <button
                onClick={() => setShowRelationshipForm(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add Relationship
              </button>
            </div>
            
            {tree.Relationships.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No relationships defined yet. Add relationships to connect family members.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tree.Relationships.map((relationship) => {
                  const memberA = tree.Members.find(m => m.id === relationship.a_id)
                  const memberB = tree.Members.find(m => m.id === relationship.b_id)
                  
                  const getRelationshipText = () => {
                    switch (relationship.type) {
                      case 'parent':
                        return 'is parent of'
                      case 'spouse':
                        return 'is spouse of'
                      case 'sibling':
                        return 'is sibling of'
                      default:
                        return 'is related to'
                    }
                  }
                  
                  return (
                    <div key={relationship.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{memberA?.name}</span>
                          <span className="text-gray-400">
                            {getRelationshipText()}
                          </span>
                          <span className="font-medium">{memberB?.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingRelationship(relationship)}
                            className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingRelationshipId(relationship.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'invite' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invite Family Members</h2>
            <InviteForm treeId={treeId} />
          </div>
        )}
      </div>

      {/* Modals */}
      {showMemberForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <MemberForm
              treeId={treeId}
              onSuccess={handleMemberAdded}
              onCancel={() => setShowMemberForm(false)}
            />
          </div>
        </div>
      )}

      {showRelationshipForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <RelationshipForm
              treeId={treeId}
              members={tree.Members}
              onSuccess={handleRelationshipAdded}
              onCancel={() => setShowRelationshipForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Relationship Modal */}
      {editingRelationship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <RelationshipForm
              treeId={treeId}
              members={tree.Members}
              editingRelationship={editingRelationship}
              onSuccess={handleRelationshipEdited}
              onCancel={() => setEditingRelationship(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRelationshipId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Relationship</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this relationship? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setDeletingRelationshipId(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteRelationship(deletingRelationshipId)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
