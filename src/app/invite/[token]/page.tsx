'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { validateInvite, acceptInvite, getCurrentUser } from '@/lib/supabase'
import Link from 'next/link'

interface Invite {
  id: string
  tree_id: string
  token: string
  expires_at: string
  role: string
  accepted: boolean
}

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  
  const [invite, setInvite] = useState<Invite | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    validateInviteToken()
  }, [token])

  const validateInviteToken = async () => {
    try {
      const { data, error } = await validateInvite(token)
      
      if (error || !data) {
        setError('Invalid or expired invite link')
        return
      }

      setInvite(data)
    } catch (err) {
      setError('Failed to validate invite')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvite = async () => {
    setAccepting(true)
    setError(null)

    try {
      const { user } = await getCurrentUser()
      if (!user) {
        setError('You must be signed in to accept an invite')
        return
      }

      const { error } = await acceptInvite(token, user.id)
      
      if (error) {
        setError('Failed to accept invite')
        return
      }

      setSuccess(true)
      // Redirect to the tree after a short delay
      setTimeout(() => {
        router.push(`/dashboard/tree/${invite?.tree_id}`)
      }, 2000)
    } catch (err) {
      setError('Failed to accept invite')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Validating invite...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invite</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Invite Accepted!</h1>
          <p className="text-gray-600 mb-6">You've successfully joined the family tree. Redirecting...</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">You're Invited!</h1>
        <p className="text-gray-600 mb-6">
          You've been invited to join a family tree with {invite?.role === 'editor' ? 'editor' : 'viewer'} permissions.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleAcceptInvite}
            disabled={accepting}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {accepting ? 'Accepting...' : 'Accept Invite'}
          </button>
          
          <Link
            href="/dashboard"
            className="block w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Decline
          </Link>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>• You'll need to sign in with Google to access the tree</p>
          <p>• {invite?.role === 'editor' ? 'You can add and edit family members' : 'You can only view the family tree'}</p>
        </div>
      </div>
    </div>
  )
}
