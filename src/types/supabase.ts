export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Trees: {
        Row: {
          id: string
          name: string
          admin_user: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          admin_user: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          admin_user?: string
          created_at?: string
        }
      }
      Members: {
        Row: {
          id: string
          tree_id: string
          name: string
          birthdate: string | null
          photo_path: string | null
          summary: string | null
          location: string | null
           gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
           position_x: number | null
           position_y: number | null
          created_at: string
        }
        Insert: {
          id?: string
          tree_id: string
          name: string
          birthdate?: string | null
          photo_path?: string | null
          summary?: string | null
          location?: string | null
           gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
           position_x?: number | null
           position_y?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          tree_id?: string
          name?: string
          birthdate?: string | null
          photo_path?: string | null
          summary?: string | null
          location?: string | null
           gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
           position_x?: number | null
           position_y?: number | null
          created_at?: string
        }
      }
      Relationships: {
        Row: {
          id: string
          tree_id: string
          a_id: string
          b_id: string
          type: 'parent' | 'spouse' | 'sibling'
          created_at: string
        }
        Insert: {
          id?: string
          tree_id: string
          a_id: string
          b_id: string
          type: 'parent' | 'spouse' | 'sibling'
          created_at?: string
        }
        Update: {
          id?: string
          tree_id?: string
          a_id?: string
          b_id?: string
          type?: 'parent' | 'spouse' | 'sibling'
          created_at?: string
        }
      }
      Invites: {
        Row: {
          id: string
          tree_id: string
          token: string
          expires_at: string
          role: string
          accepted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tree_id: string
          token: string
          expires_at: string
          role?: string
          accepted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          tree_id?: string
          token?: string
          expires_at?: string
          role?: string
          accepted?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
