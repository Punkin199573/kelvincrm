import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export type UserTier = "frost_fan" | "blizzard_vip" | "avalanche_backstage"
export type ProductCategory = "apparel" | "accessories" | "music" | "collectibles"
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"

export interface Profile {
  id: string
  email: string
  full_name?: string
  tier: UserTier
  stripe_customer_id?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  image_url?: string
  category: ProductCategory
  tier_visibility: UserTier[]
  in_stock: boolean
  is_exclusive: boolean
  sizes: string[]
  colors: string[]
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  stripe_payment_intent_id?: string
  total_amount: number
  status: OrderStatus
  shipping_address?: any
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  size?: string
  color?: string
  created_at: string
}

export interface Image {
  id: string
  name: string
  url: string
  category: string
  alt_text?: string
  created_at: string
  updated_at: string
}
