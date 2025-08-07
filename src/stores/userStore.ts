import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { User, Tree, Permission, UserState } from '@/types'

interface UserStore extends UserState {
  // Actions
  setUser: (user: User | null) => void
  setTrees: (trees: Tree[]) => void
  setCurrentTree: (tree: Tree | null) => void
  setPermissions: (permissions: Permission[]) => void
  addTree: (tree: Tree) => void
  updateTree: (treeId: string, updates: Partial<Tree>) => void
  removeTree: (treeId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState: UserState = {
  user: null,
  trees: [],
  currentTree: null,
  permissions: [],
  isLoading: false,
  error: null
}

export const useUserStore = create<UserStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      setTrees: (trees) => set({ trees }),

      setCurrentTree: (tree) => set({ currentTree: tree }),

      setPermissions: (permissions) => set({ permissions }),

      addTree: (tree) => set((state) => ({
        trees: [tree, ...state.trees]
      })),

      updateTree: (treeId, updates) => set((state) => ({
        trees: state.trees.map(tree =>
          tree.id === treeId ? { ...tree, ...updates } : tree
        ),
        currentTree: state.currentTree?.id === treeId 
          ? { ...state.currentTree, ...updates }
          : state.currentTree
      })),

      removeTree: (treeId) => set((state) => ({
        trees: state.trees.filter(tree => tree.id !== treeId),
        currentTree: state.currentTree?.id === treeId ? null : state.currentTree
      })),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      reset: () => set(initialState)
    }),
    {
      name: 'user-store'
    }
  )
)
