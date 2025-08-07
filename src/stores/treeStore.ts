import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { 
  Tree, 
  Member, 
  Relationship, 
  DerivedRelationship,
  TreeState 
} from '@/types'

interface TreeStore extends TreeState {
  // Actions
  setCurrentTree: (tree: Tree | null) => void
  setMembers: (members: Member[]) => void
  setRelationships: (relationships: Relationship[]) => void
  setDerivedRelationships: (relationships: DerivedRelationship[]) => void
  addMember: (member: Member) => void
  updateMember: (memberId: string, updates: Partial<Member>) => void
  removeMember: (memberId: string) => void
  addRelationship: (relationship: Relationship) => void
  removeRelationship: (relationshipId: string) => void
  setSelectedMember: (member: Member | null) => void
  setSearchQuery: (query: string) => void
  setZoom: (zoom: number) => void
  setPan: (pan: { x: number; y: number }) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState: TreeState = {
  currentTree: null,
  members: [],
  relationships: [],
  derivedRelationships: [],
  selectedMember: null,
  searchQuery: '',
  zoom: 1,
  pan: { x: 0, y: 0 },
  isLoading: false,
  error: null
}

export const useTreeStore = create<TreeStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCurrentTree: (tree) => set({ currentTree: tree }),

      setMembers: (members) => set({ members }),

      setRelationships: (relationships) => set({ relationships }),

      setDerivedRelationships: (relationships) => set({ derivedRelationships: relationships }),

      addMember: (member) => set((state) => ({
        members: [...state.members, member]
      })),

      updateMember: (memberId, updates) => set((state) => ({
        members: state.members.map(member =>
          member.id === memberId ? { ...member, ...updates } : member
        )
      })),

      removeMember: (memberId) => set((state) => ({
        members: state.members.filter(member => member.id !== memberId),
        relationships: state.relationships.filter(
          rel => rel.a_id !== memberId && rel.b_id !== memberId
        ),
        derivedRelationships: state.derivedRelationships.filter(
          rel => rel.from !== memberId && rel.to !== memberId
        )
      })),

      addRelationship: (relationship) => set((state) => ({
        relationships: [...state.relationships, relationship]
      })),

      removeRelationship: (relationshipId) => set((state) => ({
        relationships: state.relationships.filter(rel => rel.id !== relationshipId)
      })),

      setSelectedMember: (member) => set({ selectedMember: member }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setZoom: (zoom) => set({ zoom }),

      setPan: (pan) => set({ pan }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      reset: () => set(initialState)
    }),
    {
      name: 'tree-store'
    }
  )
)
