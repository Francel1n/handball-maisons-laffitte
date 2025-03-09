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
      players: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          is_admin?: boolean
          created_at?: string
        }
      }
      trainings: {
        Row: {
          id: string
          title: string
          date: string
          location: string
          description: string | null
          is_recurring: boolean
          recurrence_pattern: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          title: string
          date: string
          location: string
          description?: string | null
          is_recurring?: boolean
          recurrence_pattern?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          date?: string
          location?: string
          description?: string | null
          is_recurring?: boolean
          recurrence_pattern?: string | null
          created_at?: string
          created_by?: string | null
        }
      }
      attendance: {
        Row: {
          id: string
          player_id: string
          training_id: string
          status: 'present' | 'absent'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          training_id: string
          status: 'present' | 'absent'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          training_id?: string
          status?: 'present' | 'absent'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}