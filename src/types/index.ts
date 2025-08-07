// Core Database Types
export interface Tree {
  id: string
  name: string
  admin_user: string
  created_at: string
}

export interface Member {
  id: string
  tree_id: string
  name: string
  birthdate?: string
  photo_path?: string
  summary?: string
  created_at: string
}

export interface Relationship {
  id: string
  tree_id: string
  a_id: string
  b_id: string
  type: 'parent' | 'spouse'
  created_at: string
}

export interface Invite {
  id: string
  tree_id: string
  token: string
  expires_at: string
  role: 'editor' | 'viewer'
  accepted: boolean
  created_at: string
}

// Derived Relationship Types
export interface DerivedRelationship {
  from: string
  to: string
  type: string
  isInLaw: boolean
  distance?: number
}

// User and Auth Types
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
}

// Tree State Types
export interface TreeState {
  currentTree: Tree | null
  members: Member[]
  relationships: Relationship[]
  derivedRelationships: DerivedRelationship[]
  selectedMember: Member | null
  searchQuery: string
  zoom: number
  pan: { x: number; y: number }
  isLoading: boolean
  error: string | null
}

// User State Types
export interface UserState {
  user: User | null
  trees: Tree[]
  currentTree: Tree | null
  permissions: Permission[]
  isLoading: boolean
  error: string | null
}

// Permission Types
export interface Permission {
  tree_id: string
  user_id: string
  role: 'admin' | 'editor' | 'viewer'
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

export interface TreeWithMembers extends Tree {
  members: Member[]
  relationships: Relationship[]
  member_count: number
}

// Form Types
export interface MemberFormData {
  name: string
  birthdate?: string
  summary?: string
  photo?: File
}

export interface TreeFormData {
  name: string
}

export interface InviteFormData {
  role: 'editor' | 'viewer'
  expires_in_days: number
}

// Canvas and UI Types
export interface CanvasPosition {
  x: number
  y: number
}

export interface CanvasNode {
  id: string
  position: CanvasPosition
  data: Member
  type: 'member'
}

export interface CanvasEdge {
  id: string
  source: string
  target: string
  type: 'relationship'
  data: {
    relationshipType: string
    isInLaw: boolean
  }
}

// Search and Filter Types
export interface SearchResult {
  member: Member
  relationshipType?: string
  distance?: number
}

export interface FilterOptions {
  showInLaws: boolean
  showBloodRelations: boolean
  generationDepth: number
  searchQuery: string
}

// Error Types
export interface AppError {
  message: string
  code?: string
  details?: any
}

// Utility Types
export type RelationshipType = 
  | 'parent' 
  | 'spouse' 
  | 'sibling' 
  | 'grandparent' 
  | 'aunt' 
  | 'uncle' 
  | 'cousin' 
  | 'niece' 
  | 'nephew'
  | 'parent-in-law'
  | 'sibling-in-law'
  | 'child-in-law'
  | 'grandparent-in-law'

export type UserRole = 'admin' | 'editor' | 'viewer'

// React Flow Types
export interface ReactFlowNode extends CanvasNode {
  position: { x: number; y: number }
  data: Member
}

export interface ReactFlowEdge {
  id: string
  source: string
  target: string
  type: 'relationship'
  style?: {
    stroke: string
    strokeWidth: number
    strokeDasharray?: string
  }
  data: {
    relationshipType: RelationshipType
    isInLaw: boolean
  }
}
