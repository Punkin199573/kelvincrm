import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  email: string
  full_name: string | null
  tier: "frost_fan" | "blizzard_vip" | "avalanche_backstage"
  is_admin: boolean
  avatar_url: string | null
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export type Event = {
  id: string
  title: string
  description: string | null
  event_type: "concert" | "meet_greet" | "exclusive" | "virtual"
  date: string
  location: string | null
  price: number
  max_attendees: number | null
  current_attendees: number
  image_url: string | null
  is_exclusive: boolean
  required_tier: "frost_fan" | "blizzard_vip" | "avalanche_backstage"
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  in_stock: boolean
  stock_quantity: number
  is_exclusive: boolean
  required_tier: "frost_fan" | "blizzard_vip" | "avalanche_backstage"
  sizes: string[] | null
  colors: string[] | null
  image_url: string | null
  stripe_price_id: string | null
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  user_id: string
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  total_amount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shipping_address: any
  created_at: string
  updated_at: string
}

export type PrivateSession = {
  id: string
  user_id: string
  session_date: string
  duration_minutes: number
  call_method: "whatsapp" | "signal" | "daily"
  status: "pending" | "confirmed" | "completed" | "cancelled"
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  amount: number
  daily_room_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type Content = {
  id: string
  title: string
  description: string | null
  content_type: string
  content_url: string | null
  thumbnail_url: string | null
  required_tier: "frost_fan" | "blizzard_vip" | "avalanche_backstage"
  is_featured: boolean
  created_at: string
  updated_at: string
}
