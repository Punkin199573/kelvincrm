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
  phone: string | null
  address: any
  preferences: any
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  category: "apparel" | "accessories" | "music" | "collectibles"
  in_stock: boolean
  stock_quantity: number
  is_exclusive: boolean
  tier_visibility: string[]
  sizes: string[]
  colors: string[]
  image_url: string | null
  additional_images: string[]
  stripe_price_id: string | null
  weight: number | null
  dimensions: any
  tags: string[]
  featured: boolean
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  user_id: string
  order_number: string
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  total_amount: number
  subtotal: number
  tax_amount: number
  shipping_amount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shipping_address: any
  billing_address: any
  tracking_number: string | null
  shipped_at: string | null
  delivered_at: string | null
  notes: string | null
  items: any[]
  created_at: string
  updated_at: string
}

export type Event = {
  id: string
  title: string
  description: string | null
  event_type: "concert" | "meet_greet" | "exclusive" | "virtual"
  start_date: string
  end_date: string | null
  location: string | null
  virtual_link: string | null
  price: number
  max_attendees: number | null
  current_attendees: number
  image_url: string | null
  gallery_images: string[]
  is_exclusive: boolean
  required_tier: "frost_fan" | "blizzard_vip" | "avalanche_backstage"
  is_active: boolean
  registration_deadline: string | null
  cancellation_policy: string | null
  additional_info: any
  created_at: string
  updated_at: string
}

export type SessionBooking = {
  id: string
  user_id: string
  session_date: string
  duration_minutes: number
  call_method: "whatsapp" | "signal" | "daily"
  status: "pending" | "confirmed" | "completed" | "cancelled"
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  amount_paid: number
  daily_room_url: string | null
  contact_info: any
  special_requests: string | null
  admin_notes: string | null
  reminder_sent: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type Content = {
  id: string
  title: string
  description: string | null
  content_type: "video" | "audio" | "image" | "text"
  content_url: string | null
  thumbnail_url: string | null
  duration: number | null
  file_size: number | null
  required_tier: "frost_fan" | "blizzard_vip" | "avalanche_backstage"
  is_featured: boolean
  is_published: boolean
  view_count: number
  tags: string[]
  metadata: any
  created_at: string
  updated_at: string
}
