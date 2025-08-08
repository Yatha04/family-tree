import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Debug: Log all environment variables to see what's being loaded
console.log('Environment variables check:', {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing',
  NODE_ENV: process.env.NODE_ENV
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'set' : 'missing',
    key: supabaseAnonKey ? 'set' : 'missing'
  })
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Database helper functions
export const getTrees = async (userId: string) => {
  const { data, error } = await supabase
    .from('Trees')
    .select('*')
    .eq('admin_user', userId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const getTreeWithMembers = async (treeId: string) => {
  const { data, error } = await supabase
    .from('Trees')
    .select(`
      *,
      Members (*),
      Relationships (*)
    `)
    .eq('id', treeId)
    .single()
  
  return { data, error }
}

export const createTree = async (name: string, adminUserId: string) => {
  console.log('createTree called with:', { name, adminUserId })
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log('Auth check:', { user, authError })
  
  if (!user) {
    console.error('No authenticated user found')
    return { data: null, error: { message: 'No authenticated user found' } }
  }
  
  const { data, error } = await supabase
    .from('Trees')
    .insert({
      name,
      admin_user: adminUserId
    })
    .select()
    .single()
  
  console.log('Supabase insert result:', { data, error })
  return { data, error }
}

export const createMember = async (memberData: {
  tree_id: string
  name: string
  birthdate?: string
  summary?: string
  photo_path?: string | null
}) => {
  const { data, error } = await supabase
    .from('Members')
    .insert(memberData)
    .select()
    .single()
  
  return { data, error }
}

export const updateMember = async (memberId: string, updates: {
  name?: string
  birthdate?: string
  summary?: string
  photo_path?: string | null
}) => {
  const { data, error } = await supabase
    .from('Members')
    .update(updates)
    .eq('id', memberId)
    .select()
    .single()
  
  return { data, error }
}

export const deleteMember = async (memberId: string) => {
  const { error } = await supabase
    .from('Members')
    .delete()
    .eq('id', memberId)
  
  return { error }
}

export const createRelationship = async (relationshipData: {
  tree_id: string
  a_id: string
  b_id: string
  type: 'parent' | 'spouse' | 'sibling'
}) => {
  const { data, error } = await supabase
    .from('Relationships')
    .insert(relationshipData)
    .select()
    .single()
  
  return { data, error }
}

export const deleteRelationship = async (relationshipId: string) => {
  const { error } = await supabase
    .from('Relationships')
    .delete()
    .eq('id', relationshipId)
  
  return { error }
}

export const updateRelationship = async (relationshipId: string, updates: {
  a_id?: string
  b_id?: string
  type?: 'parent' | 'spouse' | 'sibling'
}) => {
  const { data, error } = await supabase
    .from('Relationships')
    .update(updates)
    .eq('id', relationshipId)
    .select()
    .single()
  
  return { data, error }
}

// Storage helper functions
export const uploadMemberPhoto = async (file: File, memberId: string) => {
  const fileName = `${memberId}/${Date.now()}-${file.name}`
  
  const { data, error } = await supabase.storage
    .from('member-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  return { data, error }
}

export const getPhotoUrl = (path: string) => {
  const { data } = supabase.storage
    .from('member-photos')
    .getPublicUrl(path)
  
  return data.publicUrl
}

// Invite helper functions
export const createInvite = async (treeId: string, role: 'editor' | 'viewer' = 'editor') => {
  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now
  
  const { data, error } = await supabase
    .from('Invites')
    .insert({
      tree_id: treeId,
      token,
      expires_at: expiresAt.toISOString(),
      role
    })
    .select()
    .single()
  
  return { data, error }
}

export const validateInvite = async (token: string) => {
  const { data, error } = await supabase
    .from('Invites')
    .select('*')
    .eq('token', token)
    .eq('accepted', false)
    .gt('expires_at', new Date().toISOString())
    .single()
  
  return { data, error }
}

export const acceptInvite = async (token: string, userId: string) => {
  const { data, error } = await supabase
    .from('Invites')
    .update({ accepted: true })
    .eq('token', token)
    .select()
    .single()
  
  return { data, error }
}
