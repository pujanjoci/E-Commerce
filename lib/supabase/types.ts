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
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          image_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'> & Partial<Pick<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>>
        Update: Partial<Database['public']['Tables']['categories']['Row']>
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          category_id: string | null
          images: string[]
          is_active: boolean
          stock: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'> & Partial<Pick<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>>
        Update: Partial<Database['public']['Tables']['products']['Row']>
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          role: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at'> & Partial<Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at'>>
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
        Relationships: []
      }
      users: {
        Row: {
          id: string
          auth_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'> & Partial<Pick<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>>
        Update: Partial<Database['public']['Tables']['users']['Row']>
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      admin_users: {
        Row: {
          id: string
          user_id: string
          is_super_admin: boolean
          /** Plain-text dev bypass key. Matches ADMIN_TEST_KEY env var. */
          test_key: string | null
          /** bcrypt hash of the numeric verification key (plain: 20260409). */
          verification_key: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'id' | 'created_at'> & Partial<Pick<Database['public']['Tables']['admin_users']['Row'], 'id' | 'created_at'>>
        Update: Partial<Database['public']['Tables']['admin_users']['Row']>
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total_amount: number
          status: string
          stripe_payment_intent_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at'> & Partial<Pick<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at'>>
        Update: Partial<Database['public']['Tables']['orders']['Row']>
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          price_at_purchase: number
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'> & Partial<Pick<Database['public']['Tables']['order_items']['Row'], 'id'>>
        Update: Partial<Database['public']['Tables']['order_items']['Row']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row'] & {
  categories?: Category | null
}
export type User = Database['public']['Tables']['users']['Row']
export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']

export interface CartItem {
  id: string
  name: string
  price: number
  image_url: string | null
  quantity: number
  slug: string
}
