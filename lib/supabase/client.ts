import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// TypeScript types for database tables
export type Profile = {
  id: string
  email: string
  full_name: string | null
  tier: "frost_fan" | "blizzard_vip" | "avalanche_backstage"
  subscription_status: string | null
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
  session_type: string
  session_date: string
  session_time: string
  duration_minutes: number
  platform: "whatsapp" | "signal" | "zoom" | "daily"
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

export type MeetGreetSession = {
  id: string
  title: string
  description: string | null
  session_date: string
  duration_minutes: number
  max_participants: number
  current_participants: number
  session_type: "group" | "private"
  required_tier: "frost_fan" | "blizzard_vip" | "avalanche_backstage"
  price: number
  is_active: boolean
  daily_room_url: string | null
  created_at: string
  updated_at: string
}

export type SessionSlot = {
  id: string
  session_type: string
  session_date: string
  duration_minutes: number
  price: number
  max_bookings: number
  current_bookings: number
  is_available: boolean
  description: string | null
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

export type Image = {
  id: string
  name: string
  url: string
  category: string
  alt_text: string | null
  file_size: number | null
  dimensions: any
  upload_thing_key: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ActiveVideoSession = {
  id: string
  user_id: string
  session_id: string
  is_admin: boolean
  joined_at: string
  left_at: string | null
  session_data: any
}

export type EventRegistration = {
  id: string
  event_id: string
  user_id: string
  registration_date: string
  payment_status: string
  stripe_payment_intent_id: string | null
  amount_paid: number | null
  additional_info: any
}

export type WebsiteSetting = {
  id: string
  key: string
  value: any
  description: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

// Helper functions for common database operations with proper error handling
export const dbHelpers = {
  // Get user profile safely without recursion
  async getUserProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Unexpected error fetching user profile:", error)
      return null
    }
  },

  // Get products with safe tier filtering
  async getProducts(userTier?: string): Promise<Product[]> {
    try {
      let query = supabase
        .from("products")
        .select("*")
        .eq("in_stock", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })

      // Simple tier filtering without complex joins
      if (userTier) {
        query = query.or(`tier_visibility.cs.{${userTier}},tier_visibility.eq.{}`)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching products:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Unexpected error fetching products:", error)
      return []
    }
  },

  // Get content with safe tier filtering
  async getContent(userTier?: string): Promise<Content[]> {
    try {
      let query = supabase
        .from("content")
        .select("*")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })

      if (userTier) {
        const tierHierarchy = {
          frost_fan: ["frost_fan"],
          blizzard_vip: ["frost_fan", "blizzard_vip"],
          avalanche_backstage: ["frost_fan", "blizzard_vip", "avalanche_backstage"],
        }

        const allowedTiers = tierHierarchy[userTier as keyof typeof tierHierarchy] || ["frost_fan"]
        query = query.in("required_tier", allowedTiers)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching content:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Unexpected error fetching content:", error)
      return []
    }
  },

  // Get images by category safely
  async getImagesByCategory(category: string): Promise<Image[]> {
    try {
      const { data, error } = await supabase
        .from("images")
        .select("*")
        .eq("category", category)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching images:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Unexpected error fetching images:", error)
      return []
    }
  },

  // Get events safely
  async getEvents(): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("start_date", { ascending: true })

      if (error) {
        console.error("Error fetching events:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Unexpected error fetching events:", error)
      return []
    }
  },

  // Get meet greet sessions safely
  async getMeetGreetSessions(): Promise<MeetGreetSession[]> {
    try {
      const { data, error } = await supabase
        .from("meet_greet_sessions")
        .select("*")
        .eq("is_active", true)
        .gte("session_date", new Date().toISOString())
        .order("session_date", { ascending: true })

      if (error) {
        console.error("Error fetching meet greet sessions:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Unexpected error fetching meet greet sessions:", error)
      return []
    }
  },

  // Get website settings safely
  async getWebsiteSettings(): Promise<Record<string, any>> {
    try {
      const { data, error } = await supabase.from("website_settings").select("key, value")

      if (error) {
        console.error("Error fetching website settings:", error)
        return {}
      }

      const settings: Record<string, any> = {}
      data?.forEach((setting) => {
        settings[setting.key] = setting.value
      })

      return settings
    } catch (error) {
      console.error("Unexpected error fetching website settings:", error)
      return {}
    }
  },
}
